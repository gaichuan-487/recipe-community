<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, default: 'pending' }
});

const map = {
  approved: { label: '已发布', className: 'status--approved' },
  pending: { label: '审核中', className: 'status--pending' },
  rejected: { label: '未通过', className: 'status--rejected' }
};

const item = computed(() => map[props.status] || map.pending);
</script>

<template>
  <span class="status-pill" :class="item.className">{{ item.label }}</span>
</template>
