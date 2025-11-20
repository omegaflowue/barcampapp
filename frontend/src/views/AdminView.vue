<template>
  <div class="container">
    <h1>{{ t('admin.dashboard') }}</h1>

    <div class="admin-grid">
      <!-- Statistics -->
      <div class="card stats-card">
        <h2>{{ t('admin.statistics', 'Statistiken') }}</h2>
        <div class="stats">
          <div class="stat">
            <div class="stat-value">{{ sessions.length }}</div>
            <div class="stat-label">{{ t('nav.sessions') }}</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ totalVotes }}</div>
            <div class="stat-label">{{ t('session.votes') }}</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ rooms.length }}</div>
            <div class="stat-label">{{ t('admin.rooms') }}</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{ timeSlots.length }}</div>
            <div class="stat-label">{{ t('admin.timeSlots') }}</div>
          </div>
        </div>
      </div>

      <!-- Schedule Optimization -->
      <div class="card">
        <h2>{{ t('admin.scheduleManagement', 'Zeitplan-Verwaltung') }}</h2>

        <div class="action-buttons">
          <button @click="optimizeSchedule" class="btn" :disabled="optimizing">
            {{ optimizing ? t('common.loading') : t('admin.optimizeSchedule') }}
          </button>

          <button v-if="hasOptimizedSchedule" @click="publishSchedule" class="btn btn-accent">
            {{ t('admin.publishSchedule') }}
          </button>

          <button v-if="hasPublishedSchedule" @click="clearSchedule" class="btn btn-secondary">
            {{ t('admin.clearSchedule') }}
          </button>
        </div>

        <div v-if="optimizationMetrics" class="metrics">
          <h3>{{ t('admin.optimizationMetrics', 'Optimierungsmetriken') }}</h3>
          <div class="metric-item">
            <span>{{ t('admin.voteSatisfaction', 'Stimmen-Zufriedenheit') }}:</span>
            <strong>{{ (optimizationMetrics.voteSatisfaction * 100).toFixed(1) }}%</strong>
          </div>
          <div class="metric-item">
            <span>{{ t('admin.conflicts', 'Konflikte') }}:</span>
            <strong>{{ optimizationMetrics.conflicts }}</strong>
          </div>
          <div class="metric-item">
            <span>{{ t('admin.roomUtilization', 'Raum-Auslastung') }}:</span>
            <strong>{{ (optimizationMetrics.roomUtilization * 100).toFixed(1) }}%</strong>
          </div>
        </div>
      </div>

      <!-- Infrastructure Overview -->
      <div class="card">
        <h2>{{ t('admin.infrastructureOverview', 'Infrastruktur-Übersicht') }}</h2>
        <div class="infrastructure-stats">
          <div v-for="[type, count] in infrastructureNeeds" :key="type" class="infrastructure-stat">
            <span class="infra-icon">{{ getInfraIcon(type) }}</span>
            <span class="infra-label">{{ t(`infrastructure.${type}`) }}:</span>
            <strong>{{ count }} {{ t('nav.sessions') }}</strong>
          </div>
        </div>
      </div>

      <!-- Top Sessions -->
      <div class="card">
        <h2>{{ t('admin.topSessions', 'Top Sessions') }}</h2>
        <div class="top-sessions">
          <div v-for="(session, index) in topSessions" :key="session.id" class="top-session-item">
            <span class="rank">{{ index + 1 }}.</span>
            <div class="session-info">
              <strong>{{ session.title }}</strong>
              <span class="presenter">{{ session.presenter }}</span>
            </div>
            <span class="votes">{{ session.vote_count }} ♥</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session';
import { useEventStore } from '../stores/event';
import { scheduleAPI } from '../services/api';
import { InfrastructureIcons } from '../types';
import type { InfrastructureType, OptimizationMetrics, ScheduleProposal } from '../types';

const { t } = useI18n();
const sessionStore = useSessionStore();
const eventStore = useEventStore();

