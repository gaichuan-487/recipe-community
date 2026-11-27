<script setup>
import { confirmState, resolveConfirm } from '@/services/confirm';
import BaseModal from '@/components/BaseModal.vue';
</script>

<template>
  <BaseModal
    v-if="confirmState.open"
    modal-class="modal--confirm"
    :label="confirmState.title"
    @close="resolveConfirm(false)"
  >
    <div class="confirm-dialog">
      <span class="confirm-dialog__icon" :class="{ 'is-danger': confirmState.danger }">
        <AppIcon :name="confirmState.danger ? 'alert' : 'info'" />
      </span>
      <h2>{{ confirmState.title }}</h2>
      <p>{{ confirmState.message }}</p>
      <div class="confirm-dialog__actions">
        <button class="btn btn--soft" type="button" @click="resolveConfirm(false)">再想想</button>
        <button
          class="btn"
          :class="confirmState.danger ? 'btn--danger' : 'btn--primary'"
          type="button"
          @click="resolveConfirm(true)"
        >
          {{ confirmState.confirmLabel }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>
