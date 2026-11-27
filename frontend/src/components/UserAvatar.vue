<script setup>
import { computed } from 'vue';
import { firstCharacter } from '@/utils/format';

const props = defineProps({
  user: { type: Object, default: null },
  size: { type: String, default: 'md' }
});

const initial = computed(() => firstCharacter(props.user?.nickname));
const color = computed(() => props.user?.avatarColor || '#c95a3d');
</script>

<template>
  <span
    class="avatar"
    :class="`avatar--${size}`"
    :style="{ '--avatar-color': color }"
    aria-hidden="true"
  >
    <span>{{ initial }}</span>
  </span>
</template>
