import { defineStore } from 'pinia';
import { apiGet, apiPost } from '@/api/client';

export const TOKEN_KEY = 'shiguang_token';

let initPromise = null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: null,
    initialized: false
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.user),
    isAdmin: (state) => state.user?.role === 'admin'
  },
  actions: {
    setSession(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem(TOKEN_KEY, token);
    },
    clearSession() {
      this.token = '';
      this.user = null;
      localStorage.removeItem(TOKEN_KEY);
    },
    async init() {
      if (this.initialized) return;
      if (initPromise) return initPromise;

      initPromise = (async () => {
        try {
          if (this.token) {
            const data = await apiGet('/auth/me');
            this.user = data.user;
          }
        } catch {
          this.clearSession();
        } finally {
          this.initialized = true;
          initPromise = null;
        }
      })();

      return initPromise;
    },
    async login(username, password) {
      const data = await apiPost('/auth/login', { username, password });
      this.setSession(data.token, data.user);
      return data.user;
    },
    async register(payload) {
      const data = await apiPost('/auth/register', payload);
      this.setSession(data.token, data.user);
      return data.user;
    },
    async logout() {
      try {
        await apiPost('/auth/logout');
      } catch {
        // 退出接口是无状态的，本地清理成功即可。
      }
      this.clearSession();
    }
  }
});
