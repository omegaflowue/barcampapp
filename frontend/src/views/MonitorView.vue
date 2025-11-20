<template>
  <div class="monitor-view">
    <div class="monitor-card">
      <!-- Current Session -->
      <div class="current-session">
        <div class="session-header">
          <h1 class="monitor-title">{{ currentSession?.title || 'Keine Session ausgewählt' }}</h1>
          <div class="monitor-presenter">{{ currentSession?.presenter || '-' }}</div>
        </div>

        <div class="session-content">
          <!-- Description -->
          <div class="monitor-description" v-if="currentSession?.description">
            {{ currentSession.description }}
          </div>

          <!-- Meta Info - kompakt in einer Zeile -->
          <div class="monitor-meta">
            <div class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span>45 Min</span>
            </div>
            <div class="meta-item" v-if="currentSession?.infrastructure.length">
              <span class="meta-icon">🔧</span>
              <span v-for="infra in currentSession.infrastructure" :key="infra" class="infra-tag">
                {{ getInfraIcon(infra) }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">♥</span>
              <span class="vote-count">{{ displayVoteCount }}</span>
            </div>
          </div>

          <!-- Vote Buttons -->
          <div class="vote-section">
            <button
              @click="vote"
              :disabled="hasVoted"
              :class="['btn-vote', { 'voted': hasVoted }]"
            >
              <span class="vote-icon">{{ hasVoted ? '❤️' : '🤍' }}</span>
              <span>{{ hasVoted ? 'Interesse bekundet' : 'Interesse bekunden' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Next Session Preview - klein und dezent -->
      <div class="next-session-preview" v-if="nextSessionData">
        <span class="preview-label">Als nächstes: </span>
        <strong>{{ nextSessionData.title }}</strong>
        <span class="preview-presenter">({{ nextSessionData.presenter }})</span>
      </div>

      <!-- Close Button - unten links, klein und dezent -->
      <button @click="closeMonitor" class="btn-close" title="Monitor schließen">
        ✕ Schließen
      </button>

      <!-- Navigation -->
      <div class="monitor-navigation">
        <button @click="previousSession" class="btn btn-nav" :disabled="topSessions.length <= 1">
          ← Vorherige
        </button>
        <div class="session-counter">
          {{ currentSessionIndex + 1 }} / {{ topSessions.length }}
        </div>
        <button @click="nextSession" class="btn btn-nav" :disabled="topSessions.length <= 1">
          Nächste →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session';
import { InfrastructureIcons } from '../types';
import type { InfrastructureType, SessionWithSchedule } from '../types';

const { t } = useI18n();
const router = useRouter();
const sessionStore = useSessionStore();

const currentSession = ref<SessionWithSchedule | null>(null);
const eventId = ref('c0368715-a2f5-4e19-91db-653799c1ed2f');
const hasVoted = ref(false);

const sessions = computed(() => sessionStore.sessions);
const topSessions = computed(() => sessionStore.sortedSessions.slice(0, 20));

const currentSessionIndex = computed(() => {
  if (!currentSession.value) return -1;
  return topSessions.value.findIndex((s) => s.id === currentSession.value!.id);
});

const nextSessionData = computed(() => {
  if (currentSessionIndex.value === -1 || topSessions.value.length <= 1) return null;
  const nextIndex = (currentSessionIndex.value + 1) % topSessions.value.length;
  return topSessions.value[nextIndex];
});

function getInfraIcon(type: InfrastructureType): string {
  return InfrastructureIcons[type] || '';
}

function closeMonitor() {
  router.push('/sessions');
}

async function vote() {
  if (!currentSession.value || hasVoted.value) return;

  try {
    await sessionStore.voteSession(currentSession.value.id);
    hasVoted.value = true;

    // Update the current session data
    const updated = sessions.value.find(s => s.id === currentSession.value!.id);
    if (updated) {
      currentSession.value = updated;
    }
  } catch (err) {
    console.error('Error voting:', err);
  }
}

function nextSession() {
  if (topSessions.value.length <= 1) return;

  const nextIndex = (currentSessionIndex.value + 1) % topSessions.value.length;
  currentSession.value = topSessions.value[nextIndex];
  hasVoted.value = false; // Reset vote state for new session
}

function previousSession() {
  if (topSessions.value.length <= 1) return;

  const prevIndex = currentSessionIndex.value === 0
    ? topSessions.value.length - 1
    : currentSessionIndex.value - 1;
  currentSession.value = topSessions.value[prevIndex];
  hasVoted.value = false; // Reset vote state for new session
}

onMounted(async () => {
  await sessionStore.fetchSessions(eventId.value);

  // Auto-select first session
  if (topSessions.value.length > 0) {
    currentSession.value = topSessions.value[0];
  }
});
</script>

<style scoped>
.monitor-view {
  min-height: 100vh;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  overflow: hidden;
}

.monitor-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  height: calc(100vh - 3rem);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Close Button */
.btn-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 3rem;
  height: 3rem;
  border: none;
  background: #f44336;
  color: white;
  font-size: 1.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.btn-close:hover {
  background: #d32f2f;
  transform: scale(1.1);
}

/* Current Session */
.current-session {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: 1.5rem;
}

.session-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.monitor-title {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  line-height: 1.2;
  color: var(--text-primary);
  margin-top: 0;
}

.monitor-presenter {
  font-size: 1.5rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.session-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 0;
}

.monitor-description {
  font-size: 1.25rem;
  text-align: center;
  color: var(--text-primary);
  line-height: 1.5;
  overflow-y: auto;
  flex-shrink: 1;
  padding: 0 2rem;
}

.monitor-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2.5rem;
  font-size: 1.25rem;
  padding: 1rem;
  background: var(--surface);
  border-radius: 12px;
  flex-shrink: 0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-icon {
  font-size: 1.75rem;
}

.infra-tag {
  font-size: 1.5rem;
  margin-left: 0.25rem;
}

.vote-count {
  font-weight: 600;
  color: var(--accent-color);
  font-size: 1.5rem;
}

/* Vote Section */
.vote-section {
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.btn-vote {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 3rem;
  font-size: 1.5rem;
  font-weight: 600;
  border: 3px solid var(--primary-color);
  background: white;
  color: var(--primary-color);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-vote:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  transform: scale(1.05);
}

.btn-vote.voted {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.btn-vote:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.vote-icon {
  font-size: 2rem;
}

/* Next Session Preview */
.next-session-preview {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  flex-shrink: 0;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  opacity: 0.95;
  font-weight: 600;
}

.preview-icon {
  font-size: 1.5rem;
}

.preview-content {
  padding-left: 2.25rem;
}

.preview-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.preview-presenter {
  font-size: 1.125rem;
  opacity: 0.9;
}

/* Navigation */
.monitor-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-shrink: 0;
}

.btn-nav {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  flex: 1;
  max-width: 200px;
}

.btn-nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.session-counter {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 100px;
  text-align: center;
}

@media (max-width: 1200px) {
  .monitor-title {
    font-size: 2rem;
  }

  .monitor-presenter {
    font-size: 1.25rem;
  }

  .monitor-description {
    font-size: 1.125rem;
  }

  .preview-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 768px) {
  .monitor-card {
    padding: 1.5rem;
  }

  .monitor-title {
    font-size: 1.5rem;
  }

  .monitor-presenter {
    font-size: 1.125rem;
  }

  .monitor-meta {
    flex-direction: column;
    gap: 1rem;
  }

  .btn-vote {
    font-size: 1.25rem;
    padding: 1rem 2rem;
  }

  .monitor-navigation {
    flex-direction: column;
  }

  .btn-nav {
    max-width: 100%;
    width: 100%;
  }

  .session-counter {
    order: -1;
  }
}
</style>
