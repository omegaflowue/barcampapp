<template>
  <div class="container">
    <div class="sessions-header">
      <h1>{{ t('nav.sessions') }}</h1>
      <input type="text" v-model="searchQuery" :placeholder="t('common.search')" class="form-input search-input" />
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="filteredSessions.length === 0" class="no-sessions">
      <p>{{ t('session.noSessions') }}</p>
    </div>

    <div v-else class="sessions-grid">
      <div v-for="session in filteredSessions" :key="session.id" class="card session-card">
        <div class="session-header">
          <div>
            <h3 class="session-title">{{ session.title }}</h3>
            <div class="session-meta">
              {{ session.presenter }} · {{ session.duration }} {{ t('common.minutes', 'min') }}
            </div>
          </div>
        </div>

        <p class="session-description">{{ session.description }}</p>

        <div class="session-footer">
          <div class="infrastructure-tags">
            <span v-for="infra in session.infrastructure" :key="infra" class="infrastructure-tag">
              {{ getInfraIcon(infra) }} {{ t(`infrastructure.${infra}`) }}
            </span>
          </div>

          <button
            @click="toggleVote(session.id)"
            class="vote-button"
            :class="{ voted: hasVoted(session.id) }"
          >
            <span class="vote-icon">{{ hasVoted(session.id) ? '♥' : '♡' }}</span>
            <span class="vote-count">{{ session.vote_count }}</span>
          </button>
        </div>
      </div>
    </div>

    <button @click="goToCreate" class="fab">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session';
import { InfrastructureIcons } from '../types';
import type { InfrastructureType } from '../types';

const router = useRouter();
const { t } = useI18n();
const sessionStore = useSessionStore();

const searchQuery = ref('');

// Hardcoded event ID for demo (in production, this would come from route or store)
const eventId = ref('c0368715-a2f5-4e19-91db-653799c1ed2f');

const loading = computed(() => sessionStore.loading);
const error = computed(() => sessionStore.error);

const filteredSessions = computed(() => {
  const query = searchQuery.value.toLowerCase();
  if (!query) return sessionStore.sortedSessions;

  return sessionStore.sortedSessions.filter(
    (session) =>
      session.title.toLowerCase().includes(query) ||
      session.description.toLowerCase().includes(query) ||
      session.presenter.toLowerCase().includes(query)
  );
});

function getInfraIcon(type: InfrastructureType): string {
  return InfrastructureIcons[type] || '';
}

function hasVoted(sessionId: string): boolean {
  return sessionStore.hasVoted(sessionId);
}

async function toggleVote(sessionId: string) {
  try {
    if (hasVoted(sessionId)) {
      await sessionStore.unvote(sessionId);
    } else {
      await sessionStore.vote(sessionId);
    }
  } catch (err) {
    console.error('Error toggling vote:', err);
  }
}

function goToCreate() {
  router.push('/sessions/create');
}

onMounted(async () => {
  // In a real app, fetch the current event ID first
  await sessionStore.fetchSessions(eventId.value);
});
</script>

<style scoped>
.sessions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.search-input {
  max-width: 300px;
}

.sessions-grid {
  display: grid;
  gap: 1.5rem;
}

.no-sessions {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.error-message {
  padding: 1rem;
  background-color: #fee;
  border-left: 4px solid #f00;
  color: #c00;
  border-radius: 4px;
}

.vote-icon {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .sessions-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    max-width: 100%;
    width: 100%;
  }
}
</style>
