import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import AppIcon from '@/icons/AppIcon.vue';
import { setUnauthorizedHandler } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useMetaStore } from '@/stores/meta';

import '@/assets/style.css';
import '@/assets/overrides.css';

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();

  app.component('AppIcon', AppIcon);
  app.use(pinia);
  app.use(router);

  const auth = useAuthStore(pinia);
  const meta = useMetaStore(pinia);
  setUnauthorizedHandler(() => auth.clearSession());

  await Promise.all([auth.init(), meta.load()]);

  app.mount('#app');
}

bootstrap();
