<script setup>
import { compactNumber } from '@/utils/format';

defineProps({
  items: { type: Array, default: () => [] }
});
</script>

<template>
  <aside v-if="items.length" class="ranking-panel">
    <div class="ranking-panel__head">
      <span class="ranking-panel__flame"><AppIcon name="flame" /></span>
      <div>
        <p class="eyebrow">KITCHEN HEAT</p>
        <h3>厨房热榜</h3>
      </div>
      <RouterLink class="round-action round-action--small" to="/hot" aria-label="查看完整榜单">
        <AppIcon name="arrowUpRight" />
      </RouterLink>
    </div>
    <ol class="ranking-list">
      <li v-for="(item, index) in items" :key="item.id" class="ranking-item">
        <RouterLink class="ranking-item__link" :to="`/recipe/${encodeURIComponent(item.id)}`">
          <span class="rank-number">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="rank-thumb"><img :src="item.cover" alt="" loading="lazy" /></span>
          <span class="rank-info">
            <strong>{{ item.title }}</strong>
            <small>
              {{ item.author?.nickname || '厨友' }} · {{ compactNumber(item.likeCount) }} 喜欢
            </small>
          </span>
        </RouterLink>
      </li>
    </ol>
    <RouterLink class="ranking-panel__all" to="/hot">
      查看完整榜单 <AppIcon name="arrowRight" />
    </RouterLink>
  </aside>
</template>
