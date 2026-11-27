<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiDelete, apiGet } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { compactNumber, formatNumber } from '@/utils/format';
import { trackRecipes } from '@/composables/useRecipeActions';
import { confirmDialog } from '@/services/confirm';
import AuthGate from '@/components/AuthGate.vue';
import RecipeCard from '@/components/RecipeCard.vue';
import WorkCard from '@/components/WorkCard.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import PageLoader from '@/components/PageLoader.vue';
import ErrorState from '@/components/ErrorState.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();

const loading = ref(true);
const errorStatus = ref(0);
const works = ref({ items: [], stats: {} });
const favorites = ref({ items: [] });
const likes = ref({ items: [] });

const activeTab = computed(() =>
  ['works', 'favorites', 'likes'].includes(route.query.tab) ? route.query.tab : 'works'
);

const statusFilter = computed(() =>
  ['approved', 'pending', 'rejected'].includes(route.query.status) ? route.query.status : 'all'
);

const counts = computed(() => ({
  works: works.value.items.length,
  favorites: favorites.value.items.length,
  likes: likes.value.items.length
}));

const filteredWorks = computed(() =>
  statusFilter.value === 'all'
    ? works.value.items
    : works.value.items.filter((item) => item.status === statusFilter.value)
);

const statusOptions = computed(() => {
  const stats = works.value.stats || {};
  return [
    { key: 'all', label: '全部', count: stats.total || 0 },
    { key: 'approved', label: '已发布', count: stats.approved || 0 },
    { key: 'pending', label: '审核中', count: stats.pending || 0 },
    { key: 'rejected', label: '未通过', count: stats.rejected || 0 }
  ];
});

const sinceYear = computed(() => {
  const value = auth.user?.createdAt;
  if (!value) return '';
  return String(new Date(value).getFullYear());
});

function tabLink(tab) {
  return { path: '/me', query: { tab } };
}

function statusLink(key) {
  return {
    path: '/me',
    query: key === 'all' ? { tab: 'works' } : { tab: 'works', status: key }
  };
}

async function load() {
  if (!auth.isLoggedIn) {
    loading.value = false;
    return;
  }
  loading.value = true;
  errorStatus.value = 0;
  try {
    const [worksData, favoritesData, likesData] = await Promise.all([
      apiGet('/me/recipes'),
      apiGet('/me/favorites'),
      apiGet('/me/likes')
    ]);
    works.value = worksData;
    favorites.value = favoritesData;
    likes.value = likesData;
    trackRecipes([
      ...(worksData.items || []),
      ...(favoritesData.items || []),
      ...(likesData.items || [])
    ]);
  } catch (error) {
    errorStatus.value = error.status || 0;
  } finally {
    loading.value = false;
  }
}

async function deleteRecipe(item) {
  const confirmed = await confirmDialog({
    title: '确定删除这份菜谱？',
    message: `「${item.title}」删除后无法恢复，相关评论也会一起移除。`,
    confirmText: '删除',
    danger: true
  });
  if (!confirmed) return;
  try {
    await apiDelete(`/recipes/${encodeURIComponent(item.id)}`);
    toast.info('菜谱已删除');
    await router.push({ path: '/me', query: { tab: 'works' } });
    await load();
  } catch (error) {
    toast.error(error.message);
  }
}

async function logout() {
  await auth.logout();
  await router.push('/');
}

watch(
  () => auth.user?.id,
  () => load(),
  { immediate: true }
);
</script>

