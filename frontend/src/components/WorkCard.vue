<script setup>
import { computed } from 'vue';
import { compactNumber, formatDate } from '@/utils/format';

const props = defineProps({
  item: { type: Object, required: true }
});

const emit = defineEmits(['delete']);

const statusLabel = computed(() => {
  if (props.item.status === 'approved') return '已发布';
  if (props.item.status === 'pending') return '审核中';
  return '未通过';
});

const href = computed(() => `/recipe/${encodeURIComponent(props.item.id)}`);
</script>

<template>
  <article class="work-card" :class="`work-card--${item.status}`">
    <RouterLink class="work-card__cover" :to="href">
      <img :src="item.cover" :alt="item.title" loading="lazy" />
      <span class="status-pill" :class="`status-pill--${item.status}`">{{ statusLabel }}</span>
    </RouterLink>
    <div class="work-card__body">
      <p class="work-card__meta">{{ item.category }} · {{ formatDate(item.createdAt) }}</p>
      <h3><RouterLink :to="href">{{ item.title }}</RouterLink></h3>
      <p class="work-card__summary">{{ item.summary }}</p>
      <div v-if="item.status === 'rejected'" class="work-card__reject">
        <strong><AppIcon name="alert" /> 审核建议</strong>
        <p>{{ item.rejectReason || '请完善内容后重新提交。' }}</p>
      </div>
      <div class="work-card__metrics">
        <span><AppIcon name="heart" /> {{ compactNumber(item.likeCount) }}</span>
        <span><AppIcon name="bookmark" /> {{ compactNumber(item.favoriteCount) }}</span>
        <span><AppIcon name="message" /> {{ compactNumber(item.commentCount) }}</span>
        <span><AppIcon name="eye" /> {{ compactNumber(item.viewCount) }}</span>
      </div>
      <div class="work-card__actions">
        <RouterLink class="text-link" :to="href">查看</RouterLink>
        <RouterLink class="text-link" :to="{ path: '/publish', query: { id: item.id } }">
          <AppIcon name="edit" /> 编辑
        </RouterLink>
        <button class="text-link text-link--danger" type="button" @click="emit('delete', item)">
          <AppIcon name="trash" /> 删除
        </button>
      </div>
    </div>
  </article>
</template>
