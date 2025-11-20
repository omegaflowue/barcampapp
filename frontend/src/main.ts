import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n';
import { wsService } from './services/websocket';
import './assets/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);

app.mount('#app');

// Initialize WebSocket connection
wsService.connect();

// Setup WebSocket handlers in stores
import { useSessionStore } from './stores/session';
const sessionStore = useSessionStore();
sessionStore.setupWebSocket();
