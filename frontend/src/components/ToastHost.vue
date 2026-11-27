<script setup>
import { useToastStore } from '@/stores/toast';

const toast = useToastStore();

function iconName(type) {
  if (type === 'error') return 'alert';
  if (type === 'info') return 'info';
  return 'check';
}
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-atomic="true">
    <div
      v-for="item in toast.items"
      :key="item.id"
      class="toast"
      :class="[`toast--${item.type}`, { 'is-visible': item.visible }]"
    >
      <span class="toast__icon"><AppIcon :name="iconName(item.type)" /></span>
      <span>{{ item.message }}</span>
    </div>
  </div>
</template>
