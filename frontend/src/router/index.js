import { createRouter, createWebHashHistory } from 'vue-router';

import HomeView from '@/views/HomeView.vue';
import RecipesView from '@/views/RecipesView.vue';
import HotView from '@/views/HotView.vue';
import RecipeDetailView from '@/views/RecipeDetailView.vue';
import PublishView from '@/views/PublishView.vue';
import ProfileView from '@/views/ProfileView.vue';
import NotFoundView from '@/views/NotFoundView.vue';
import AdminLayout from '@/views/admin/AdminLayout.vue';
import AdminOverview from '@/views/admin/AdminOverview.vue';
import AdminReview from '@/views/admin/AdminReview.vue';
import AdminRecipes from '@/views/admin/AdminRecipes.vue';
import AdminUsers from '@/views/admin/AdminUsers.vue';

const APP_TITLE = '食光记 · 美食菜谱分享社区';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/recipes', name: 'recipes', component: RecipesView },
  { path: '/hot', name: 'hot', component: HotView },
  { path: '/recipe/:id', name: 'recipe-detail', component: RecipeDetailView },
  { path: '/publish', name: 'publish', component: PublishView },
  { path: '/me', name: 'profile', component: ProfileView },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'admin-overview', component: AdminOverview },
      { path: 'review', name: 'admin-review', component: AdminReview },
      { path: 'recipes', name: 'admin-recipes', component: AdminRecipes },
      { path: 'users', name: 'admin-users', component: AdminUsers }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  }
});

router.afterEach((to) => {
  document.title = to.meta?.title || APP_TITLE;
});

export default router;
