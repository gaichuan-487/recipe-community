<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { apiGet } from '@/api/client';
import { useMetaStore } from '@/stores/meta';
import { compactNumber, formatNumber } from '@/utils/format';
import { TAG_EMOJI } from '@/utils/tags';
import { trackRecipes } from '@/composables/useRecipeActions';
import RecipeCard from '@/components/RecipeCard.vue';
import RankingPanel from '@/components/RankingPanel.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import PageLoader from '@/components/PageLoader.vue';
import ErrorState from '@/components/ErrorState.vue';

const router = useRouter();
const metaStore = useMetaStore();

const loading = ref(true);
const errorStatus = ref(0);
const items = ref([]);
const ranking = ref([]);
const search = ref('');

const feature = computed(() => ranking.value[0] || items.value[0] || null);

const people = computed(() => {
  const map = new Map();
  [...ranking.value, ...items.value].forEach((recipe) => {
    if (recipe.author?.id) map.set(recipe.author.id, recipe.author);
  });
  return [...map.values()].filter(Boolean).slice(0, 4);
});

const miniRecipe = computed(
  () => items.value.find((item) => item.id !== feature.value?.id) || items.value[0] || null
);

const ingredients = computed(
  () => metaStore.tagGroups.find((group) => group.name === '食材')?.tags || []
);

const newThisWeek = computed(
  () =>
    items.value.filter(
      (item) => Date.now() - new Date(item.createdAt).getTime() < 7 * 86400000
    ).length
);

const community = computed(() => metaStore.community);

async function load() {
  loading.value = true;
  errorStatus.value = 0;
  try {
    const [recipesData, rankingData] = await Promise.all([
      apiGet('/recipes?sort=latest&limit=7'),
      apiGet('/ranking?limit=5')
    ]);
    items.value = recipesData.items || [];
    ranking.value = rankingData.items || [];
    if (!feature.value) throw new Error('还没有公开的菜谱');
    trackRecipes([...items.value, ...ranking.value]);
  } catch (error) {
    errorStatus.value = error.status || 0;
  } finally {
    loading.value = false;
  }
}

function submitSearch() {
  const q = search.value.trim();
  router.push({ name: 'recipes', query: q ? { q } : {} });
}

onMounted(load);
</script>