<template>
  <PageLoader v-if="loading" />
  <ErrorState v-else-if="errorStatus" :status="errorStatus" @retry="load" />
  <AuthGate
    v-else-if="!auth.isLoggedIn"
    eyebrow="MY KITCHEN"
    title="登录，回到你的厨房"
    message="你的作品、收藏和赞过的菜谱，都在这里等你回来。"
  />
  <div v-else class="profile-page">
    <section class="profile-hero">
      <div class="container">
        <div class="profile-hero__top">
          <div class="profile-identity">
            <span class="profile-avatar">
              <UserAvatar :user="auth.user" size="xl" /><i aria-hidden="true"></i>
            </span>
            <div class="profile-identity__copy">
              <p class="eyebrow">MY KITCHEN · SINCE {{ sinceYear }}</p>
              <h1>
                {{ auth.user.nickname }}
                <span v-if="auth.isAdmin" class="role-badge">管理员</span>
              </h1>
              <p class="profile-handle">@{{ auth.user.username }}</p>
              <p class="profile-bio">{{ auth.user.bio || '正在用美食记录生活。' }}</p>
            </div>
          </div>
          <div class="profile-actions">
            <RouterLink class="btn btn--primary" to="/publish">
              <AppIcon name="plus" /> 发布新菜谱
            </RouterLink>
            <RouterLink v-if="auth.isAdmin" class="btn btn--soft" to="/admin">
              <AppIcon name="chart" /> 后台管理
            </RouterLink>
            <button class="btn btn--ghost" type="button" @click="logout">
              <AppIcon name="logout" /> 退出登录
            </button>
          </div>
        </div>

        <div class="profile-stats">
          <div class="profile-stat">
            <strong>{{ formatNumber(works.stats?.total || 0) }}</strong><span>发布作品</span>
          </div>
          <div class="profile-stat">
            <strong>{{ compactNumber(works.stats?.likesReceived || 0) }}</strong><span>收到的喜欢</span>
          </div>
          <div class="profile-stat">
            <strong>{{ compactNumber(works.stats?.favoritesReceived || 0) }}</strong><span>被收藏</span>
          </div>
          <div class="profile-stat">
            <strong>{{ compactNumber(works.stats?.viewsReceived || 0) }}</strong><span>作品浏览</span>
          </div>
          <span class="profile-stamp" aria-hidden="true">好好<br />吃饭</span>
        </div>
      </div>
    </section>

    <div class="container profile-body">
      <nav class="profile-tabs" aria-label="个人中心内容">
        <RouterLink class="profile-tab" :class="{ 'is-active': activeTab === 'works' }" :to="tabLink('works')">
          我的作品<span>{{ counts.works }}</span>
        </RouterLink>
        <RouterLink
          class="profile-tab"
          :class="{ 'is-active': activeTab === 'favorites' }"
          :to="tabLink('favorites')"
        >
          我的收藏<span>{{ counts.favorites }}</span>
        </RouterLink>
        <RouterLink class="profile-tab" :class="{ 'is-active': activeTab === 'likes' }" :to="tabLink('likes')">
          赞过的<span>{{ counts.likes }}</span>
        </RouterLink>
      </nav>

      <div class="profile-content">
        <template v-if="activeTab === 'works'">
          <div class="works-filter" role="group" aria-label="筛选作品状态">
            <RouterLink
              v-for="option in statusOptions"
              :key="option.key"
              class="works-filter__item"
              :class="{ 'is-active': statusFilter === option.key }"
              :to="statusLink(option.key)"
            >
              {{ option.label }}<span>{{ option.count }}</span>
            </RouterLink>
          </div>
          <div v-if="filteredWorks.length" class="work-list">
            <WorkCard
              v-for="item in filteredWorks"
              :key="item.id"
              :item="item"
              @delete="deleteRecipe"
            />
          </div>
          <div v-else class="profile-empty">
            <span class="profile-empty__mark"><AppIcon name="chefHat" /></span>
            <h3>{{ works.items.length ? '这个状态下还没有作品' : '你的第一道菜，还在等你写下来' }}</h3>
            <p>
              {{
                works.items.length
                  ? '换一个状态看看，或者去发布新的味道。'
                  : '从一道常做的家常菜开始，把步骤和照片记下来，它会成为别人厨房里的灵感。'
              }}
            </p>
            <RouterLink class="btn btn--primary" to="/publish">
              发布菜谱 <AppIcon name="arrowRight" />
            </RouterLink>
          </div>
        </template>

        <template v-else-if="activeTab === 'favorites'">
          <div v-if="favorites.items.length" class="recipe-grid recipe-grid--three">
            <RecipeCard v-for="item in favorites.items" :key="item.id" :recipe="item" />
          </div>
          <div v-else class="profile-empty">
            <span class="profile-empty__mark"><AppIcon name="bookmark" /></span>
            <h3>收藏夹还空着</h3>
            <p>遇到想做的菜谱时，点一下收藏。它们会在这里安静等你。</p>
            <RouterLink class="btn btn--primary" to="/recipes">
              去发现菜谱 <AppIcon name="arrowRight" />
            </RouterLink>
          </div>
        </template>

        <template v-else>
          <div v-if="likes.items.length" class="recipe-grid recipe-grid--three">
            <RecipeCard v-for="item in likes.items" :key="item.id" :recipe="item" />
          </div>
          <div v-else class="profile-empty">
            <span class="profile-empty__mark"><AppIcon name="heart" /></span>
            <h3>还没有赞过菜谱</h3>
            <p>给认真记录的美食一点鼓励，喜欢的味道会留在这里。</p>
            <RouterLink class="btn btn--primary" to="/hot">
              看看热门排行 <AppIcon name="arrowRight" />
            </RouterLink>
          </div>
        </template>
      </div>

      <div v-if="auth.isAdmin" class="admin-hint">
        <span><AppIcon name="shield" /></span>
        <div>
          <strong>你也是社区管理员</strong>
          <p>待审核的菜谱、社区数据和作品管理都在后台。</p>
        </div>
        <RouterLink class="btn btn--soft btn--small" to="/admin/review">
          去审核<AppIcon name="arrowRight" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>
