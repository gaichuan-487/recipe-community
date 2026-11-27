<script setup>
import { computed } from 'vue';
import { formatRelative } from '@/utils/format';
import { useAuthStore } from '@/stores/auth';
import UserAvatar from '@/components/UserAvatar.vue';

const props = defineProps({
  comment: { type: Object, required: true },
  allowDelete: { type: Boolean, default: false }
});

const emit = defineEmits(['delete']);
const auth = useAuthStore();

const canDelete = computed(
  () =>
    props.allowDelete &&
    auth.isLoggedIn &&
    (props.comment.author?.id === auth.user?.id || auth.isAdmin)
);
</script>

<template>
  <li class="comment-item" :data-comment-id="comment.id">
    <UserAvatar :user="comment.author" size="sm" />
    <div class="comment-item__body">
      <div class="comment-item__head">
        <div>
          <strong>{{ comment.author?.nickname || '厨友' }}</strong>
          <span>{{ formatRelative(comment.createdAt) }}</span>
        </div>
        <button
          v-if="canDelete"
          class="text-button text-button--danger"
          type="button"
          @click="emit('delete', comment)"
        >
          删除
        </button>
      </div>
      <p>{{ comment.content }}</p>
    </div>
  </li>
</template>
