<template>
  <div class="monitor-view">
    <div v-if="!currentSession" class="monitor-card">
      <h1 class="monitor-title">{{ t('monitor.noSession', 'Keine Session ausgewählt') }}</h1>
      <div class="session-selector">
        <button
          v-for="session in topSessions"
          :key="session.id"
          @click="selectSession(session.id)"
          class="btn btn-large"
        >
          {{ session.title }}
        </button>
      </div>
    </div>

    <div v-else class="monitor-card">
      <h1 class="monitor-title">{{ currentSession.title }}</h1>

      <div class="monitor-presenter">{{ currentSession.presenter }}</div>

      <div class="monitor-description" v-if="currentSession.description">
        {{ currentSession.description }}
      </div>

      <div class="monitor-meta">
        <div class="meta-item">
          <span class="meta-icon">⏱️</span>
          <span>{{ currentSession.duration }} {{ t('monitor.minutes', 'Minuten') }}</span>
        </div>
      </div>

      <div v-if="currentSession.infrastructure.length > 0" class="monitor-infrastructure-section">
        <h3>{{ t('monitor.requiredInfrastructure') }}</h3>
        <div class="monitor-infrastructure">
          <div
            v-for="infra in currentSession.infrastructure"
            :key="infra"
            class="infrastructure-item"
          >
            <span class="infra-icon">{{ getInfraIcon(infra) }}</span>
            <span>{{ t(`infrastructure.${infra}`) }}</span>
          </div>
        </div>
      </div>

      <div class="monitor-votes-section">
        <div class="vote-label">{{ t('session.votes') }}</div>
        <div class="monitor-votes">♥ {{ currentSession.vote_count }}</div>
        <div class="vote-bar">
          <div class="vote-bar-fill" :style="{ width: votePercentage + '%' }"></div>
        </div>
        <div class="vote-percentage">{{ votePercentage.toFixed(0) }}% {{ t('monitor.interest') }}</div>
      </div>

      <button @click="currentSession = null" class="btn btn-secondary btn-back">
        {{ t('monitor.backToList', 'Zurück zur Liste') }}
      </button>

      <button @click="nextSession" class="btn next-button" v-if="topSessions.length > 1">
        {{ t('monitor.next', 'Nächste Session') }} →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session';
import { InfrastructureIcons } from '../types';
import type { InfrastructureType, SessionWithSchedule } from '../types';

const { t } = useI18n();
const sessionStore = useSessionStore();

const currentSession = ref<SessionWithSchedule | null>(null);
const eventId = ref('c0368715-a2f5-4e19-91db-653799c1ed2f');

const sessions = computed(() => sessionStore.sessions);
const topSessions = computed(() => sessionStore.sortedSessions.slice(0, 20));

const maxVotes = computed(() => {
  if (sessions.value.length === 0) return 1;
  return Math.max(...sessions.value.map((s) => s.vote_count));
});

const votePercentage = computed(() => {
  if (!currentSession.value) return 0;
  return (currentSession.value.vote_count / maxVotes.value) * 100;
});

function getInfraIcon(type: InfrastructureType): string {
  return InfrastructureIcons[type] || '';
}

function selectSession(id: string) {
  const session = sessions.value.find((s) => s.id === id);
  if (session) {
    currentSession.value = session;
  }
}

function nextSession() {
  if (!currentSession.value) return;

  const currentIndex = topSessions.value.findIndex((s) => s.id === currentSession.value!.id);
  const nextIndex = (currentIndex + 1) % topSessions.value.length;
  currentSession.value = topSessions.value[nextIndex];
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.monitor-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  max-width: 1200px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
}

.monitor-title {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.2;
  color: var(--text-primary);
}

.monitor-presenter {
  font-size: 2rem;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 500;
}

.monitor-description {
  font-size: 1.5rem;
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.monitor-meta {
  display: flex;
  justify-content: center;
  gap: 3rem;
  font-size: 1.5rem;
  margin-bottom: 3rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.meta-icon {
  font-size: 2rem;
}

.monitor-infrastructure-section {
  margin-bottom: 3rem;
  text-align: center;
}

.monitor-infrastructure-section h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.monitor-infrastructure {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.infrastructure-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 16px;
  font-size: 1.75rem;
  font-weight: 600;
}

.infra-icon {
  font-size: 2.5rem;
}

.monitor-votes-section {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  margin-bottom: 2rem;
}

.vote-label {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.monitor-votes {
  font-size: 5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.vote-bar {
  background-color: rgba(255, 255, 255, 0.3);
  height: 20px;
  border-radius: 10px;
  overflow: hidden;
  margin: 1.5rem auto;
  max-width: 600px;
}

.vote-bar-fill {
  background-color: white;
  height: 100%;
  transition: width 0.5s ease;
  border-radius: 10px;
}

.vote-percentage {
  font-size: 1.75rem;
  font-weight: 600;
}

.session-selector {
  display: grid;
  gap: 1rem;
  margin-top: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.btn-large {
  font-size: 1.25rem;
  padding: 1.5rem 2rem;
  text-align: left;
}

.btn-back {
  margin-top: 2rem;
  width: 100%;
  font-size: 1.25rem;
}

.next-button {
  position: absolute;
  right: 3rem;
  top: 3rem;
  font-size: 1.25rem;
}

@media (max-width: 1024px) {
  .monitor-title {
    font-size: 2.5rem;
  }

  .monitor-presenter {
    font-size: 1.5rem;
  }

  .monitor-description {
    font-size: 1.25rem;
  }

  .monitor-votes {
    font-size: 4rem;
  }
}

@media (max-width: 768px) {
  .monitor-card {
    padding: 2rem;
  }

  .monitor-title {
    font-size: 2rem;
  }

  .monitor-presenter {
    font-size: 1.25rem;
  }

  .monitor-infrastructure {
    flex-direction: column;
    align-items: center;
  }

  .next-button {
    position: static;
    width: 100%;
    margin-top: 1rem;
  }
}
</style>
