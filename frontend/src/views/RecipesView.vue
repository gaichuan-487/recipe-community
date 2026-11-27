<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiGet } from '@/api/client';
import { useMetaStore } from '@/stores/meta';
import { formatNumber } from '@/utils/format';
import { TAG_EMOJI } from '@/utils/tags';
import { trackRecipes } from '@/composables/useRecipeActions';
import RecipeCard from '@/components/RecipeCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import PageLoader from '@/components/PageLoader.vue';
import ErrorState from '@/components/ErrorState.vue';

const route = useRoute();
const router = useRouter();
const metaStore = useMetaStore();

const loading = ref(true);
const errorStatus = ref(0);
const items = ref([]);
const total = ref(0);
const searchValue = ref('');

const filters = computed(() => ({
  tag: typeof route.query.tag === 'string' ? route.query.tag : '',
  category: typeof route.query.category === 'string' ? route.query.category : '',
  q: typeof route.query.q === 'string' ? route.query.q : '',
  sort: typeof route.query.sort === 'string' ? route.query.sort : 'latest'
}));

const activeFilters = computed(() =>
  [
    filters.value.tag && {
      label: `食材 · ${filters.value.tag}`,
      clear: libraryLocation({ tag: '' })
    },
    filters.value.category && {
      label: `分类 · ${filters.value.category}`,
      clear: libraryLocation({ category: '' })
    },
    filters.value.q && {
      label: `搜索 · ${filters.value.q}`,
      clear: libraryLocation({ q: '' })
    }
  ].filter(Boolean)
);

function libraryLocation(overrides = {}) {
  const merged = { ...filters.value, ...overrides };
  const query = {};
  ['tag', 'category', 'q', 'sort'].forEach((key) => {
    const value = merged[key];
    if (value && !(key === 'sort' && value === 'latest')) query[key] = value;
  });
  return { name: 'recipes', query };
}

async function load() {
  loading.value = true;
  errorStatus.value = 0;
  searchValue.value = filters.value.q;

  const query = new URLSearchParams();
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  try {
    const data = await apiGet(`/recipes?${query.toString()}`);
    items.value = data.items || [];
    total.value = data.total || items.value.length;
    trackRecipes(items.value);
  } catch (error) {
    errorStatus.value = error.status || 0;
  } finally {
    loading.value = false;
  }
}

function submitSearch() {
  const q = searchValue.value.trim();
  router.push({ name: 'recipes', query: q ? { q } : {} });
}

function changeSort(event) {
  router.push(libraryLocation({ sort: event.target.value }));
}

watch(() => route.fullPath, load, { immediate: true });
</script>

<template>
  <PageLoader v-if="loading" />
  <ErrorState v-else-if="errorStatus" :status="errorStatus" @retry="load" />
  <div v-else class="library-page">
    <section class="library-hero">
      <span class="library-hero__stamp">灵感<br />菜谱库</span>
      <div class="library-hero__leaf"><AppIcon name="leaf" /></div>
      <div class="container library-hero__inner">
        <p class="eyebrow">THE RECIPE LIBRARY</p>
        <h1>今天，想吃点什么？</h1>
        <p>从冰箱里有的食材出发，或只是跟着心情挑一道。总有一顿饭，值得你认真对待。</p>
        <form class="library-search" role="search" @submit.prevent="submitSearch">
          <span><AppIcon name="search" /></span>
          <label class="visually-hidden" for="library-search-input">搜索菜谱、食材或作者</label>
          <input
            id="library-search-input"
            v-model="searchValue"
            type="search"
            name="q"
            placeholder="搜一道菜、一种食材，或者一位厨友…"
            autocomplete="off"
          />
          <button class="btn btn--primary" type="submit">开始找灵感</button>
        </form>
      </div>
    </section>

    <section class="library-content container">
      <div class="filter-panel">
        <div class="filter-panel__top">
          <span class="filter-panel__title"><AppIcon name="filter" /> 筛选灵感</span>
          <RouterLink
            v-if="activeFilters.length || filters.sort !== 'latest'"
            class="text-button"
            :to="{ name: 'recipes' }"
          >
            清除全部筛选
          </RouterLink>
        </div>

        <div class="filter-tabs" role="group" aria-label="按菜品分类筛选">
          <RouterLink
            class="filter-tab"
            :class="{ 'is-active': !filters.category }"
            :to="libraryLocation({ category: '' })"
          >
            全部
          </RouterLink>
          <RouterLink
            v-for="category in metaStore.categories"
            :key="category"
            class="filter-tab"
            :class="{ 'is-active': filters.category === category }"
            :to="libraryLocation({ category })"
          >
            {{ category }}
          </RouterLink>
        </div>

        <div class="filter-groups">
          <div v-for="group in metaStore.tagGroups" :key="group.name" class="filter-group">
            <span class="filter-group__label">{{ group.name }}</span>
            <div class="filter-chips">
              <RouterLink
                v-for="tag in group.tags"
                :key="tag"
                class="filter-chip"
                :class="{ 'is-active': filters.tag === tag }"
                :to="libraryLocation({ tag })"
              >
                <span v-if="TAG_EMOJI[tag]" aria-hidden="true">{{ TAG_EMOJI[tag] }}</span>{{ tag }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <div class="results-bar">
        <div class="results-summary">
          <strong>{{ formatNumber(total) }}</strong>
          <span>道菜谱{{ filters.tag ? `，来自「${filters.tag}」` : '' }}</span>
          <div v-if="activeFilters.length" class="active-filters">
            <RouterLink
              v-for="filter in activeFilters"
              :key="filter.label"
              class="active-filter"
              :to="filter.clear"
            >
              {{ filter.label }} <AppIcon name="close" />
            </RouterLink>
          </div>
        </div>

        <label class="sort-select">
          <span>排序</span>
          <select :value="filters.sort" aria-label="菜谱排序方式" @change="changeSort">
            <option value="latest">最新收录</option>
            <option value="hot">人气最高</option>
            <option value="quick">最快上手</option>
          </select>
          <AppIcon name="chevronDown" />
        </label>
      </div>

      <div v-if="items.length" class="recipe-grid recipe-grid--three">
        <RecipeCard v-for="recipe in items" :key="recipe.id" :recipe="recipe" />
      </div>
      <EmptyState
        v-else
        icon-name="search"
        title="没有找到合适的菜谱"
        message="换个食材或关键词试试。也可以成为第一个分享这道菜的人。"
      >
        <div class="empty-state__actions">
          <RouterLink class="btn btn--primary" to="/publish">发布我的菜谱</RouterLink>
          <RouterLink class="btn btn--soft" to="/recipes">查看全部</RouterLink>
        </div>
      </EmptyState>
    </section>
  </div>
</template>
