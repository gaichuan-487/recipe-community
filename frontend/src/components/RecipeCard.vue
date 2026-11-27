<script setup>
import { computed } from 'vue';
import { compactNumber } from '@/utils/format';
import { toggleFavorite, toggleLike } from '@/composables/useRecipeActions';
import StatusPill from '@/components/StatusPill.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const props = defineProps({
  recipe: { type: Object, required: true },
  showStatus: { type: Boolean, default: false }
});

const href = computed(() => `/recipe/${encodeURIComponent(props.recipe.id)}`);
const tags = computed(() => (props.recipe.tags || []).slice(0, 2));
</script>

<template>
  <article class="recipe-card" :data-card-id="recipe.id">
    <div class="recipe-card__cover">
      <RouterLink :to="href" :aria-label="`查看菜谱：${recipe.title}`">
        <img :src="recipe.cover" :alt="recipe.title" loading="lazy" decoding="async" />
      </RouterLink>
      <span class="recipe-card__category">{{ recipe.category }}</span>
      <StatusPill
        v-if="showStatus && recipe.status !== 'approved'"
        :status="recipe.status"
      />
      <button
        class="round-action recipe-card__save"
        :class="{ 'is-active': recipe.favorited }"
        type="button"
        :aria-pressed="recipe.favorited"
        :aria-label="recipe.favorited ? '取消收藏' : '收藏这道菜谱'"
        @click="toggleFavorite(recipe)"
      >
        <AppIcon name="bookmark" />
      </button>
    </div>

    <div class="recipe-card__body">
      <div class="recipe-card__tags">
        <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <h3 class="recipe-card__title">
        <RouterLink :to="href">{{ recipe.title }}</RouterLink>
      </h3>
      <p class="recipe-card__summary">{{ recipe.summary }}</p>
      <div class="recipe-card__footer">
        <div class="author-line">
          <UserAvatar :user="recipe.author" size="xs" />
          <span class="author-line__name">{{ recipe.author?.nickname || '厨友' }}</span>
        </div>
        <div class="card-stats">
          <button
            class="stat-action"
            :class="{ 'is-active': recipe.liked }"
            type="button"
            :aria-pressed="recipe.liked"
            :aria-label="recipe.liked ? '取消喜欢' : '喜欢这道菜谱'"
            @click="toggleLike(recipe)"
          >
            <AppIcon name="heart" /><span>{{ compactNumber(recipe.likeCount) }}</span>
          </button>
          <span class="stat-action is-static" aria-label="收藏数">
            <AppIcon name="bookmark" /><span>{{ compactNumber(recipe.favoriteCount) }}</span>
          </span>
          <span class="stat-action is-static" aria-label="评论数">
            <AppIcon name="message" /><span>{{ compactNumber(recipe.commentCount) }}</span>
          </span>
        </div>
      </div>
    </div>
  </article>
</template>
