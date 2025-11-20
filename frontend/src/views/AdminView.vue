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

      <!-- Room Management -->
      <div class="card">
        <h2>{{ t('admin.roomManagement', 'Raum-Verwaltung') }}</h2>

        <div class="room-list">
          <div v-for="room in rooms" :key="room.id" class="room-item">
            <div class="room-info">
              <strong>{{ room.name }}</strong>
              <span class="capacity">{{ room.capacity }} Personen</span>
              <div class="room-infrastructure">
                <span v-for="infra in room.infrastructure" :key="infra" class="infra-badge">
                  {{ getInfraIcon(infra) }} {{ t(`infrastructure.${infra}`) }}
                </span>
              </div>
            </div>
            <button @click="deleteRoom(room.id)" class="btn btn-small btn-danger">Löschen</button>
          </div>
        </div>

        <div class="create-room-form">
          <h3>Neuen Raum erstellen</h3>
          <div class="form-group">
            <label>Name</label>
            <input v-model="newRoom.name" type="text" class="form-input" placeholder="Raum-Name" />
          </div>
          <div class="form-group">
            <label>Kapazität</label>
            <input v-model.number="newRoom.capacity" type="number" class="form-input" min="1" placeholder="Anzahl Personen" />
          </div>
          <div class="form-group">
            <label>Infrastruktur</label>
            <div class="infrastructure-checkboxes">
              <label v-for="infra in infrastructureTypes" :key="infra" class="infrastructure-checkbox">
                <input type="checkbox" :value="infra" v-model="newRoom.infrastructure" />
                {{ getInfraIcon(infra) }} {{ t(`infrastructure.${infra}`) }}
              </label>
            </div>
          </div>
          <button @click="createRoom" class="btn" :disabled="!newRoom.name || !newRoom.capacity">
            Raum erstellen
          </button>
        </div>
      </div>

      <!-- TimeSlot Management -->
      <div class="card">
        <h2>{{ t('admin.timeSlotManagement', 'Zeitslot-Verwaltung') }}</h2>

        <div class="timeslot-list">
          <div v-for="slot in sortedTimeSlots" :key="slot.id" class="timeslot-item">
            <div class="timeslot-info">
              <span class="timeslot-type">{{ getTimeSlotTypeIcon(slot.type) }} {{ t(`timeSlotType.${slot.type}`, slot.type) }}</span>
              <strong>{{ formatTime(slot.start_time) }} - {{ formatTime(slot.end_time) }}</strong>
              <span v-if="slot.label" class="timeslot-label">{{ slot.label }}</span>
            </div>
            <button @click="deleteTimeSlot(slot.id)" class="btn btn-small btn-danger">Löschen</button>
          </div>
        </div>

        <div class="create-timeslot-form">
          <h3>Neuen Zeitslot erstellen</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Startzeit</label>
              <input v-model="newTimeSlot.start_time" type="datetime-local" class="form-input" />
            </div>
            <div class="form-group">
              <label>Endzeit</label>
              <input v-model="newTimeSlot.end_time" type="datetime-local" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>Typ</label>
            <select v-model="newTimeSlot.type" class="form-input">
              <option value="SESSION">{{ t('timeSlotType.SESSION', 'Session') }}</option>
              <option value="BREAKFAST">{{ t('timeSlotType.BREAKFAST', 'Frühstück') }}</option>
              <option value="LUNCH">{{ t('timeSlotType.LUNCH', 'Mittagessen') }}</option>
              <option value="DINNER">{{ t('timeSlotType.DINNER', 'Abendessen') }}</option>
              <option value="BREAK">{{ t('timeSlotType.BREAK', 'Pause') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Label (optional)</label>
            <input v-model="newTimeSlot.label" type="text" class="form-input" placeholder="z.B. 'Session 1'" />
          </div>
          <button @click="createTimeSlot" class="btn" :disabled="!newTimeSlot.start_time || !newTimeSlot.end_time">
            Zeitslot erstellen
          </button>
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
import { InfrastructureIcons, TimeSlotTypeIcons } from '../types';
import type { InfrastructureType, OptimizationMetrics, ScheduleProposal, CreateRoomRequest, CreateTimeSlotRequest, TimeSlotType } from '../types';

const { t } = useI18n();
const sessionStore = useSessionStore();
const eventStore = useEventStore();

const eventId = ref('c0368715-a2f5-4e19-91db-653799c1ed2f');
const optimizing = ref(false);
const optimizationMetrics = ref<OptimizationMetrics | null>(null);
const optimizedSchedule = ref<ScheduleProposal[]>([]);

const infrastructureTypes: InfrastructureType[] = ['BEAMER', 'FLIPCHART', 'WHITEBOARD', 'MODERATION_KIT'];

const newRoom = ref<CreateRoomRequest>({
  name: '',
  capacity: 0,
  infrastructure: []
});

const newTimeSlot = ref<CreateTimeSlotRequest>({
  start_time: '',
  end_time: '',
  type: 'SESSION' as TimeSlotType,
  label: ''
});

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

const sortedTimeSlots = computed(() =>
  [...timeSlots.value].sort((a, b) =>
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )
);

function getInfraIcon(type: InfrastructureType): string {
  return InfrastructureIcons[type] || '';
}

function getTimeSlotTypeIcon(type: TimeSlotType): string {
  return TimeSlotTypeIcons[type] || '';
}

function formatTime(dateStr: Date | string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

async function createRoom() {
  try {
    await eventStore.createRoom(eventId.value, newRoom.value);
    newRoom.value = { name: '', capacity: 0, infrastructure: [] };
    alert('Raum erfolgreich erstellt!');
  } catch (err) {
    console.error('Error creating room:', err);
    alert('Fehler beim Erstellen des Raums');
  }
}

async function deleteRoom(roomId: string) {
  if (!confirm('Raum wirklich löschen?')) return;

  try {
    await eventStore.deleteRoom(roomId);
    alert('Raum gelöscht!');
  } catch (err) {
    console.error('Error deleting room:', err);
    alert('Fehler beim Löschen des Raums');
  }
}

async function createTimeSlot() {
  try {
    await eventStore.createTimeSlot(eventId.value, newTimeSlot.value);
    newTimeSlot.value = { start_time: '', end_time: '', type: 'SESSION', label: '' };
    alert('Zeitslot erfolgreich erstellt!');
  } catch (err) {
    console.error('Error creating time slot:', err);
    alert('Fehler beim Erstellen des Zeitslots');
  }
}

async function deleteTimeSlot(timeSlotId: string) {
  if (!confirm('Zeitslot wirklich löschen?')) return;

  try {
    await eventStore.deleteTimeSlot(timeSlotId);
    alert('Zeitslot gelöscht!');
  } catch (err) {
    console.error('Error deleting time slot:', err);
    alert('Fehler beim Löschen des Zeitslots');
  }
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

/* Room Management */
.room-list,
.timeslot-list {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.room-item,
.timeslot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--surface);
  border-radius: 8px;
}

.room-info,
.timeslot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.capacity {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.room-infrastructure {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.infra-badge {
  padding: 0.25rem 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
}

.timeslot-type {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  display: inline-block;
}

.timeslot-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.create-room-form,
.create-timeslot-form {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid var(--border);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.infrastructure-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.infrastructure-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
}

.infrastructure-checkbox:hover {
  border-color: var(--primary-color);
  background-color: var(--surface);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .btn {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .room-item,
  .timeslot-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-small {
    width: 100%;
  }
}
</style>
