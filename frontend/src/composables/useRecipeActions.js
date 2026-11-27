import { reactive } from 'vue';
import { apiPost, apiUpload } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { useToastStore } from '@/stores/toast';

// 存响应式代理而不是原始对象：页面上的数据是 ref 里的代理，
// 直接改原始对象不会触发重渲染。reactive() 对同一目标会返回同一个代理。
const tracked = new Set();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 8 * 1024 * 1024;

export function trackRecipes(list) {
  (list || []).forEach((item) => {
    if (item?.id) tracked.add(reactive(item));
  });
}

export function trackRecipe(item) {
  if (item?.id) tracked.add(reactive(item));
}

export function patchRecipe(id, patch) {
  tracked.forEach((item) => {
    if (item.id === id) Object.assign(reactive(item), patch);
  });
}

export function clearTracked() {
  tracked.clear();
}

function ensureLogin(message) {
  const auth = useAuthStore();
  if (auth.isLoggedIn) return true;

  const ui = useUiStore();
  const toast = useToastStore();
  ui.openAuth('login');
  toast.info(message);
  return false;
}

export async function toggleLike(recipe) {
  if (!ensureLogin('登录后就可以喜欢这道菜谱啦。')) return null;
  try {
    const data = await apiPost(`/recipes/${encodeURIComponent(recipe.id)}/like`);
    patchRecipe(recipe.id, { liked: data.liked, likeCount: data.likeCount });
    return data;
  } catch (error) {
    useToastStore().error(error.message);
    return null;
  }
}

export async function toggleFavorite(recipe) {
  if (!ensureLogin('登录后就可以收藏喜欢的菜谱啦。')) return null;
  try {
    const data = await apiPost(`/recipes/${encodeURIComponent(recipe.id)}/favorite`);
    patchRecipe(recipe.id, { favorited: data.favorited, favoriteCount: data.favoriteCount });
    return data;
  } catch (error) {
    useToastStore().error(error.message);
    return null;
  }
}

export function validateImageFile(file) {
  if (!file) return '请选择要上传的图片';
  if (!ALLOWED_TYPES.includes(file.type)) return '仅支持 JPG、PNG、WebP 或 GIF 图片';
  if (file.size > MAX_SIZE) return '图片不能超过 8MB';
  return '';
}

export async function uploadRecipeImage(file) {
  if (!ensureLogin('登录后就可以上传菜谱图片啦。')) return null;

  const invalid = validateImageFile(file);
  if (invalid) {
    useToastStore().error(invalid);
    return null;
  }

  try {
    const data = await apiUpload(file);
    return data.url;
  } catch (error) {
    useToastStore().error(error.message);
    return null;
  }
}
