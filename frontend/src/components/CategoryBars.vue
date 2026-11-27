<script setup>
import { computed } from 'vue';

const props = defineProps({
  categories: { type: Array, default: () => [] }
});

const max = computed(() => Math.max(...props.categories.map((item) => item.count), 1));
const rows = computed(() =>
  props.categories.map((item) => ({
    ...item,
    width: `${Math.max(6, Math.round((item.count / max.value) * 100))}%`
  }))
);
</script>

<template>
  <p v-if="!categories.length" class="admin-empty-inline">还没有已发布的菜谱。</p>
  <div v-else class="category-bars">
    <div v-for="row in rows" :key="row.name" class="bar-row">
      <div class="bar-row__meta"><span>{{ row.name }}</span><strong>{{ row.count }}</strong></div>
      <div class="bar-track"><span :style="{ width: row.width }"></span></div>
    </div>
  </div>
</template>
