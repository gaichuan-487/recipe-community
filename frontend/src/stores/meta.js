import { defineStore } from 'pinia';
import { apiGet } from '@/api/client';

export const useMetaStore = defineStore('meta', {
  state: () => ({
    meta: null,
    loading: false,
    error: ''
  }),
  getters: {
    categories: (state) => state.meta?.categories || [],
    difficulties: (state) => state.meta?.difficulties || [],
    tagGroups: (state) => state.meta?.tagGroups || [],
    community: (state) => state.meta?.community || { approvedRecipes: 0, cooks: 0, totalLikes: 0 }
  },
  actions: {
    async load(force = false) {
      if (this.meta && !force) return this.meta;
      if (this.loading) return this.meta;
      this.loading = true;
      this.error = '';
      try {
        this.meta = await apiGet('/meta');
        return this.meta;
      } catch (error) {
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
    },
    async ensure() {
      if (this.meta) return this.meta;
      return this.load();
    }
  }
});
