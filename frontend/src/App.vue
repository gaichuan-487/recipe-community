<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import SiteHeader from '@/components/SiteHeader.vue';
import SiteFooter from '@/components/SiteFooter.vue';
import AuthModal from '@/components/AuthModal.vue';
import ReviewModal from '@/components/ReviewModal.vue';
import ImageLightbox from '@/components/ImageLightbox.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ToastHost from '@/components/ToastHost.vue';

const auth = useAuthStore();
const ui = useUiStore();

// 登录/退出或显式刷新时重建当前页面，等价于原版的 renderRoute()。
const viewKey = computed(() => `${auth.user?.id || 'guest'}-${ui.refreshToken}`);
</script>

<template>
  <SiteHeader />
  <main id="main" tabindex="-1">
    <RouterView v-slot="{ Component }">
      <component :is="Component" :key="viewKey" />
    </RouterView>
  </main>
  <SiteFooter />

  <AuthModal v-if="ui.authOpen" />
  <ReviewModal v-if="ui.reviewId" />
  <ImageLightbox />
  <ConfirmDialog />
  <ToastHost />
</template>
