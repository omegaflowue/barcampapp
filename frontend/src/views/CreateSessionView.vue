<template>
  <div class="container">
    <div class="card form-card">
      <h1>{{ t('session.create') }}</h1>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">{{ t('session.title') }} *</label>
          <input
            type="text"
            v-model="form.title"
            class="form-input"
            required
            maxlength="255"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('session.description') }} *</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            required
            maxlength="1000"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('session.presenter') }} *</label>
          <input
            type="text"
            v-model="form.presenter"
            class="form-input"
            required
            maxlength="255"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('session.infrastructure') }}</label>
          <div class="infrastructure-options">
            <label class="infrastructure-option" v-for="infra in infrastructureTypes" :key="infra">
              <input
                type="checkbox"
                :value="infra"
                v-model="form.infrastructure"
                class="form-checkbox"
              />
              {{ getInfraIcon(infra) }} {{ t(`infrastructure.${infra}`) }}
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="goBack" class="btn btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="btn" :disabled="submitting">
            {{ submitting ? t('common.loading') : t('session.submit') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSessionStore } from '../stores/session';
import { InfrastructureIcons } from '../types';
import type { InfrastructureType, CreateSessionRequest } from '../types';

const router = useRouter();
const { t } = useI18n();
const sessionStore = useSessionStore();

const infrastructureTypes: InfrastructureType[] = ['BEAMER', 'FLIPCHART', 'WHITEBOARD', 'MODERATION_KIT'];

const form = ref<CreateSessionRequest>({
  title: '',
  description: '',
  presenter: '',
  infrastructure: []
});

const submitting = ref(false);
const eventId = ref('c0368715-a2f5-4e19-91db-653799c1ed2f'); // Hardcoded for demo

function getInfraIcon(type: InfrastructureType): string {
  return InfrastructureIcons[type] || '';
}

async function handleSubmit() {
  submitting.value = true;

  try {
    await sessionStore.createSession(eventId.value, form.value);
    router.push('/sessions');
  } catch (err) {
    console.error('Error creating session:', err);
    alert('Failed to create session. Please try again.');
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.back();
}
</script>

<style scoped>
.form-card {
  max-width: 800px;
  margin: 0 auto;
}

.infrastructure-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.infrastructure-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.infrastructure-option:hover {
  border-color: var(--primary-color);
  background-color: var(--surface);
}

.infrastructure-option input[type="checkbox"]:checked ~ * {
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .btn {
    width: 100%;
  }
}
</style>
