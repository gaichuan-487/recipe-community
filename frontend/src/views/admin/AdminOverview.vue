<script setup>
import { onMounted, ref } from 'vue';
import { apiGet } from '@/api/client';
import { useUiStore } from '@/stores/ui';
import { compactNumber, formatDateTime, formatNumber, formatRelative } from '@/utils/format';
import ActivityChart from '@/components/ActivityChart.vue';
import CategoryBars from '@/components/CategoryBars.vue';
import PageLoader from '@/components/PageLoader.vue';
import ErrorState from '@/components/ErrorState.vue';

const ui = useUiStore();

const loading = ref(true);
const errorStatus = ref(0);
const data = ref(null);

async function load() {
  loading.value = true;
  errorStatus.value = 0;
  try {
    data.value = await apiGet('/admin/stats');
    document.title = '数据概览 · 食光记后台';
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
  <div v-else-if="data" class="admin-view">
    <header class="admin-view__head">
      <div>
        <p class="eyebrow">OVERVIEW</p>
        <h1>今天的厨房</h1>
        <p>社区里的每一次开火、留言和收藏，都在这里留下小小的回声。</p>
      </div>
      <span class="admin-view__stamp">数据截至 {{ formatDateTime(data.generatedAt) }}</span>
    </header>

    <div class="admin-kpis">
      <div class="stat-tile">
        <div class="stat-tile__top"><span>已发布菜谱</span><i><AppIcon name="book" /></i></div>
        <strong class="stat-tile__value">{{ formatNumber(data.totals.recipes) }}</strong>
        <div class="stat-tile__foot">
          <span class="delta">近 7 日 +{{ data.last7.recipes }}</span><span>道新菜谱</span>
        </div>
      </div>
      <RouterLink class="stat-tile stat-tile--alert" to="/admin/review">
        <div class="stat-tile__top"><span>待审核</span><i><AppIcon name="clock" /></i></div>
        <strong class="stat-tile__value">{{ formatNumber(data.totals.pending) }}</strong>
        <div class="stat-tile__foot">
          <span>{{ data.totals.rejected }} 份未通过</span>
          <span>去处理 <AppIcon name="arrowRight" /></span>
        </div>
      </RouterLink>
      <div class="stat-tile">
        <div class="stat-tile__top"><span>注册厨友</span><i><AppIcon name="users" /></i></div>
        <strong class="stat-tile__value">{{ formatNumber(data.totals.users) }}</strong>
        <div class="stat-tile__foot">
          <span class="delta">近 7 日 +{{ data.last7.users }}</span><span>位新厨友</span>
        </div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile__top"><span>社区互动</span><i><AppIcon name="heart" /></i></div>
        <strong class="stat-tile__value">{{ compactNumber(data.totals.interactions) }}</strong>
        <div class="stat-tile__foot">
          <span>{{ compactNumber(data.totals.likes) }} 喜欢</span>
          <span>{{ compactNumber(data.totals.favorites) }} 收藏 · {{ compactNumber(data.totals.comments) }} 留言</span>
        </div>
      </div>
    </div>

    <div class="admin-meta-strip">
      <div><span>审核通过率</span><strong>{{ data.totals.reviewRate }}%</strong></div>
      <div><span>菜谱总浏览</span><strong>{{ compactNumber(data.totals.views) }}</strong></div>
      <div><span>近 7 日留言</span><strong>{{ data.last7.comments }}</strong></div>
      <div><span>全部投稿</span><strong>{{ data.totals.allRecipes }}</strong></div>
    </div>

    <div class="dashboard-grid">
      <section class="panel panel--chart">
        <div class="panel__head">
          <div><p class="eyebrow">LAST 7 DAYS</p><h2>每天，都有新菜端上桌</h2></div>
          <span class="panel__meta">近 7 日新增菜谱</span>
        </div>
        <ActivityChart :daily="data.daily" />
      </section>

      <section class="panel">
        <div class="panel__head">
          <div><p class="eyebrow">BY CATEGORY</p><h2>大家爱做什么</h2></div>
          <span class="panel__meta">已发布</span>
        </div>
        <CategoryBars :categories="data.categories" />
        <div class="panel__note"><AppIcon name="info" /> 分类分布帮助了解社区内容的重心。</div>
      </section>
    </div>

    <div class="dashboard-grid dashboard-grid--lower">
      <section class="panel">
        <div class="panel__head">
          <div><p class="eyebrow">IN THE QUEUE</p><h2>等你翻阅的菜谱</h2></div>
          <RouterLink class="text-link" to="/admin/review">
            全部待审 <AppIcon name="arrowRight" />
          </RouterLink>
        </div>
        <div v-if="data.recentPending.length" class="pending-mini-list">
          <div v-for="item in data.recentPending" :key="item.id" class="pending-mini">
            <img :src="item.cover" alt="" loading="lazy" />
            <div class="pending-mini__copy">
              <strong>{{ item.title }}</strong>
              <span>@{{ item.author?.nickname || '厨友' }} · {{ formatRelative(item.createdAt) }}</span>
            </div>
            <button class="btn btn--tiny btn--soft" type="button" @click="ui.openReview(item.id)">
              审核
            </button>
          </div>
        </div>
        <div v-else class="admin-empty">
          <span><AppIcon name="check" /></span>
          <div><strong>审核队列已经清空</strong><p>所有菜谱都处理好了，喝杯茶吧。</p></div>
        </div>
      </section>

      <section class="panel">
        <div class="panel__head">
          <div><p class="eyebrow">TRENDING</p><h2>最近的热门菜谱</h2></div>
          <RouterLink class="text-link" to="/hot">
            热门排行 <AppIcon name="arrowRight" />
          </RouterLink>
        </div>
        <ol class="admin-top-list">
          <li v-for="(item, index) in data.topRecipes" :key="item.id">
            <span class="admin-top-list__rank">{{ String(index + 1).padStart(2, '0') }}</span>
            <img :src="item.cover" alt="" loading="lazy" />
            <div>
              <strong>{{ item.title }}</strong>
              <span>
                <AppIcon name="heart" /> {{ compactNumber(item.likeCount) }} ·
                <AppIcon name="bookmark" /> {{ compactNumber(item.favoriteCount) }}
              </span>
            </div>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>
