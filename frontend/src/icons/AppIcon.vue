<script setup>
import { computed } from 'vue';
import { ICONS } from './icons';

const props = defineProps({
  name: { type: String, default: 'sparkles' }
});

const content = computed(() => ICONS[props.name] || ICONS.sparkles);
</script>

<template>
  <svg
    class="icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="content"
  ></svg>
</template>