<template>
  <PageLoader v-if="loading" />
  <ErrorState v-else-if="errorStatus" :status="errorStatus" @retry="load" />
  <div v-else class="home-page">
    <section class="home-hero">
      <div class="container home-hero__inner">
        <div class="hero-copy">
          <p class="eyebrow"><span class="eyebrow__line"></span> RECIPE · STORY · DAILY LIFE</p>
          <h1 class="hero-title">
            把日子，<br /><span class="hero-title__accent">煮成喜欢的样子。</span>
          </h1>
          <p class="hero-lead">
            从冰箱里现有的食材出发，把每一顿饭认真做完。这里有家常菜谱、厨房灵感和一群好好吃饭的人。
          </p>
          <form class="hero-search" role="search" @submit.prevent="submitSearch">
            <span class="hero-search__icon"><AppIcon name="search" /></span>
            <label class="visually-hidden" for="hero-search-input">搜索菜谱或食材</label>
            <input
              id="hero-search-input"
              v-model="search"
              type="search"
              name="q"
              placeholder="试试搜「番茄」「一人食」…"
              autocomplete="off"
            />
            <button class="btn btn--primary hero-search__button" type="submit">找菜谱</button>
          </form>
          <div class="hero-community">
            <div class="avatar-stack" aria-hidden="true">
              <UserAvatar v-for="person in people" :key="person.id" :user="person" size="sm" />
              <span class="avatar avatar--sm avatar--more">+</span>
            </div>
            <p>
              已有 <strong>{{ formatNumber(community.cooks || 0) }}</strong> 位厨友，写下
              <strong>{{
                formatNumber(community.approvedRecipes || items.length)
              }}</strong>
              道公开菜谱
            </p>
          </div>
          <div class="hero-caption">
            <span class="hero-caption__rule"></span>
            <span>本周新收录 {{ newThisWeek }} 道菜谱</span>
            <span class="hero-caption__dot"></span>
            <span>{{ formatNumber(community.totalLikes || 0) }} 次喜欢</span>
          </div>
        </div>

        <div v-if="feature" class="hero-visual">
          <span class="hero-scribble">今天也要<br />好好吃饭</span>
          <div class="hero-orbit hero-orbit--one"></div>
          <div class="hero-orbit hero-orbit--two"></div>
          <article class="feature-card">
            <div class="feature-card__top">
              <span class="feature-pick"><AppIcon name="sparkles" /> 今日精选</span>
              <span class="feature-time"><AppIcon name="clock" /> {{ feature.time }} 分钟</span>
            </div>
            <RouterLink
              class="feature-card__cover"
              :to="`/recipe/${encodeURIComponent(feature.id)}`"
              aria-label="查看精选菜谱"
            >
              <img :src="feature.cover" :alt="feature.title" decoding="async" />
            </RouterLink>
            <div class="feature-card__body">
              <div class="feature-card__tags">
                <span v-for="tag in feature.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <h2>
                <RouterLink :to="`/recipe/${encodeURIComponent(feature.id)}`">
                  {{ feature.title }}
                </RouterLink>
              </h2>
              <div class="feature-card__meta">
                <div class="author-line">
                  <UserAvatar :user="feature.author" size="xs" />
                  <span class="author-line__name">{{ feature.author?.nickname || '厨友' }}</span>
                </div>
                <span class="feature-heat">
                  <AppIcon name="heart" /> {{ compactNumber(feature.likeCount) }}
                </span>
              </div>
            </div>
            <span class="feature-seal">今日<br />上桌</span>
          </article>
          <RouterLink
            v-if="miniRecipe"
            class="hero-mini-card"
            :to="`/recipe/${encodeURIComponent(miniRecipe.id)}`"
          >
            <img :src="miniRecipe.cover" alt="" loading="lazy" />
            <span><small>ALSO GOOD</small><strong>{{ miniRecipe.title }}</strong></span>
            <i><AppIcon name="arrowUpRight" /></i>
          </RouterLink>
          <div class="hero-floating-note">
            <AppIcon name="flame" />
            <span><strong>{{ compactNumber(feature.likeCount) }}</strong> 人正在喜欢</span>
          </div>
        </div>
      </div>
    </section>

    <section class="ingredient-shelf">
      <div class="container">
        <div class="shelf-head">
          <div>
            <p class="eyebrow">COOK WITH WHAT YOU HAVE</p>
            <h2>从手边的食材开始</h2>
          </div>
          <RouterLink class="text-link" to="/recipes">
            全部菜谱 <AppIcon name="arrowRight" />
          </RouterLink>
        </div>
        <div class="ingredient-chips">
          <RouterLink class="ingredient-chip ingredient-chip--all" to="/recipes">全部</RouterLink>
          <RouterLink
            v-for="tag in ingredients"
            :key="tag"
            class="ingredient-chip"
            :to="{ name: 'recipes', query: { tag } }"
          >
            <span class="ingredient-chip__emoji" aria-hidden="true">{{ TAG_EMOJI[tag] || '🍽' }}</span>
            {{ tag }}
          </RouterLink>
        </div>
        <div class="category-row">
          <span class="category-row__label">按场景</span>
          <RouterLink
            v-for="category in metaStore.categories"
            :key="category"
            class="category-link"
            :to="{ name: 'recipes', query: { category } }"
          >
            {{ category }} <AppIcon name="chevronRight" />
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="section home-recipes">
      <div class="container">
        <div class="section-heading">
          <div>
            <p class="eyebrow">FRESH FROM THE KITCHEN</p>
            <h2 class="section-title">最近，大家都在做什么</h2>
          </div>
          <RouterLink class="text-link" to="/recipes">
            发现更多 <AppIcon name="arrowRight" />
          </RouterLink>
        </div>
        <div class="home-layout">
          <div class="recipe-grid">
            <RecipeCard v-for="recipe in items.slice(0, 6)" :key="recipe.id" :recipe="recipe" />
          </div>
          <div class="home-sidebar">
            <RankingPanel :items="ranking" />
            <div class="sidebar-tip">
              <span class="sidebar-tip__icon"><AppIcon name="leaf" /></span>
              <p>“不必追求复杂的调味。食材新鲜，火候刚好，一顿饭就已经很好了。”</p>
              <span class="sidebar-tip__sign">—— 食光记编辑部</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="community-banner">
      <div class="container community-banner__inner">
        <div class="community-quote">
          <span class="community-quote__mark">“</span>
          <p class="eyebrow">THE TABLE IS BETTER TOGETHER</p>
          <blockquote>好好吃饭，<br />是最小单位的自我照顾。</blockquote>
          <p class="community-quote__note">
            把今天做的那道菜写下来吧。也许正好能成为另一个人明天晚餐的灵感。
          </p>
          <RouterLink class="btn btn--light" to="/publish">
            写下我的菜谱 <AppIcon name="arrowRight" />
          </RouterLink>
        </div>
        <div class="community-numbers">
          <div class="community-number">
            <span class="community-number__label">公开菜谱</span>
            <strong>{{ formatNumber(community.approvedRecipes || 0) }}</strong>
            <small>RECIPES</small>
          </div>
          <div class="community-number">
            <span class="community-number__label">认真做饭的人</span>
            <strong>{{ formatNumber(community.cooks || 0) }}</strong>
            <small>COOKS</small>
          </div>
          <div class="community-number">
            <span class="community-number__label">收藏与喜欢</span>
            <strong>{{ compactNumber(community.totalLikes || 0) }}</strong>
            <small>LOVES</small>
          </div>
        </div>
        <span class="community-banner__stamp">人间<br />烟火</span>
      </div>
    </section>
  </div>
</template>
