<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { apiGet } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import AuthGate from '@/components/AuthGate.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const route = useRoute();
const auth = useAuthStore();

const pendingCount = ref(0);

const activeKey = computed(() => {
  if (route.path.startsWith('/admin/review')) return 'review';
  if (route.path.startsWith('/admin/recipes')) return 'recipes';
  if (route.path.startsWith('/admin/users')) return 'users';
  return 'overview';
});

const navItems = computed(() => [
  {
    key: 'overview',
    to: '/admin',
    label: '数据概览',
    note: '社区今天的样子',
    icon: 'chart'
  },
  {
    key: 'review',
    to: '/admin/review',
    label: '菜谱审核',
    note: '等待端上桌的味道',
    icon: 'shield',
    badge: pendingCount.value
  },
  {
    key: 'recipes',
    to: '/admin/recipes',
    label: '全部菜谱',
    note: '浏览与管理作品',
    icon: 'book'
  },
  {
    key: 'users',
    to: '/admin/users',
    label: '用户管理',
    note: '照看每一位厨友',
    icon: 'users'
  }
]);

const today = new Intl.DateTimeFormat('zh-CN', {
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}).format(new Date());

async function loadPending() {
  try {
    const data = await apiGet('/admin/recipes?status=pending');
    pendingCount.value = data.items?.length || 0;
  } catch {
    pendingCount.value = 0;
  }
}

onMounted(() => {
  if (auth.isAdmin) loadPending();
});
</script>

<template>
  <AuthGate
    v-if="!auth.isAdmin"
    eyebrow="SHIGUANG CONSOLE"
    :title="auth.isLoggedIn ? '这里需要管理员权限' : '登录，进入厨房后台'"
    :message="
      auth.isLoggedIn
        ? '当前账号没有后台权限。可以回到个人中心继续记录你的菜谱。'
        : '审核菜谱、查看社区数据，都在管理员的后台里。'
    "
  />

  <div v-else class="admin-page">
    <section class="admin-hero">
      <div class="container admin-hero__inner">
        <div class="admin-hero__copy">
          <p class="eyebrow">SHIGUANG KITCHEN · CONSOLE</p>
          <h1>厨房后台</h1>
          <p>照看好每一份认真写下的菜谱，也照看这个认真吃饭的小社区。</p>
        </div>
        <div class="admin-hero__side">
          <div class="admin-signed">
            <UserAvatar :user="auth.user" size="sm" />
            <div><span>当前管理员</span><strong>{{ auth.user?.nickname || '' }}</strong></div>
          </div>
          <span class="admin-hero__date">{{ today }}</span>
        </div>
      </div>
    </section>

    <div class="container admin-layout">
      <aside class="admin-sidebar">
        <nav class="admin-nav" aria-label="后台导航">
          <RouterLink
            v-for="item in navItems"
            :key="item.key"
            class="admin-nav__item"
            :class="{ 'is-active': activeKey === item.key }"
            :to="item.to"
          >
            <span class="admin-nav__icon"><AppIcon :name="item.icon" /></span>
            <span class="admin-nav__copy">
              <strong>{{ item.label }}</strong><small>{{ item.note }}</small>
            </span>
            <span v-if="item.badge" class="admin-nav__badge">{{
              item.badge > 99 ? '99+' : item.badge
            }}</span>
          </RouterLink>
        </nav>
        <div class="admin-sidebar__foot">
          <span class="admin-sidebar__mark">食</span>
          <p>“把每一顿饭，<br />都当成值得记录的一天。”</p>
          <RouterLink class="text-link" to="/">返回社区 <AppIcon name="arrowRight" /></RouterLink>
        </div>
      </aside>

      <section class="admin-content">
        <RouterView />
      </section>
    </div>
  </div>
</template>
