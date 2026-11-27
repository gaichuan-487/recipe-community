<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiGet } from '@/api/client';
import { useUiStore } from '@/stores/ui';
import { formatRelative } from '@/utils/format';
import UserAvatar from '@/components/UserAvatar.vue';
import PageLoader from '@/components/PageLoader.vue';
import ErrorState from '@/components/ErrorState.vue';

const route = useRoute();
const router = useRouter();
const ui = useUiStore();

const loading = ref(true);
const errorStatus = ref(0);
const items = ref([]);
const searchValue = ref('');

const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''));

async function load() {
  loading.value = true;
  errorStatus.value = 0;
  searchValue.value = query.value;
  const params = new URLSearchParams({ status: 'pending' });
  if (query.value) params.set('q', query.value);
  try {
    const data = await apiGet(`/admin/recipes?${params.toString()}`);
    items.value = data.items || [];
    document.title = '菜谱审核 · 食光记后台';
  } catch (error) {
    errorStatus.value = error.status || 0;
  } finally {
    loading.value = false;
  }
}

function submitSearch() {
  const q = searchValue.value.trim();
  router.push({ path: '/admin/review', query: q ? { q } : {} });
}

watch(() => route.fullPath, load, { immediate: true });
</script>

<template>
  <PageLoader v-if="loading" />
  <ErrorState v-else-if="errorStatus" :status="errorStatus" @retry="load" />
  <div v-else class="admin-view">
    <header class="admin-view__head">
      <div>
        <p class="eyebrow">REVIEW QUEUE</p>
        <h1>菜谱审核</h1>
        <p>读一读食材与步骤，把认真写下的味道端上桌。</p>
      </div>
      <span class="queue-count"><strong>{{ items.length }}</strong> 份待审核</span>
    </header>

    <div class="admin-toolbar">
      <form class="admin-search" role="search" @submit.prevent="submitSearch">
        <span><AppIcon name="search" /></span>
        <label class="visually-hidden" for="admin-review-q">搜索待审核菜谱</label>
        <input
          id="admin-review-q"
          v-model="searchValue"
          name="q"
          type="search"
          placeholder="搜索菜谱标题、作者或食材…"
        />
        <button class="btn btn--small btn--soft" type="submit">搜索</button>
      </form>
      <p class="admin-toolbar__hint"><AppIcon name="info" /> 通过后立即公开，驳回会通知作者。</p>
    </div>

    <div v-if="items.length" class="review-queue">
      <article v-for="item in items" :key="item.id" class="review-card">
        <button
          class="review-card__cover"
          type="button"
          :aria-label="`审核 ${item.title}`"
          @click="ui.openReview(item.id)"
        >
          <img :src="item.cover" :alt="item.title" loading="lazy" />
        </button>
        <div class="review-card__body">
          <div class="review-card__meta">
            <span class="status-pill status-pill--pending">待审核</span>
            <span>提交于 {{ formatRelative(item.createdAt) }}</span>
          </div>
          <h2>{{ item.title }}</h2>
          <p>{{ item.summary }}</p>
          <div class="review-card__byline">
            <UserAvatar :user="item.author" size="xs" />
            <span>{{ item.author?.nickname || '厨友' }}</span>
            <i>·</i>
            <span>{{ item.category }} · {{ item.difficulty }} · {{ item.time }} 分钟</span>
          </div>
          <div class="review-card__tags">
            <span v-for="tag in item.tags" :key="tag" class="tag tag--small">{{ tag }}</span>
          </div>
        </div>
        <div class="review-card__actions">
          <a
            class="btn btn--small btn--ghost"
            :href="`#/recipe/${encodeURIComponent(item.id)}`"
            target="_blank"
            rel="noopener"
          >
            查看页面 <AppIcon name="external" />
          </a>
          <button class="btn btn--small btn--primary" type="button" @click="ui.openReview(item.id)">
            开始审核 <AppIcon name="arrowRight" />
          </button>
        </div>
      </article>
    </div>
    <div v-else class="admin-empty admin-empty--large">
      <span><AppIcon name="check" /></span>
      <div>
        <strong>{{ query ? '没有找到匹配的待审菜谱' : '审核队列已经清空' }}</strong>
        <p>
          {{
            query
              ? '换一个关键词试试，或者清空搜索条件。'
              : '所有提交都处理完了。新的味道到来时，会出现在这里。'
          }}
        </p>
        <RouterLink
          v-if="query"
          class="btn btn--small btn--soft"
          to="/admin/review"
        >
          清空搜索
        </RouterLink>
        <RouterLink v-else class="btn btn--small btn--soft" to="/admin">回到概览</RouterLink>
      </div>
    </div>
  </div>
</template>
