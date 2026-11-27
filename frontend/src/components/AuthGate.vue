<script setup>
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';

defineProps({
  eyebrow: { type: String, default: 'SHARE YOUR TABLE' },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  adminOnly: { type: Boolean, default: false }
});

const auth = useAuthStore();
const ui = useUiStore();
</script>

<template>
  <section class="auth-gate container">
    <div class="auth-gate__visual">
      <div class="auth-gate__card">
        <img :src="'/images/ingredients.jpg'" alt="料理台上的新鲜食材" />
        <span class="stamp-note">{{ adminOnly ? '后厨入口' : '欢迎回来' }}</span>
      </div>
    </div>
    <div class="auth-gate__copy">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <div class="auth-gate__actions">
        <template v-if="auth.isLoggedIn">
          <RouterLink class="btn btn--primary" to="/me">回到个人中心</RouterLink>
          <RouterLink class="btn btn--soft" to="/">四处逛逛</RouterLink>
        </template>
        <template v-else>
          <button class="btn btn--primary" type="button" @click="ui.openAuth('login')">
            {{ adminOnly ? '登录管理账号' : '登录 / 注册' }}
          </button>
          <RouterLink class="btn btn--soft" to="/">先去逛逛</RouterLink>
        </template>
      </div>
      <div v-if="adminOnly && !auth.isLoggedIn" class="auth-gate__hint">
        <strong>体验管理员</strong><span>admin / admin123</span>
      </div>
    </div>
  </section>
</template>
