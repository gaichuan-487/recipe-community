<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiGet } from '@/api/client';
import { useUiStore } from '@/stores/ui';
import { compactNumber, formatDate } from '@/utils/format';
import PageLoader from '@/components/PageLoader.vue';
import ErrorState from '@/components/ErrorState.vue';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const loading = ref(true);
const errorStatus = ref(0);
const items = ref([]);
const allItems = ref([]);
const searchValue = ref('');

const status = computed(() =>
  ['pending', 'approved', 'rejected'].includes(route.query.status) ? route.query.status : ''
);
const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''));

const counts = computed(() => ({
  all: allItems.value.length,
  pending: allItems.value.filter((item) => item.status === 'pending').length,
  approved: allItems.value.filter((item) => item.status === 'approved').length,
  rejected: allItems.value.filter((item) => item.status === 'rejected').length
}));

const statusLinks = computed(() => [
  { key: '', label: '全部', count: counts.value.all },
  { key: 'pending', label: '待审核', count: counts.value.pending },
  { key: 'approved', label: '已发布', count: counts.value.approved },
  { key: 'rejected', label: '未通过', count: counts.value.rejected }
]);

function statusLink(key) {
  const target = {};
  if (key) target.status = key;
  if (query.value) target.q = query.value;
  return { path: '/admin/recipes', query: target };
}

function statusLabel(value) {
  if (value === 'approved') return '已发布';
  if (value === 'pending') return '待审核';
  return '未通过';
}

async function load() {
  loading.value = true;
  errorStatus.value = 0;
  searchValue.value = query.value;

  const params = new URLSearchParams();
  if (status.value) params.set('status', status.value);
  if (query.value) params.set('q', query.value);

  try {
    const [filtered, all] = await Promise.all([
      apiGet(`/admin/recipes${params.toString() ? `?${params.toString()}` : ''}`),
      apiGet('/admin/recipes')
    ]);
    items.value = filtered.items || [];
    allItems.value = all.items || [];
    document.title = '全部菜谱 · 食光记后台';
  } catch (error) {
    errorStatus.value = error.status || 0;
  } finally {
    loading.value = false;
  }
}

function submitSearch() {
  const q = searchValue.value.trim();
  const nextQuery = {};
  if (status.value) nextQuery.status = status.value;
  if (q) nextQuery.q = q;
  router.push({ path: '/admin/recipes', query: nextQuery });
}

watch(() => route.fullPath, load, { immediate: true });
</script>

<template>
  <PageLoader v-if="loading" />
  <ErrorState v-else-if="errorStatus" :status="errorStatus" @retry="load" />
  <div v-else class="admin-view">
    <header class="admin-view__head">
      <div>
        <p class="eyebrow">ALL RECIPES</p>
        <h1>全部菜谱</h1>
        <p>社区里所有投稿的状态，都可以在这里查看与处理。</p>
      </div>
      <span class="queue-count"><strong>{{ items.length }}</strong> 条结果</span>
    </header>

    <div class="admin-toolbar admin-toolbar--stack">
      <div class="admin-filter-tabs" role="group" aria-label="按状态筛选">
        <RouterLink
          v-for="item in statusLinks"
          :key="item.key || 'all'"
          class="admin-filter-tabs__item"
          :class="{ 'is-active': status === item.key }"
          :to="statusLink(item.key)"
        >
          {{ item.label }}<span>{{ item.count }}</span>
        </RouterLink>
      </div>
      <form class="admin-search" role="search" @submit.prevent="submitSearch">
        <span><AppIcon name="search" /></span>
        <label class="visually-hidden" for="admin-recipes-q">搜索全部菜谱</label>
        <input
          id="admin-recipes-q"
          v-model="searchValue"
          name="q"
          type="search"
          placeholder="搜索标题、作者、食材或标签…"
        />
        <button class="btn btn--small btn--soft" type="submit">搜索</button>
      </form>
    </div>

    <div v-if="items.length" class="admin-table-card">
      <div class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">菜谱</th>
              <th scope="col">作者</th>
              <th scope="col">状态</th>
              <th scope="col">数据</th>
              <th scope="col">提交时间</th>
              <th scope="col"><span class="visually-hidden">操作</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <div class="table-recipe">
                  <img :src="item.cover" alt="" loading="lazy" />
                  <div>
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.category }} · {{ item.difficulty }}</span>
                  </div>
                </div>
              </td>
              <td><span class="table-author">{{ item.author?.nickname || '厨友' }}</span></td>
              <td>
                <span class="status-pill" :class="`status-pill--${item.status}`">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td>
                <span class="table-numbers">
                  {{ compactNumber(item.likeCount) }} 喜欢<br />{{ compactNumber(item.viewCount) }} 浏览
                </span>
              </td>
              <td><span class="table-date">{{ formatDate(item.createdAt) }}</span></td>
              <td>
                <div class="table-actions">
                  <a
                    class="btn btn--tiny btn--ghost"
                    :href="`#/recipe/${encodeURIComponent(item.id)}`"
                    target="_blank"
                    rel="noopener"
                  >
                    查看
                  </a>
                  <button
                    class="btn btn--tiny"
                    :class="item.status === 'pending' ? 'btn--primary' : 'btn--soft'"
                    type="button"
                    @click="ui.openReview(item.id)"
                  >
                    {{ item.status === 'pending' ? '审核' : '复核' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="admin-empty admin-empty--large">
      <span><AppIcon name="search" /></span>
      <div>
        <strong>没有找到符合条件的菜谱</strong>
        <p>试试更换状态筛选，或清空搜索关键词。</p>
        <RouterLink class="btn btn--small btn--soft" to="/admin/recipes">查看全部</RouterLink>
      </div>
    </div>
  </div>
</template>
