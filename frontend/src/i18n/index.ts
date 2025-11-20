import { createI18n } from 'vue-i18n';

const messages = {
  de: {
    nav: {
      sessions: 'Sessions',
      schedule: 'Zeitplan',
      mySessions: 'Meine Sessions',
      admin: 'Admin',
      monitor: 'Monitor'
    },
    session: {
      create: 'Session erstellen',
      title: 'Titel',
      description: 'Beschreibung',
      presenter: 'Vortragende',
      duration: 'Dauer',
      infrastructure: 'Benötigte Infrastruktur',
      vote: 'Abstimmen',
      voted: 'Abgestimmt',
      votes: 'Stimmen',
      submit: 'Session einreichen',
      edit: 'Bearbeiten',
      delete: 'Löschen',
      noSessions: 'Noch keine Sessions vorhanden'
    },
    infrastructure: {
      BEAMER: 'Beamer',
      FLIPCHART: 'Flipchart',
      WHITEBOARD: 'Whiteboard',
      MODERATION_KIT: 'Moderationskoffer'
    },
    duration: {
      30: '30 Minuten',
      45: '45 Minuten',
      60: '60 Minuten'
    },
    admin: {
      dashboard: 'Dashboard',
      createEvent: 'Event erstellen',
      rooms: 'Räume',
      timeSlots: 'Zeitslots',
      optimizeSchedule: 'Zeitplan optimieren',
      publishSchedule: 'Zeitplan veröffentlichen',
      clearSchedule: 'Zeitplan löschen'
    },
    monitor: {
      presenting: 'Präsentiert',
      minutesDuration: '{minutes} Minuten',
      votesCount: '{count} Stimmen',
      requiredInfrastructure: 'Benötigte Infrastruktur',
      interest: 'Interesse'
    },
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      save: 'Speichern',
      cancel: 'Abbrechen',
      close: 'Schließen',
      search: 'Suchen...'
    }
  },
  en: {
    nav: {
      sessions: 'Sessions',
      schedule: 'Schedule',
      mySessions: 'My Sessions',
      admin: 'Admin',
      monitor: 'Monitor'
    },
    session: {
      create: 'Create Session',
      title: 'Title',
      description: 'Description',
      presenter: 'Presenter',
      duration: 'Duration',
      infrastructure: 'Required Infrastructure',
      vote: 'Vote',
      voted: 'Voted',
      votes: 'Votes',
      submit: 'Submit Session',
      edit: 'Edit',
      delete: 'Delete',
      noSessions: 'No sessions yet'
    },
    infrastructure: {
      BEAMER: 'Projector',
      FLIPCHART: 'Flipchart',
      WHITEBOARD: 'Whiteboard',
      MODERATION_KIT: 'Moderation Kit'
    },
    duration: {
      30: '30 minutes',
      45: '45 minutes',
      60: '60 minutes'
    },
    admin: {
      dashboard: 'Dashboard',
      createEvent: 'Create Event',
      rooms: 'Rooms',
      timeSlots: 'Time Slots',
      optimizeSchedule: 'Optimize Schedule',
      publishSchedule: 'Publish Schedule',
      clearSchedule: 'Clear Schedule'
    },
    monitor: {
      presenting: 'Presenting',
      minutesDuration: '{minutes} minutes',
      votesCount: '{count} Votes',
      requiredInfrastructure: 'Required Infrastructure',
      interest: 'Interest'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      close: 'Close',
      search: 'Search...'
    }
  }
};

export const i18n = createI18n({
  locale: navigator.language.startsWith('de') ? 'de' : 'en',
  fallbackLocale: 'en',
  messages,
  legacy: false
});
