<script setup>
defineProps({
  label: { type: String, default: '正在打开厨房的小窗…' }
});
</script>

<template>
  <div class="page-loader" role="status" aria-live="polite">
    <span class="loader-mark">食</span>
    <p>{{ label }}</p>
    <div class="loader-line"><span></span></div>
  </div>
</template>
