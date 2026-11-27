import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    menuOpen: false,
    authOpen: false,
    authTab: 'login',
    lightbox: { open: false, src: '', alt: '' },
    reviewId: '',
    refreshToken: 0
  }),
  actions: {
    openAuth(tab = 'login') {
      this.authTab = tab === 'register' ? 'register' : 'login';
      this.authOpen = true;
    },
    closeAuth() {
      this.authOpen = false;
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    closeMenu() {
      this.menuOpen = false;
    },
    openLightbox(src, alt = '') {
      this.lightbox = { open: true, src, alt };
    },
    closeLightbox() {
      this.lightbox = { open: false, src: '', alt: '' };
    },
    openReview(id) {
      this.reviewId = id;
    },
    closeReview() {
      this.reviewId = '';
    },
    refresh() {
      this.refreshToken += 1;
    }
  }
});
