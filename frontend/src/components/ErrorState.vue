<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: Number, default: 0 }
});

defineEmits(['retry']);

const isNotFound = computed(() => props.status === 404);
const title = computed(() =>
  isNotFound.value ? '这道菜好像已经端走了' : '厨房里冒出了一点小状况'
);
const message = computed(() =>
  isNotFound.value
    ? '菜谱可能已被删除，也可能还在等待审核。换一道菜看看？'
    : '页面暂时没有加载出来，稍后再试一次，或者先回首页逛逛。'
);
</script>

<template>
  <section class="status-page">
    <div class="status-page__card">
      <span class="status-page__mark">{{ isNotFound ? '404' : '!' }}</span>
      <p class="eyebrow">A SMALL KITCHEN MISHAP</p>
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <div class="status-page__actions">
        <button class="btn btn--primary" type="button" @click="$emit('retry')">再试一次</button>
        <RouterLink class="btn btn--soft" to="/">回到首页</RouterLink>
      </div>
    </div>
  </section>
</template>
