<template>
  <div class="container">
    <h1>{{ t('nav.schedule') }}</h1>

    <div v-if="sessions.length === 0" class="no-sessions">
      <p>{{ t('session.noSessions') }}</p>
    </div>

    <div v-else class="schedule-grid">
      <div v-for="session in scheduledSessions" :key="session.id" class="card session-card">
        <div v-if="session.scheduledSlot" class="schedule-info">
          <div class="time-slot">
            <strong>{{ formatTime(session.scheduledSlot.startTime) }}</strong> -
            {{ formatTime(session.scheduledSlot.endTime) }}
          </div>
          <div class="room-info">{{ session.scheduledSlot.roomName }}</div>
        </div>

        <h3 class="session-title">{{ session.title }}</h3>
        <div class="session-meta">
          {{ session.presenter }} · {{ session.duration }} {{ t('common.minutes', 'min') }}
        </div>

        <div class="infrastructure-tags">
          <span v-for="infra in session.infrastructure" :key="infra" class="infrastructure-tag">
            {{ getInfraIcon(infra) }} {{ t(`infrastructure.${infra}`) }}
          </span>
        </div>
      </div>

      <div class="card" v-if="unscheduledSessions.length > 0">
        <h3>{{ t('schedule.unscheduled', 'Noch nicht eingeplant') }}</h3>
        <ul class="unscheduled-list">
          <li v-for="session in unscheduledSessions" :key="session.id">
            {{ session.title }} ({{ session.vote_count }} {{ t('session.votes') }})
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session';
import { InfrastructureIcons } from '../types';
import type { InfrastructureType } from '../types';

const { t } = useI18n();
const sessionStore = useSessionStore();

const sessions = computed(() => sessionStore.sessions);

const scheduledSessions = computed(() =>
  sessions.value.filter((s) => s.scheduledSlot)
);

const unscheduledSessions = computed(() =>
  sessions.value.filter((s) => !s.scheduledSlot)
);

function getInfraIcon(type: InfrastructureType): string {
  return InfrastructureIcons[type] || '';
}

function formatTime(time: Date | string): string {
  const date = typeof time === 'string' ? new Date(time) : time;
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

onMounted(async () => {
  const eventId = '550e8400-e29b-41d4-a716-446655440000';
  await sessionStore.fetchSessions(eventId);
});
</script>

<style scoped>
.schedule-grid {
  display: grid;
  gap: 1.5rem;
}

.schedule-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
}

.time-slot {
  font-size: 1.125rem;
  color: var(--primary-color);
}

.room-info {
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-weight: 600;
}

.unscheduled-list {
  list-style: none;
  padding: 0;
}

.unscheduled-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
}

.unscheduled-list li:last-child {
  border-bottom: none;
}
</style>
