<script setup>
import { computed, onMounted, ref } from 'vue';
import { apiGet } from '@/api/client';
import { compactNumber, formatRelative } from '@/utils/format';
import { TAG_EMOJI } from '@/utils/tags';
import { trackRecipes } from '@/composables/useRecipeActions';
import UserAvatar from '@/components/UserAvatar.vue';
import PageLoader from '@/components/PageLoader.vue';
import ErrorState from '@/components/ErrorState.vue';

const loading = ref(true);
const errorStatus = ref(0);
const items = ref([]);

const totalLikes = computed(() => items.value.reduce((sum, item) => sum + item.likeCount, 0));

const topTags = computed(() => {
  const tagUse = new Map();
  items.value.forEach((recipe) => {
    (recipe.tags || []).forEach((tag) => tagUse.set(tag, (tagUse.get(tag) || 0) + 1));
  });
  return [...tagUse.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
});

async function load() {
  loading.value = true;
  errorStatus.value = 0;
  try {
    const data = await apiGet('/ranking?limit=10');
    items.value = data.items || [];
    trackRecipes(items.value);
  } catch (error) {
    errorStatus.value = error.status || 0;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <PageLoader v-if="loading" />
  <ErrorState v-else-if="errorStatus" :status="errorStatus" @retry="load" />
  <div v-else class="hot-page">
    <section class="hot-hero">
      <div class="container hot-hero__inner">
        <div class="hot-hero__copy">
          <p class="eyebrow">THE KITCHEN HEAT LIST</p>
          <h1>这周，<br /><em>大家都在馋什么？</em></h1>
          <p>由真实的喜欢、收藏、留言与浏览热度共同决定。每一次心动，都在把好吃的菜往前推。</p>
        </div>
        <div class="hot-hero__aside">
          <span class="hot-hero__seal">热<br />榜</span>
          <div class="hot-hero__note">
            <span><AppIcon name="flame" /></span>
            <div><strong>{{ items.length }}</strong><small>道菜正在上榜</small></div>
          </div>
          <div class="hot-hero__note hot-hero__note--soft">
            <span><AppIcon name="heart" /></span>
            <div><strong>{{ compactNumber(totalLikes) }}</strong><small>次真实的喜欢</small></div>
          </div>
        </div>
      </div>
    </section>

    <section class="hot-content container">
      <div class="hot-layout">
        <div class="hot-board">
          <div class="hot-board__head">
            <div><p class="eyebrow">RANKED WITH LOVE</p><h2>本周厨房热度榜</h2></div>
            <span class="hot-board__update"><AppIcon name="clock" /> 实时更新</span>
          </div>
          <div class="hot-list">
            <article
              v-for="(recipe, index) in items"
              :key="recipe.id"
              class="hot-item"
              :class="{ 'is-lead': index === 0 }"
            >
              <div class="hot-item__rank">
                <span>{{ String(index + 1).padStart(2, '0') }}</span>
                <small>{{ index === 0 ? 'TOP' : '热度' }}</small>
              </div>
              <RouterLink
                class="hot-item__cover"
                :to="`/recipe/${encodeURIComponent(recipe.id)}`"
              >
                <img :src="recipe.cover" :alt="recipe.title" loading="lazy" />
                <span v-if="index === 0" class="hot-item__crown">本周最馋</span>
              </RouterLink>
              <div class="hot-item__content">
                <div class="recipe-card__tags">
                  <span v-for="tag in recipe.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
                </div>
                <h3>
                  <RouterLink :to="`/recipe/${encodeURIComponent(recipe.id)}`">
                    {{ recipe.title }}
                  </RouterLink>
                </h3>
                <p>{{ recipe.summary }}</p>
                <div class="hot-item__meta">
                  <div class="author-line">
                    <UserAvatar :user="recipe.author" size="xs" />
                    <span class="author-line__name">{{ recipe.author?.nickname || '厨友' }}</span>
                  </div>
                  <span>{{ formatRelative(recipe.createdAt) }}</span>
                </div>
                <div class="hot-item__stats">
                  <span><AppIcon name="heart" /> {{ compactNumber(recipe.likeCount) }} 喜欢</span>
                  <span><AppIcon name="bookmark" /> {{ compactNumber(recipe.favoriteCount) }} 收藏</span>
                  <span><AppIcon name="message" /> {{ compactNumber(recipe.commentCount) }} 留言</span>
                  <span><AppIcon name="eye" /> {{ compactNumber(recipe.viewCount) }} 次浏览</span>
                </div>
              </div>
              <RouterLink
                class="hot-item__cta"
                :to="`/recipe/${encodeURIComponent(recipe.id)}`"
                :aria-label="`查看 ${recipe.title}`"
              >
                <AppIcon name="arrowUpRight" />
              </RouterLink>
            </article>
          </div>
        </div>

        <aside class="hot-aside">
          <div class="panel hot-formula">
            <span class="hot-formula__icon"><AppIcon name="bolt" /></span>
            <p class="eyebrow">HOW IT WORKS</p>
            <h3>热度从哪里来？</h3>
            <p>不是简单的浏览量。我们把厨友们真实的动作也算进去了：</p>
            <div class="formula-list">
              <div>
                <span class="formula-list__icon"><AppIcon name="heart" /></span>
                <strong>喜欢</strong><small>让喜欢的菜被更多人看见</small>
              </div>
              <div>
                <span class="formula-list__icon"><AppIcon name="bookmark" /></span>
                <strong>收藏</strong><small>想再做一次的菜更有分量</small>
              </div>
              <div>
                <span class="formula-list__icon"><AppIcon name="message" /></span>
                <strong>留言</strong><small>厨房里的交流同样被珍视</small>
              </div>
            </div>
            <p class="hot-formula__foot">综合计算，不只看数字大小，也照顾新菜谱。</p>
          </div>

          <div class="hot-tags panel">
            <p class="eyebrow">TRENDING INGREDIENTS</p>
            <h3>上榜菜里的热门食材</h3>
            <div class="hot-tag-cloud">
              <RouterLink
                v-for="[tag, count] in topTags"
                :key="tag"
                :to="{ name: 'recipes', query: { tag } }"
              >
                <span v-if="TAG_EMOJI[tag]" aria-hidden="true">{{ TAG_EMOJI[tag] }}</span>{{ tag }}<small>{{ count }}</small>
              </RouterLink>
            </div>
          </div>

          <div class="hot-aside__quote">
            <span>“</span>
            <p>榜单会变，认真吃饭这件事不会。</p>
            <RouterLink to="/recipes">继续找灵感 <AppIcon name="arrowRight" /></RouterLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