const eventId = ref('550e8400-e29b-41d4-a716-446655440000');
const optimizing = ref(false);
const optimizationMetrics = ref<OptimizationMetrics | null>(null);
const optimizedSchedule = ref<ScheduleProposal[]>([]);

const sessions = computed(() => sessionStore.sessions);
const rooms = computed(() => eventStore.rooms);
const timeSlots = computed(() => eventStore.timeSlots);

const totalVotes = computed(() =>
  sessions.value.reduce((sum, s) => sum + s.vote_count, 0)
);

const topSessions = computed(() =>
  [...sessions.value].sort((a, b) => b.vote_count - a.vote_count).slice(0, 10)
);

const infrastructureNeeds = computed(() => {
  const counts = new Map<InfrastructureType, number>();

  sessions.value.forEach((session) => {
    session.infrastructure.forEach((infra) => {
      counts.set(infra, (counts.get(infra) || 0) + 1);
    });
  });

  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
});

const hasOptimizedSchedule = computed(() => optimizedSchedule.value.length > 0);
const hasPublishedSchedule = computed(() => sessions.value.some((s) => s.scheduledSlot));

function getInfraIcon(type: InfrastructureType): string {
  return InfrastructureIcons[type] || '';
}

async function optimizeSchedule() {
  optimizing.value = true;

  try {
    const response = await scheduleAPI.optimize(eventId.value);
    optimizationMetrics.value = response.data.metrics;
    optimizedSchedule.value = response.data.schedule;

    alert(`Optimierung abgeschlossen!\n\nZufriedenheit: ${(response.data.metrics.voteSatisfaction * 100).toFixed(1)}%\nKonflikte: ${response.data.metrics.conflicts}`);
  } catch (err) {
    console.error('Error optimizing schedule:', err);
    alert('Fehler beim Optimieren des Zeitplans');
  } finally {
    optimizing.value = false;
  }
}

async function publishSchedule() {
  if (!confirm(t('admin.confirmPublish', 'Zeitplan veröffentlichen?'))) {
    return;
  }

  try {
    await scheduleAPI.publish(eventId.value, optimizedSchedule.value);
    await sessionStore.fetchSessions(eventId.value);
    alert(t('admin.schedulePublished', 'Zeitplan veröffentlicht!'));
  } catch (err) {
    console.error('Error publishing schedule:', err);
    alert('Fehler beim Veröffentlichen des Zeitplans');
  }
}

async function clearSchedule() {
  if (!confirm(t('admin.confirmClear', 'Zeitplan wirklich löschen?'))) {
    return;
  }

  try {
    await scheduleAPI.clear(eventId.value);
    await sessionStore.fetchSessions(eventId.value);
    optimizedSchedule.value = [];
    optimizationMetrics.value = null;
    alert(t('admin.scheduleCleared', 'Zeitplan gelöscht!'));
  } catch (err) {
    console.error('Error clearing schedule:', err);
    alert('Fehler beim Löschen des Zeitplans');
  }
}

onMounted(async () => {
  await Promise.all([
    sessionStore.fetchSessions(eventId.value),
    eventStore.fetchRooms(eventId.value),
    eventStore.fetchTimeSlots(eventId.value)
  ]);
});
</script>

<style scoped>
.admin-grid {
  display: grid;
  gap: 2rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.stat {
  text-align: center;
  padding: 1.5rem;
  background-color: var(--surface);
  border-radius: 8px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1.5rem 0;
}

.metrics {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--border);
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

.infrastructure-stats {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.infrastructure-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--surface);
  border-radius: 8px;
}

.infra-icon {
  font-size: 1.5rem;
}

.top-sessions {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.top-session-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background-color: var(--surface);
  border-radius: 8px;
}

.rank {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--primary-color);
  min-width: 2rem;
}

.session-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.presenter {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.votes {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--accent-color);
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
  }
}
</style>
