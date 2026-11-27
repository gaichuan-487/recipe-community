<script setup>
defineProps({
  iconName: { type: String, default: 'leaf' },
  title: { type: String, default: '' },
  message: { type: String, default: '' }
});
</script>

<template>
  <div class="empty-state">
    <span class="empty-state__icon"><AppIcon :name="iconName" /></span>
    <h3>{{ title }}</h3>
    <p>{{ message }}</p>
    <slot />
  </div>
</template>
