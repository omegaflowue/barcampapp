<template>
  <div id="app">
    <nav class="nav" v-if="!isMonitorView">
      <div class="container nav-container">
        <div class="logo">
          <h2 style="color: white; margin: 0">{{ t('common.appName', 'Barcamp Manager') }}</h2>
        </div>
        <ul class="nav-links">
          <li>
            <RouterLink to="/sessions" class="nav-link" activeClass="active">
              {{ t('nav.sessions') }}
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/schedule" class="nav-link" activeClass="active">
              {{ t('nav.schedule') }}
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/admin" class="nav-link" activeClass="active">
              {{ t('nav.admin') }}
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/monitor" class="nav-link" activeClass="active">
              {{ t('nav.monitor') }}
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <main class="main-content" :class="{ 'no-nav': isMonitorView }">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink, RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const { t } = useI18n();

const isMonitorView = computed(() => route.path === '/monitor');
</script>

<style scoped>
.main-content {
  flex: 1;
  padding: 2rem 0;
}

.main-content.no-nav {
  padding: 0;
}

.logo {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .logo h2 {
    font-size: 1.25rem;
  }
}
</style>
