<template>
  <div class="container">
    <h1>{{ t('nav.schedule') }}</h1>

    <div v-if="loading" class="loading">
      {{ t('common.loading') }}
    </div>

    <div v-else-if="timeSlots.length === 0 || rooms.length === 0" class="no-schedule">
      <p>Noch kein Zeitplan verfügbar. Bitte erstellen Sie zuerst Räume und Zeitslots im Admin-Bereich.</p>
    </div>

    <div v-else class="schedule-wrapper">
      <table class="schedule-table">
        <thead>
          <tr>
            <th class="time-header">Zeit</th>
            <th v-for="room in rooms" :key="room.id" class="room-header">
              <div class="room-name">{{ room.name }}</div>
              <div class="room-capacity">{{ room.capacity }} Personen</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in sortedTimeSlots" :key="slot.id">
            <!-- Time column -->
            <td class="time-cell">
              <div class="time-range">
                <strong>{{ formatTime(slot.start_time) }}</strong>
                <span>-</span>
                <strong>{{ formatTime(slot.end_time) }}</strong>
              </div>
              <div v-if="slot.label" class="slot-label">{{ slot.label }}</div>
            </td>

            <!-- Meal/Break slots span all rooms -->
            <td
              v-if="slot.type !== 'SESSION'"
              :colspan="rooms.length"
              :class="['meal-cell', `meal-${slot.type.toLowerCase()}`]"
            >
              <div class="meal-content">
                <span class="meal-icon">{{ getTimeSlotTypeIcon(slot.type) }}</span>
                <span class="meal-label">{{ slot.label || t(`timeSlotType.${slot.type}`, slot.type) }}</span>
              </div>
            </td>

            <!-- Session slots show individual room assignments -->
            <template v-else>
              <td v-for="room in rooms" :key="room.id" class="session-cell">
                <div
                  v-if="getSessionForSlot(slot.id, room.id)"
                  class="session-content"
                  :class="{ 'has-conflicts': checkInfrastructureConflicts(getSessionForSlot(slot.id, room.id)!, room) }"
                >
                  <div class="session-title">{{ getSessionForSlot(slot.id, room.id)?.title }}</div>
                  <div class="session-presenter">{{ getSessionForSlot(slot.id, room.id)?.presenter }}</div>
                  <div class="session-votes">{{ getSessionForSlot(slot.id, room.id)?.vote_count }} ♥</div>
                  <div v-if="getSessionForSlot(slot.id, room.id)?.infrastructure.length" class="session-infra">
                    <span v-for="infra in getSessionForSlot(slot.id, room.id)?.infrastructure" :key="infra" class="infra-icon">
                      {{ getInfraIcon(infra) }}
                    </span>
                  </div>
                </div>
                <div v-else class="empty-cell">
                  <span class="empty-text">-</span>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>

      <!-- Unscheduled Sessions -->
      <div v-if="unscheduledSessions.length > 0" class="card unscheduled-section">
        <h3>{{ t('schedule.unscheduled', 'Noch nicht eingeplant') }}</h3>
        <div class="unscheduled-grid">
          <div v-for="session in unscheduledSessions" :key="session.id" class="unscheduled-item">
            <strong>{{ session.title }}</strong>
            <span class="unscheduled-meta">
              {{ session.presenter }} · {{ session.vote_count }} {{ t('session.votes') }}
            </span>
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
import { InfrastructureIcons, TimeSlotTypeIcons } from '../types';
import type { InfrastructureType, TimeSlotType, Room } from '../types';

const { t } = useI18n();
const sessionStore = useSessionStore();
const eventStore = useEventStore();

const eventId = ref('c0368715-a2f5-4e19-91db-653799c1ed2f');
const loading = ref(true);

const sessions = computed(() => sessionStore.sessions);
const rooms = computed(() => eventStore.rooms);
const timeSlots = computed(() => eventStore.timeSlots);

const sortedTimeSlots = computed(() =>
  [...timeSlots.value].sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )
);

const scheduledSessions = computed(() =>
  sessions.value.filter((s) => s.scheduledSlot)
);

const unscheduledSessions = computed(() =>
  sessions.value.filter((s) => !s.scheduledSlot)
);

function getInfraIcon(type: InfrastructureType): string {
  return InfrastructureIcons[type] || '';
}

function getTimeSlotTypeIcon(type: TimeSlotType): string {
  return TimeSlotTypeIcons[type] || '';
}

function formatTime(time: Date | string): string {
  const date = typeof time === 'string' ? new Date(time) : time;
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function getSessionForSlot(timeSlotId: string, roomId: string) {
  return scheduledSessions.value.find(
    (s) => s.scheduledSlot?.timeSlotId === timeSlotId && s.scheduledSlot?.roomId === roomId
  );
}

function checkInfrastructureConflicts(session: any, room: Room): boolean {
  if (!session.infrastructure || session.infrastructure.length === 0) return false;
  return !session.infrastructure.every((infra: InfrastructureType) =>
    room.infrastructure.includes(infra)
  );
}

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      sessionStore.fetchSessions(eventId.value),
      eventStore.fetchRooms(eventId.value),
      eventStore.fetchTimeSlots(eventId.value)
    ]);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.loading,
.no-schedule {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.schedule-wrapper {
  overflow-x: auto;
  margin-top: 2rem;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.schedule-table th,
.schedule-table td {
  border: 1px solid var(--border);
  padding: 1rem;
  vertical-align: top;
}

.time-header {
  background-color: var(--primary-color);
  color: white;
  font-weight: 600;
  text-align: center;
  min-width: 120px;
}

.room-header {
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  min-width: 200px;
}

.room-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.room-capacity {
  font-size: 0.875rem;
  opacity: 0.9;
}

.time-cell {
  background-color: var(--surface);
  text-align: center;
  font-weight: 500;
}

.time-range {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.time-range span {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.slot-label {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: normal;
}

.meal-cell {
  text-align: center;
  font-weight: 600;
  padding: 1.5rem;
}

.meal-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 1.125rem;
}

.meal-icon {
  font-size: 1.5rem;
}

.meal-breakfast {
  background-color: #fff3cd;
  color: #856404;
}

.meal-lunch {
  background-color: #d1ecf1;
  color: #0c5460;
}

.meal-dinner {
  background-color: #f8d7da;
  color: #721c24;
}

.meal-break {
  background-color: #e2e3e5;
  color: #383d41;
}

.session-cell {
  background-color: white;
  padding: 0.75rem;
}

.session-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--surface);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
  min-height: 100px;
}

.session-content.has-conflicts {
  border-left-color: #dc3545;
  background-color: #fff5f5;
}

.session-title {
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.3;
}

.session-presenter {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.session-votes {
  font-size: 0.875rem;
  color: var(--accent-color);
  font-weight: 600;
}

.session-infra {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.infra-icon {
  font-size: 1rem;
}

.empty-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  color: var(--text-secondary);
  opacity: 0.5;
}

.empty-text {
  font-size: 1.5rem;
}

.unscheduled-section {
  margin-top: 3rem;
}

.unscheduled-grid {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.unscheduled-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: var(--surface);
  border-radius: 8px;
  border-left: 4px solid var(--text-secondary);
}

.unscheduled-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .schedule-table {
    font-size: 0.875rem;
  }

  .schedule-table th,
  .schedule-table td {
    padding: 0.5rem;
  }

  .room-header {
    min-width: 150px;
  }

  .session-content {
    min-height: 80px;
    padding: 0.5rem;
  }
}
</style>
