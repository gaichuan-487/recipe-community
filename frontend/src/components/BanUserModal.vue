<script setup>
import { ref } from 'vue';
import { apiPost } from '@/api/client';
import { useToastStore } from '@/stores/toast';
import BaseModal from '@/components/BaseModal.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const props = defineProps({
  user: { type: Object, required: true }
});

const emit = defineEmits(['close', 'banned']);

const toast = useToastStore();
const reason = ref('');
const formError = ref('');
const busy = ref(false);

async function submit() {
  if (busy.value) return;
  formError.value = '';
  busy.value = true;
  try {
    const data = await apiPost(
      `/admin/users/${encodeURIComponent(props.user.id)}/ban`,
      { reason: reason.value.trim() }
    );
    toast.success(data.message || '已封禁该账号');
    emit('banned');
  } catch (error) {
    formError.value = error.message || '封禁失败，请稍后再试。';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <BaseModal
    modal-class="modal--ban"
    :label="`封禁 ${user.nickname || user.username}`"
    :dismissible="!busy"
    @close="emit('close')"
  >
    <form class="ban-modal" @submit.prevent="submit">
      <header class="ban-modal__head">
        <p class="eyebrow">BAN ACCOUNT</p>
        <h2>封禁账号</h2>
      </header>

      <div class="ban-modal__user">
        <UserAvatar :user="user" size="sm" />
        <div>
          <strong>{{ user.nickname || user.username }}</strong>
          <span>@{{ user.username }}</span>
        </div>
      </div>

      <p class="ban-modal__hint">
        封禁后，该账号将无法登录、发布、评论或点赞。其已发布的菜谱和评论会继续公开展示。
      </p>

      <div class="field">
        <label class="field-label" for="ban-reason">封禁原因（选填）</label>
        <textarea
          id="ban-reason"
          v-model="reason"
          class="textarea"
          name="reason"
          rows="3"
          maxlength="200"
          placeholder="例如：多次发布违反社区规则的内容。"
          data-autofocus
        ></textarea>
        <span class="field-help">仅用于后台展示，解封后自动清除，最多 200 字。</span>
      </div>

      <p v-show="formError" class="form-error">{{ formError }}</p>

      <div class="ban-modal__actions">
        <button class="btn btn--soft" type="button" :disabled="busy" @click="emit('close')">
          取消
        </button>
        <button
          class="btn btn--danger"
          :class="{ 'is-busy': busy }"
          type="submit"
          :disabled="busy"
          :aria-busy="busy ? 'true' : undefined"
        >
          确认封禁
        </button>
      </div>
    </form>
  </BaseModal>
</template>
