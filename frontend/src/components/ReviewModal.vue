<script setup>
import { computed, ref, watch } from 'vue';
import { apiGet, apiPost } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { useToastStore } from '@/stores/toast';
import { formatDateTime } from '@/utils/format';
import BaseModal from '@/components/BaseModal.vue';
import UserAvatar from '@/components/UserAvatar.vue';

const auth = useAuthStore();
const ui = useUiStore();
const toast = useToastStore();

const recipe = ref(null);
const loading = ref(false);
const loadError = ref('');
const reason = ref('');
const formError = ref('');
const busy = ref(false);

const statusText = computed(() => {
  if (!recipe.value) return '';
  if (recipe.value.status === 'approved') return '已发布';
  if (recipe.value.status === 'pending') return '待审核';
  return '未通过';
});

watch(
  () => ui.reviewId,
  async (id) => {
    if (!id) {
      recipe.value = null;
      return;
    }
    if (!auth.isAdmin) {
      toast.error('这个操作需要管理员权限');
      ui.closeReview();
      return;
    }

    recipe.value = null;
    loadError.value = '';
    formError.value = '';
    busy.value = false;
    loading.value = true;
    try {
      const data = await apiGet(`/recipes/${encodeURIComponent(id)}`);
      recipe.value = data.recipe;
      reason.value = data.recipe.rejectReason || '';
    } catch (error) {
      loadError.value = error.message || '菜谱加载失败，请稍后再试。';
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);

function openImage(src, alt) {
  ui.openLightbox(src, alt);
}

async function approve() {
  if (!recipe.value || busy.value) return;
  busy.value = true;
  try {
    await apiPost(`/admin/recipes/${encodeURIComponent(recipe.value.id)}/review`, {
      action: 'approve'
    });
    toast.success('审核通过，这道菜端上桌了');
    ui.closeReview();
    ui.refresh();
  } catch (error) {
    toast.error(error.message);
  } finally {
    busy.value = false;
  }
}

async function reject() {
  if (!recipe.value || busy.value) return;
  const text = reason.value.trim();
  if (text.length < 5) {
    formError.value = '请填写至少 5 个字的驳回建议，让作者知道怎么修改。';
    return;
  }
  formError.value = '';
  busy.value = true;
  try {
    await apiPost(`/admin/recipes/${encodeURIComponent(recipe.value.id)}/review`, {
      action: 'reject',
      reason: text
    });
    toast.info('已驳回，审核建议会显示给作者');
    ui.closeReview();
    ui.refresh();
  } catch (error) {
    formError.value = error.message || '提交失败，请稍后再试。';
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <BaseModal
    v-if="ui.reviewId"
    modal-class="modal--review"
    :label="recipe ? `审核 ${recipe.title}` : '审核菜谱'"
    @close="ui.closeReview()"
  >
    <div v-if="loading" class="review-modal">
      <p class="admin-empty-inline">正在打开菜谱…</p>
    </div>
    <div v-else-if="loadError" class="review-modal">
      <p class="form-error">{{ loadError }}</p>
    </div>
    <div v-else-if="recipe" class="review-modal">
      <header class="review-modal__head">
        <div>
          <p class="eyebrow">REVIEW SUBMISSION</p>
          <h2>{{ recipe.title }}</h2>
          <p>{{ recipe.category }} · {{ recipe.difficulty }} · {{ recipe.time }} 分钟 · {{ recipe.servings }} 人份</p>
        </div>
        <span class="status-pill" :class="`status-pill--${recipe.status}`">{{ statusText }}</span>
      </header>

      <div class="review-preview">
        <button
          class="review-preview__cover"
          type="button"
          @click="openImage(recipe.cover, recipe.title)"
        >
          <img :src="recipe.cover" :alt="recipe.title" />
          <span><AppIcon name="search" /> 查看大图</span>
        </button>
        <div class="review-preview__intro">
          <div class="review-preview__author">
            <UserAvatar :user="recipe.author" size="sm" />
            <div>
              <strong>{{ recipe.author?.nickname || '厨友' }}</strong>
              <span>@{{ recipe.author?.username || '' }} · {{ formatDateTime(recipe.createdAt) }} 提交</span>
            </div>
          </div>
          <p class="review-preview__summary">{{ recipe.summary }}</p>
          <div class="review-preview__tags">
            <span v-for="tag in recipe.tags" :key="tag" class="tag tag--small">{{ tag }}</span>
          </div>
          <p v-if="recipe.reviewedAt" class="review-decision-note">
            <AppIcon name="check" /> 上次处理：{{ formatDateTime(recipe.reviewedAt)
            }}{{ recipe.reviewedBy ? ` · 由 ${recipe.reviewedBy.nickname}` : '' }}
          </p>
        </div>
      </div>

      <div class="review-preview__details">
        <section>
          <h3>食材清单 <span>{{ recipe.ingredients.length }} 项</span></h3>
          <ul class="review-ingredients">
            <li v-for="(item, index) in recipe.ingredients" :key="index">
              <span>{{ item.name }}</span>
              <strong v-if="item.amount">{{ item.amount }}</strong>
            </li>
          </ul>
        </section>
        <section>
          <h3>烹饪步骤 <span>{{ recipe.steps.length }} 步</span></h3>
          <ol class="review-steps">
            <li v-for="(step, index) in recipe.steps" :key="index">
              <span class="review-steps__number">{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <p>{{ step.text }}</p>
                <button
                  v-if="step.image"
                  class="review-steps__image"
                  type="button"
                  @click="openImage(step.image, `步骤 ${index + 1} 配图`)"
                >
                  <img :src="step.image" :alt="`步骤 ${index + 1} 配图`" loading="lazy" />
                </button>
                <span v-else class="review-steps__no-image">未配图</span>
              </div>
            </li>
          </ol>
        </section>
        <section v-if="recipe.tips">
          <h3>作者小贴士</h3>
          <p class="review-tips">{{ recipe.tips }}</p>
        </section>
      </div>

      <div class="review-checkpoints">
        <span><AppIcon name="check" /> 封面清晰</span>
        <span><AppIcon name="check" /> 食材与步骤完整</span>
        <span><AppIcon name="check" /> 图片与内容相符</span>
        <span><AppIcon name="check" /> 表达友好、无广告</span>
      </div>

      <form class="review-actions" @submit.prevent="reject">
        <div class="field">
          <label class="field-label" for="reject-reason">驳回建议</label>
          <textarea
            id="reject-reason"
            v-model="reason"
            class="textarea"
            name="reason"
            rows="3"
            maxlength="200"
            placeholder="写下具体的修改建议，作者会看到这段话。例如：步骤 3 缺少关键火候说明，补充后可再次提交。"
          ></textarea>
          <span class="field-help">只有驳回时才需要填写，至少 5 个字。</span>
        </div>
        <p v-show="formError" class="form-error">{{ formError }}</p>
        <div class="review-actions__row">
          <button class="btn btn--danger-outline" type="submit" :disabled="busy">
            <AppIcon name="close" /> 驳回并通知作者
          </button>
          <button
            class="btn btn--primary"
            :class="{ 'is-busy': busy }"
            type="button"
            :disabled="busy"
            :aria-busy="busy ? 'true' : undefined"
            @click="approve"
          >
            <AppIcon name="check" /> 通过审核
          </button>
        </div>
      </form>
    </div>
  </BaseModal>
</template>
