<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import UserAvatar from '@/components/UserAvatar.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const ui = useUiStore();

const searchValue = ref('');

const navItems = computed(() => {
  const items = [
    { label: '首页', to: '/', active: route.path === '/' },
    { label: '发现菜谱', to: '/recipes', active: route.path === '/recipes' },
    { label: '热门排行', to: '/hot', active: route.path === '/hot' }
  ];
  if (auth.isAdmin) {
    items.push({
      label: '后台管理',
      to: '/admin',
      active: route.path.startsWith('/admin')
    });
  }
  return items;
});

watch(
  () => route.fullPath,
  () => {
    searchValue.value = route.path === '/recipes' ? String(route.query.q || '') : '';
    ui.closeMenu();
  },
  { immediate: true }
);

watchEffect(() => {
  document.body.classList.toggle('menu-open', ui.menuOpen);
});

function submitSearch() {
  const q = searchValue.value.trim();
  ui.closeMenu();
  router.push({ path: '/recipes', query: q ? { q } : {} });
}

function openAuth() {
  ui.closeMenu();
  ui.openAuth('login');
}
</script>

<template>
  <header class="site-header">
    <div class="header-inner container">
      <RouterLink class="brand" to="/" aria-label="食光记首页">
        <span class="brand-mark"><span>食</span></span>
        <span class="brand-word">食光记<small>SHIGUANG KITCHEN</small></span>
      </RouterLink>

      <nav class="main-nav" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          class="nav-link"
          :class="{ 'is-active': item.active }"
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="header-actions">
        <form class="header-search" role="search" @submit.prevent="submitSearch">
          <label class="visually-hidden" for="header-search-input">搜索菜谱</label>
          <span class="header-search__icon"><AppIcon name="search" /></span>
          <input
            id="header-search-input"
            v-model="searchValue"
            type="search"
            name="q"
            placeholder="搜菜谱 / 食材"
            autocomplete="off"
          />
        </form>

        <RouterLink
          v-if="auth.isLoggedIn"
          class="user-pill"
          to="/me"
          aria-label="进入个人中心"
        >
          <UserAvatar :user="auth.user" size="sm" />
          <span class="user-pill__name">{{ auth.user?.nickname }}</span>
        </RouterLink>
        <button
          v-else
          class="btn btn--ghost btn--small header-login"
          type="button"
          @click="openAuth"
        >
          登录
        </button>

        <RouterLink class="btn btn--primary btn--small header-publish" to="/publish">
          <AppIcon name="plus" /><span>发布菜谱</span>
        </RouterLink>

        <button
          class="menu-toggle"
          type="button"
          :aria-label="ui.menuOpen ? '关闭菜单' : '打开菜单'"
          :aria-expanded="ui.menuOpen"
          @click="ui.toggleMenu()"
        >
          <AppIcon :name="ui.menuOpen ? 'close' : 'menu'" />
        </button>
      </div>
    </div>

    <!-- 抽屉挂在 body 上：header 的 backdrop-filter 会让内部的 fixed 元素相对头部定位，
         收起时的平移会把整个文档撑宽，产生横向滚动条。 -->
    <Teleport to="body">
      <div class="mobile-drawer" :class="{ 'is-open': ui.menuOpen }" :aria-hidden="!ui.menuOpen">
        <form class="drawer-search" role="search" @submit.prevent="submitSearch">
          <AppIcon name="search" />
          <input
            v-model="searchValue"
            type="search"
            name="q"
            placeholder="今天想吃什么？"
          />
        </form>

        <nav class="drawer-nav" aria-label="移动端导航">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            class="drawer-link"
            :class="{ 'is-active': item.active }"
            :to="item.to"
          >
            {{ item.label }}<AppIcon name="chevronRight" />
          </RouterLink>
        </nav>

        <div class="drawer-actions">
          <RouterLink class="btn btn--primary btn--block" to="/publish" @click="ui.closeMenu()">
            <AppIcon name="plus" /> 发布我的菜谱
          </RouterLink>
          <RouterLink
            v-if="auth.isLoggedIn"
            class="btn btn--soft btn--block"
            to="/me"
            @click="ui.closeMenu()"
          >
            <AppIcon name="user" /> 个人中心
          </RouterLink>
          <button v-else class="btn btn--soft btn--block" type="button" @click="openAuth">
            <AppIcon name="user" /> 登录 / 注册
          </button>
        </div>
      </div>
      <button
        class="drawer-backdrop"
        :class="{ 'is-open': ui.menuOpen }"
        type="button"
        aria-label="关闭菜单"
        tabindex="-1"
        @click="ui.closeMenu()"
      ></button>
    </Teleport>
  </header>
</template>
