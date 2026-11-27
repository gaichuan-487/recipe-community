import { defineStore } from 'pinia';

let nextId = 1;

export const useToastStore = defineStore('toast', {
  state: () => ({
    items: []
  }),
  actions: {
    push(message, type = 'success') {
      const id = nextId++;
      this.items.push({ id, message: String(message ?? ''), type, visible: false });

      // 两级 rAF，确保先以隐藏状态插入，再触发 is-visible 过渡。
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const item = this.items.find((entry) => entry.id === id);
          if (item) item.visible = true;
        });
      });

      window.setTimeout(() => this.dismiss(id), 3400);
    },
    dismiss(id) {
      const item = this.items.find((entry) => entry.id === id);
      if (!item) return;
      item.visible = false;
      window.setTimeout(() => {
        this.items = this.items.filter((entry) => entry.id !== id);
      }, 260);
    },
    success(message) {
      this.push(message, 'success');
    },
    error(message) {
      this.push(message, 'error');
    },
    info(message) {
      this.push(message, 'info');
    }
  }
});
