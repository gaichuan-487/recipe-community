<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiGet, apiPost } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { confirmDialog } from '@/services/confirm';
import { formatDate } from '@/utils/format';
import PageLoader from '@/components/PageLoader.vue';
import ErrorState from '@/components/ErrorState.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import BanUserModal from '@/components/BanUserModal.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const toast = useToastStore();

const loading = ref(true);
const errorStatus = ref(0);
const items = ref([]);
const allItems = ref([]);
const searchValue = ref('');
const banTarget = ref(null);
const busyId = ref('');

const status = computed(() =>
  ['active', 'banned'].includes(route.query.status) ? route.query.status : ''
);
const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''));

const counts = computed(() => ({
  all: allItems.value.length,
  active: allItems.value.filter((item) => !item.banned).length,
  banned: allItems.value.filter((item) => item.banned).length
}));

const statusLinks = computed(() => [
  { key: '', label: '全部', count: counts.value.all },
  { key: 'active', label: '正常', count: counts.value.active },
  { key: 'banned', label: '已封禁', count: counts.value.banned }
]);

function statusLink(key) {
  const target = {};
  if (key) target.status = key;
  if (query.value) target.q = query.value;
  return { path: '/admin/users', query: target };
}

function canModerate(item) {
  return item.role === 'user' && item.id !== auth.user?.id;
}

async function load() {
  loading.value = true;
  errorStatus.value = 0;
  searchValue.value = query.value;

  const params = new URLSearchParams();
  if (status.value) params.set('status', status.value);
  if (query.value) params.set('q', query.value);

  try {
    const [filtered, all] = await Promise.all([
      apiGet(`/admin/users${params.toString() ? `?${params.toString()}` : ''}`),
      apiGet('/admin/users')
    ]);
    items.value = filtered.items || [];
    allItems.value = all.items || [];
    document.title = '用户管理 · 食光记后台';
  } catch (error) {
    errorStatus.value = error.status || 0;
  } finally {
    loading.value = false;
  }
}

function submitSearch() {
  const q = searchValue.value.trim();
  const nextQuery = {};
  if (status.value) nextQuery.status = status.value;
  if (q) nextQuery.q = q;
  router.push({ path: '/admin/users', query: nextQuery });
}

function openBan(item) {
  if (!canModerate(item)) return;
  banTarget.value = item;
}

async function handleBanned() {
  banTarget.value = null;
  await load();
}

async function unban(item) {
  if (!canModerate(item) || busyId.value) return;
  const confirmed = await confirmDialog({
    title: '解除这个账号的封禁？',
    message: `解封后，${item.nickname || item.username} 可以重新登录并继续发布内容，封禁原因会被清除。`,
    confirmLabel: '解封'
  });
  if (!confirmed) return;

  busyId.value = item.id;
  try {
    await apiPost(`/admin/users/${encodeURIComponent(item.id)}/unban`);
    toast.success('已解除封禁');
    await load();
  } catch (error) {
    toast.error(error.message);
    if (error.status === 409) await load();
  } finally {
    busyId.value = '';
  }
}

watch(() => route.fullPath, load, { immediate: true });
</script>

<template>
  <PageLoader v-if="loading" />
  <ErrorState v-else-if="errorStatus" :status="errorStatus" @retry="load" />
  <div v-else class="admin-view">
    <header class="admin-view__head">
      <div>
        <p class="eyebrow">COMMUNITY MEMBERS</p>
        <h1>用户管理</h1>
        <p>封禁只会暂停登录与写操作，已发布的菜谱和评论仍会公开展示。</p>
      </div>
      <span class="queue-count"><strong>{{ items.length }}</strong> 位普通用户</span>
    </header>

    <div class="admin-toolbar admin-toolbar--stack">
      <div class="admin-filter-tabs" role="group" aria-label="按状态筛选">
        <RouterLink
          v-for="item in statusLinks"
          :key="item.key || 'all'"
          class="admin-filter-tabs__item"
          :class="{ 'is-active': status === item.key }"
          :to="statusLink(item.key)"
        >
          {{ item.label }}<span>{{ item.count }}</span>
        </RouterLink>
      </div>
      <form class="admin-search" role="search" @submit.prevent="submitSearch">
        <span><AppIcon name="search" /></span>
        <label class="visually-hidden" for="admin-users-q">搜索用户</label>
        <input
          id="admin-users-q"
          v-model="searchValue"
          name="q"
          type="search"
          placeholder="搜索用户名或昵称…"
        />
        <button class="btn btn--small btn--soft" type="submit">搜索</button>
      </form>
    </div>

    <div v-if="items.length" class="admin-table-card">
      <div class="table-scroll">
        <table class="admin-table">
          <thead>
            <tr>
              <th scope="col">用户</th>
              <th scope="col">状态</th>
              <th scope="col">作品 / 留言</th>
              <th scope="col">注册时间</th>
              <th scope="col">封禁信息</th>
              <th scope="col"><span class="visually-hidden">操作</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id" :data-user-id="item.id">
              <td>
                <div class="table-user">
                  <UserAvatar :user="item" size="xs" />
                  <div>
                    <strong>{{ item.nickname || item.username }}</strong>
                    <span>@{{ item.username }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span
                  class="status-pill"
                  :class="item.banned ? 'status-pill--rejected' : 'status-pill--approved'"
                >
                  {{ item.banned ? '已封禁' : '正常' }}
                </span>
              </td>
              <td>
                <span class="table-numbers">
                  {{ item.recipeCount }} 菜谱<br />{{ item.commentCount }} 留言
                </span>
              </td>
              <td><span class="table-date">{{ formatDate(item.createdAt) }}</span></td>
              <td>
                <template v-if="item.banned">
                  <span class="user-reason" :title="item.banReason || '未填写封禁原因'">
                    {{ item.banReason || '未填写原因' }}
                  </span>
                  <span class="table-date">{{ formatDate(item.bannedAt) }}</span>
                </template>
                <span v-else class="table-date">—</span>
              </td>
              <td>
                <div class="table-actions">
                  <button
                    v-if="!item.banned"
                    class="btn btn--tiny btn--danger-outline"
                    type="button"
                    :disabled="!canModerate(item) || busyId === item.id"
                    @click="openBan(item)"
                  >
                    封号
                  </button>
                  <button
                    v-else
                    class="btn btn--tiny btn--soft"
                    type="button"
                    :disabled="!canModerate(item) || busyId === item.id"
                    @click="unban(item)"
                  >
                    解封
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="admin-empty admin-empty--large">
      <span><AppIcon name="users" /></span>
      <div>
        <strong>
          {{
            query
              ? '没有找到匹配的用户'
              : status === 'banned'
                ? '目前没有被封禁的账号'
                : '还没有普通用户注册'
          }}
        </strong>
        <p>
          {{
            query
              ? '换一个用户名或昵称试试，或者清空搜索条件。'
              : status === 'banned'
                ? '账号都处在正常状态，社区很安静。'
                : '等第一位厨友到来时，会出现在这里。'
          }}
        </p>
        <RouterLink class="btn btn--small btn--soft" to="/admin/users">查看全部用户</RouterLink>
      </div>
    </div>

    <BanUserModal
      v-if="banTarget"
      :user="banTarget"
      @close="banTarget = null"
      @banned="handleBanned"
    />
  </div>
</template>
