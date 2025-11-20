import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Event, Room, TimeSlot, CreateRoomRequest, CreateTimeSlotRequest } from '../types';
import { eventsAPI, roomsAPI, timeSlotsAPI } from '../services/api';

export const useEventStore = defineStore('event', () => {
  const currentEvent = ref<Event | null>(null);
  const events = ref<Event[]>([]);
  const rooms = ref<Room[]>([]);
  const timeSlots = ref<TimeSlot[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchEvents() {
    loading.value = true;
    error.value = null;
    try {
      const response = await eventsAPI.getAll();
      events.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch events';
      console.error('Error fetching events:', err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchEvent(id: string) {
    loading.value = true;
    error.value = null;
    try {
      const response = await eventsAPI.getById(id);
      currentEvent.value = response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch event';
      console.error('Error fetching event:', err);
    } finally {
      loading.value = false;
    }
  }

  async function createEvent(data: { name: string; date: string }) {
    loading.value = true;
    error.value = null;
    try {
      const response = await eventsAPI.create(data);
      events.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.message || 'Failed to create event';
      console.error('Error creating event:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRooms(eventId: string) {
    try {
      const response = await roomsAPI.getAll(eventId);
      rooms.value = response.data;
    } catch (err: any) {
      console.error('Error fetching rooms:', err);
    }
  }

  async function fetchTimeSlots(eventId: string) {
    try {
      const response = await timeSlotsAPI.getAll(eventId);
      timeSlots.value = response.data;
    } catch (err: any) {
      console.error('Error fetching time slots:', err);
    }
  }

  async function createRoom(eventId: string, data: CreateRoomRequest) {
    try {
      const response = await roomsAPI.create(eventId, data);
      rooms.value.push(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Error creating room:', err);
      throw err;
    }
  }

  async function deleteRoom(roomId: string) {
    try {
      await roomsAPI.delete(roomId);
      rooms.value = rooms.value.filter(r => r.id !== roomId);
    } catch (err: any) {
      console.error('Error deleting room:', err);
      throw err;
    }
  }

  async function createTimeSlot(eventId: string, data: CreateTimeSlotRequest) {
    try {
      const response = await timeSlotsAPI.create(eventId, data);
      timeSlots.value.push(response.data);
      return response.data;
    } catch (err: any) {
      console.error('Error creating time slot:', err);
      throw err;
    }
  }

  async function deleteTimeSlot(timeSlotId: string) {
    try {
      await timeSlotsAPI.delete(timeSlotId);
      timeSlots.value = timeSlots.value.filter(t => t.id !== timeSlotId);
    } catch (err: any) {
      console.error('Error deleting time slot:', err);
      throw err;
    }
  }

  return {
    currentEvent,
    events,
    rooms,
    timeSlots,
    loading,
    error,
    fetchEvents,
    fetchEvent,
    createEvent,
    fetchRooms,
    fetchTimeSlots,
    createRoom,
    deleteRoom,
    createTimeSlot,
    deleteTimeSlot
  };
});
