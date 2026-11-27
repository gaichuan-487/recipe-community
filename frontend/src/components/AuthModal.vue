<script setup>
import { nextTick, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { useToastStore } from '@/stores/toast';
import BaseModal from '@/components/BaseModal.vue';

const auth = useAuthStore();
const ui = useUiStore();
const toast = useToastStore();

const mode = ref(ui.authTab === 'register' ? 'register' : 'login');
const error = ref('');
const busy = ref(false);
const quickBusy = ref('');
const formArea = ref(null);

const loginForm = ref({ username: '', password: '' });
const registerForm = ref({ nickname: '', username: '', password: '', confirm: '' });

watch(
  () => ui.authTab,
  (tab) => {
    mode.value = tab === 'register' ? 'register' : 'login';
    error.value = '';
  }
);

function switchTab(tab) {
  mode.value = tab;
  ui.authTab = tab;
  error.value = '';
  nextTick(() => {
    formArea.value?.querySelector('input')?.focus();
  });
}

function finish(user, message) {
  ui.closeAuth();
  toast.success(message || `欢迎回来，${user.nickname}`);
}

async function submitLogin() {
  error.value = '';
  const username = loginForm.value.username.trim();
  const password = loginForm.value.password;

  if (!username || !password) {
    error.value = '请把用户名和密码都填好';
    return;
  }

  busy.value = true;
  try {
    const user = await auth.login(username, password);
    finish(user);
  } catch (err) {
    error.value = err.message;
  } finally {
    busy.value = false;
  }
}

async function submitRegister() {
  error.value = '';
  const form = registerForm.value;
  const nickname = form.nickname.trim();
  const username = form.username.trim();
  const password = form.password;
  const confirm = form.confirm;

  if (!nickname || !username || !password) {
    error.value = '请完整填写昵称、用户名和密码';
    return;
  }
  if (password.length < 6) {
    error.value = '密码至少需要 6 位';
    return;
  }
  if (password !== confirm) {
    error.value = '两次输入的密码不一致';
    return;
  }

  busy.value = true;
  try {
    const user = await auth.register({ nickname, username, password });
    finish(user, `账号创建成功，欢迎你，${user.nickname}`);
  } catch (err) {
    error.value = err.message;
  } finally {
    busy.value = false;
  }
}

async function quickLogin(username) {
  const password = username === 'admin' ? 'admin123' : '123456';
  quickBusy.value = username;
  try {
    const user = await auth.login(username, password);
    finish(user, `已切换到${user.role === 'admin' ? '管理员' : '体验'}账号`);
  } catch (err) {
    toast.error(err.message);
  } finally {
    quickBusy.value = '';
  }
}
</script>

<template>
  <BaseModal
    v-if="ui.authOpen"
    modal-class="modal--auth"
    :label="mode === 'login' ? '登录' : '注册'"
    @close="ui.closeAuth()"
  >
    <div class="auth-layout">
      <div class="auth-art" :style="{ backgroundImage: `url('/images/ingredients.jpg')` }">
        <div class="auth-art__wash"></div>
        <div class="auth-art__content">
          <span class="brand-mark brand-mark--light"><span>食</span></span>
          <p class="eyebrow">WELCOME TO THE TABLE</p>
          <h2>每一次下厨，<br />都值得被记住。</h2>
          <p>收藏灵感，分享步骤，和认真吃饭的人交换厨房日常。</p>
          <span class="auth-art__seal">烟火<br />可亲</span>
        </div>
      </div>

      <div class="auth-panel">
        <div class="auth-tabs" role="tablist" aria-label="登录或注册">
          <button
            class="auth-tab"
            :class="{ 'is-active': mode === 'login' }"
            type="button"
            role="tab"
            :aria-selected="mode === 'login'"
            @click="switchTab('login')"
          >
            登录
          </button>
          <button
            class="auth-tab"
            :class="{ 'is-active': mode === 'register' }"
            type="button"
            role="tab"
            :aria-selected="mode === 'register'"
            @click="switchTab('register')"
          >
            注册
          </button>
        </div>

        <div ref="formArea">
          <form
            v-if="mode === 'login'"
            class="auth-form"
            novalidate
            @submit.prevent="submitLogin"
          >
            <div class="field">
              <label class="field-label" for="login-username">用户名</label>
              <input
                id="login-username"
                v-model="loginForm.username"
                class="input"
                name="username"
                placeholder="输入你的用户名"
                autocomplete="username"
                data-autofocus
                required
              />
            </div>
            <div class="field">
              <label class="field-label" for="login-password">密码</label>
              <input
                id="login-password"
                v-model="loginForm.password"
                class="input"
                name="password"
                type="password"
                placeholder="输入密码"
                autocomplete="current-password"
                required
              />
            </div>
            <p v-if="error" class="form-error">{{ error }}</p>
            <button
              class="btn btn--primary btn--block auth-submit"
              :class="{ 'is-busy': busy }"
              type="submit"
              :disabled="busy"
              :aria-busy="busy"
            >
              进入我的厨房
            </button>
            <p class="auth-switch">
              还没有账号？
              <button type="button" @click="switchTab('register')">注册一个</button>
            </p>
          </form>

          <form v-else class="auth-form" novalidate @submit.prevent="submitRegister">
            <div class="field">
              <label class="field-label" for="register-nickname">怎么称呼你</label>
              <input
                id="register-nickname"
                v-model="registerForm.nickname"
                class="input"
                name="nickname"
                maxlength="20"
                placeholder="例如：林小厨"
                autocomplete="nickname"
                data-autofocus
                required
              />
            </div>
            <div class="field">
              <label class="field-label" for="register-username">用户名</label>
              <input
                id="register-username"
                v-model="registerForm.username"
                class="input"
                name="username"
                maxlength="20"
                placeholder="2–20 位字母、数字或中文"
                autocomplete="username"
                required
              />
            </div>
            <div class="field">
              <label class="field-label" for="register-password">密码</label>
              <input
                id="register-password"
                v-model="registerForm.password"
                class="input"
                name="password"
                type="password"
                placeholder="至少 6 位"
                autocomplete="new-password"
                required
              />
            </div>
            <div class="field">
              <label class="field-label" for="register-confirm">确认密码</label>
              <input
                id="register-confirm"
                v-model="registerForm.confirm"
                class="input"
                name="confirm"
                type="password"
                placeholder="再输入一次密码"
                autocomplete="new-password"
                required
              />
            </div>
            <p v-if="error" class="form-error">{{ error }}</p>
            <button
              class="btn btn--primary btn--block auth-submit"
              :class="{ 'is-busy': busy }"
              type="submit"
              :disabled="busy"
              :aria-busy="busy"
            >
              创建我的账号
            </button>
            <p class="auth-switch">
              已经有账号？
              <button type="button" @click="switchTab('login')">直接登录</button>
            </p>
          </form>
        </div>

        <div class="demo-box">
          <div class="demo-box__head">
            <span>没有账号？直接体验</span><span class="demo-box__line"></span>
          </div>
          <div class="demo-buttons">
            <button
              class="demo-button"
              :class="{ 'is-busy': quickBusy === 'xiaoyu' }"
              type="button"
              :disabled="Boolean(quickBusy)"
              @click="quickLogin('xiaoyu')"
            >
              <span class="demo-button__icon"><AppIcon name="chefHat" /></span>
              <span><strong>普通用户</strong><small>xiaoyu / 123456</small></span>
            </button>
            <button
              class="demo-button"
              :class="{ 'is-busy': quickBusy === 'admin' }"
              type="button"
              :disabled="Boolean(quickBusy)"
              @click="quickLogin('admin')"
            >
              <span class="demo-button__icon"><AppIcon name="shield" /></span>
              <span><strong>管理员</strong><small>admin / admin123</small></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseModal>
</template>
