<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { apiDelete, apiGet, apiPost } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useUiStore } from '@/stores/ui';
import { useToastStore } from '@/stores/toast';
import { compactNumber, formatDate } from '@/utils/format';
import { trackRecipe, toggleFavorite, toggleLike } from '@/composables/useRecipeActions';
import { confirmDialog } from '@/services/confirm';
import RecipeCard from '@/components/RecipeCard.vue';
import CommentItem from '@/components/CommentItem.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import PageLoader from '@/components/PageLoader.vue';
import ErrorState from '@/components/ErrorState.vue';

const route = useRoute();
const auth = useAuthStore();
const ui = useUiStore();
const toast = useToastStore();

const loading = ref(true);
const errorStatus = ref(0);
const recipe = ref(null);
const related = ref([]);

const commentText = ref('');
const formError = ref('');
const submitting = ref(false);
const commentsSection = ref(null);
const commentInput = ref(null);

const isAdmin = computed(() => auth.isAdmin);
const comments = computed(() => recipe.value?.comments || []);

function openImage(src, alt) {
  if (!src) return;
  ui.openLightbox(src, alt || '菜谱图片');
}

async function load() {
  const id = route.params.id;
  if (!id) {
    errorStatus.value = 404;
    loading.value = false;
    return;
  }

  loading.value = true;
  errorStatus.value = 0;
  try {
    const [detailData, relatedData] = await Promise.all([
      apiGet(`/recipes/${encodeURIComponent(id)}`),
      apiGet('/recipes?sort=hot&limit=5').catch(() => ({ items: [] }))
    ]);
    recipe.value = detailData.recipe;
    trackRecipe(detailData.recipe);
    related.value = (relatedData.items || [])
      .filter((item) => item.id !== detailData.recipe.id)
      .slice(0, 3);
    document.title = `${detailData.recipe.title} · 食光记`;
  } catch (error) {
    errorStatus.value = error.status || 0;
  } finally {
    loading.value = false;
  }
}

function scrollToComments() {
  commentsSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function focusComment() {
  scrollToComments();
  await nextTick();
  commentInput.value?.focus({ preventScroll: true });
}

async function copyLink() {
  const url = window.location.href;
  try {
    await navigator.clipboard.writeText(url);
    toast.success('链接已复制，去分享给朋友吧');
  } catch {
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      toast.success('链接已复制，去分享给朋友吧');
    } catch {
      toast.error('复制失败，请从地址栏复制链接');
    }
    input.remove();
  }
}

async function submitComment() {
  const content = commentText.value.trim();
  formError.value = '';
  if (content.length < 2) {
    formError.value = '留言至少需要 2 个字';
    commentInput.value?.focus();
    return;
  }

  submitting.value = true;
  try {
    const data = await apiPost(
      `/recipes/${encodeURIComponent(recipe.value.id)}/comments`,
      { content }
    );
    recipe.value.comments = [...(recipe.value.comments || []), data.comment];
    recipe.value.commentCount = data.commentCount;
    commentText.value = '';
    toast.success('留言已送达');
  } catch (error) {
    formError.value = error.message;
  } finally {
    submitting.value = false;
  }
}

async function deleteComment(comment) {
  const confirmed = await confirmDialog({
    title: '删除这条留言？',
    message: '留言删除后将无法恢复。',
    confirmText: '删除留言',
    danger: true
  });
  if (!confirmed) return;
  try {
    await apiDelete(`/comments/${encodeURIComponent(comment.id)}`);
    recipe.value.comments = (recipe.value.comments || []).filter(
      (item) => item.id !== comment.id
    );
    recipe.value.commentCount = Math.max(0, (recipe.value.commentCount || 0) - 1);
    toast.info('留言已删除');
  } catch (error) {
    toast.error(error.message);
  }
}

watch(() => route.params.id, load, { immediate: true });
</script>

<template>
  <PageLoader v-if="loading" />
  <ErrorState v-else-if="errorStatus" :status="errorStatus" @retry="load" />
  <div v-else-if="recipe" class="detail-page">
    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑导航">
        <RouterLink to="/">首页</RouterLink><AppIcon name="chevronRight" />
        <RouterLink to="/recipes">菜谱</RouterLink><AppIcon name="chevronRight" />
        <RouterLink :to="{ name: 'recipes', query: { category: recipe.category } }">
          {{ recipe.category }}
        </RouterLink>
        <AppIcon name="chevronRight" />
        <span>{{ recipe.title }}</span>
      </nav>

      <div
        v-if="recipe.status !== 'approved'"
        class="detail-status"
        :class="{ 'detail-status--danger': recipe.status === 'rejected' }"
      >
        <span class="detail-status__icon">
          <AppIcon :name="recipe.status === 'rejected' ? 'alert' : 'clock'" />
        </span>
        <div>
          <strong>{{
            recipe.status === 'rejected' ? '这份菜谱没有通过审核' : '这份菜谱正在等待审核'
          }}</strong>
          <p>
            {{
              recipe.status === 'rejected'
                ? recipe.rejectReason || '可以按照管理员的建议修改后再次提交。'
                : '只有你和管理员可以看见它，审核通过后就会出现在社区里。'
            }}
          </p>
        </div>
        <div class="detail-status__actions">
          <RouterLink
            class="btn btn--small btn--soft"
            :to="{ path: '/publish', query: { id: recipe.id } }"
          >
            <AppIcon name="edit" /> 修改菜谱
          </RouterLink>
          <button
            v-if="isAdmin && recipe.status === 'pending'"
            class="btn btn--small btn--primary"
            type="button"
            @click="ui.openReview(recipe.id)"
          >
            去审核
          </button>
        </div>
      </div>

      <article class="detail-hero">
        <button
          class="detail-cover"
          type="button"
          aria-label="查看大图"
          @click="openImage(recipe.cover, recipe.title)"
        >
          <img :src="recipe.cover" :alt="recipe.title" decoding="async" />
          <span class="detail-cover__zoom"><AppIcon name="search" /> 查看大图</span>
        </button>
        <div class="detail-intro">
          <div class="detail-tags">
            <span class="category-label">{{ recipe.category }}</span>
            <RouterLink
              v-for="tag in recipe.tags"
              :key="tag"
              class="tag tag--link"
              :to="{ name: 'recipes', query: { tag } }"
            >
              {{ tag }}
            </RouterLink>
          </div>
          <h1>{{ recipe.title }}</h1>
          <p class="detail-summary">{{ recipe.summary }}</p>
          <div class="detail-author">
            <UserAvatar :user="recipe.author" size="md" />
            <div>
              <strong>{{ recipe.author?.nickname || '厨友' }}</strong>
              <span>{{ formatDate(recipe.createdAt) }} 发布 · {{ compactNumber(recipe.viewCount) }} 次浏览</span>
            </div>
            <span v-if="recipe.isOwner" class="author-self">我的作品</span>
          </div>
          <div class="detail-metrics">
            <div>
              <span><AppIcon name="clock" /> 烹饪时间</span>
              <strong>{{ recipe.time }} <small>分钟</small></strong>
            </div>
            <div>
              <span><AppIcon name="users" /> 份量</span>
              <strong>{{ recipe.servings }} <small>人份</small></strong>
            </div>
            <div>
              <span><AppIcon name="chefHat" /> 难度</span>
              <strong>{{ recipe.difficulty }}</strong>
            </div>
          </div>
          <div class="detail-actions">
            <button
              class="detail-action detail-action--like"
              :class="{ 'is-active': recipe.liked }"
              type="button"
              :aria-pressed="recipe.liked"
              :aria-label="recipe.liked ? '取消喜欢' : '喜欢这道菜谱'"
              @click="toggleLike(recipe)"
            >
              <span class="detail-action__icon"><AppIcon name="heart" /></span>
              <span class="detail-action__text">
                <strong>{{ compactNumber(recipe.likeCount) }}</strong><small>喜欢</small>
              </span>
            </button>
            <button
              class="detail-action"
              :class="{ 'is-active': recipe.favorited }"
              type="button"
              :aria-pressed="recipe.favorited"
              :aria-label="recipe.favorited ? '取消收藏' : '收藏这道菜谱'"
              @click="toggleFavorite(recipe)"
            >
              <span class="detail-action__icon"><AppIcon name="bookmark" /></span>
              <span class="detail-action__text">
                <strong>{{ compactNumber(recipe.favoriteCount) }}</strong><small>收藏</small>
              </span>
            </button>
            <button
              class="detail-action"
              type="button"
              aria-label="前往留言区"
              @click="scrollToComments"
            >
              <span class="detail-action__icon"><AppIcon name="message" /></span>
              <span class="detail-action__text">
                <strong>{{ comments.length }}</strong><small>留言</small>
              </span>
            </button>
            <button
              class="detail-action detail-action--share"
              type="button"
              aria-label="分享这道菜谱"
              @click="copyLink"
            >
              <span class="detail-action__icon"><AppIcon name="share" /></span>
              <span class="detail-action__text"><strong>分享</strong><small>给朋友</small></span>
            </button>
            <RouterLink
              v-if="recipe.isOwner"
              class="detail-action detail-action--edit"
              :to="{ path: '/publish', query: { id: recipe.id } }"
            >
              <span class="detail-action__icon"><AppIcon name="edit" /></span>
              <span class="detail-action__text"><strong>编辑</strong><small>我的菜谱</small></span>
            </RouterLink>
          </div>
        </div>
      </article>

      <div class="detail-body">
        <div class="detail-main">
          <section class="content-card steps-section">
            <div class="content-heading">
              <div><p class="eyebrow">STEP BY STEP</p><h2>烹饪步骤</h2></div>
              <span class="content-heading__meta">共 {{ recipe.steps.length }} 步</span>
            </div>
            <ol class="steps-list">
              <li
                v-for="(step, index) in recipe.steps"
                :key="index"
                class="step-item"
                :class="{ 'step-item--no-image': !step.image }"
              >
                <div class="step-number">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="step-copy">
                  <span class="step-label">STEP {{ String(index + 1).padStart(2, '0') }}</span>
                  <p>{{ step.text }}</p>
                </div>
                <button
                  v-if="step.image"
                  class="step-photo"
                  type="button"
                  @click="openImage(step.image, `步骤 ${index + 1} 配图`)"
                >
                  <img :src="step.image" :alt="`步骤 ${index + 1} 配图`" loading="lazy" />
                </button>
              </li>
            </ol>
          </section>

          <section v-if="recipe.tips" class="tips-card">
            <span class="tips-card__icon"><AppIcon name="chefHat" /></span>
            <div>
              <p class="eyebrow">A NOTE FROM THE KITCHEN</p>
              <h2>作者的小贴士</h2>
              <p>{{ recipe.tips }}</p>
            </div>
          </section>

          <section ref="commentsSection" class="comments-section" id="comments">
            <div class="comments-head">
              <div>
                <p class="eyebrow">AROUND THE TABLE</p>
                <h2>厨房留言 <span>{{ comments.length }}</span></h2>
              </div>
              <AppIcon name="message" />
            </div>

            <form v-if="auth.isLoggedIn" class="comment-form" @submit.prevent="submitComment">
              <UserAvatar :user="auth.user" size="sm" />
              <div class="comment-form__field">
                <label class="visually-hidden" for="comment-content">写下你的厨房留言</label>
                <textarea
                  id="comment-content"
                  ref="commentInput"
                  v-model="commentText"
                  name="content"
                  maxlength="400"
                  placeholder="做过之后有什么想说的？或者问问作者…"
                  required
                ></textarea>
                <div class="comment-form__foot">
                  <span><span>{{ commentText.length }}</span> / 400</span>
                  <p v-show="formError" class="form-error">{{ formError }}</p>
                  <button
                    class="btn btn--primary btn--small"
                    :class="{ 'is-busy': submitting }"
                    type="submit"
                    :disabled="submitting"
                    :aria-busy="submitting ? 'true' : undefined"
                  >
                    发送留言 <AppIcon name="send" />
                  </button>
                </div>
              </div>
            </form>
            <div v-else class="login-prompt">
              <span><AppIcon name="message" /></span>
              <div>
                <strong>登录后，和作者聊两句</strong>
                <p>留下你的做菜心得，也可以问问火候和小技巧。</p>
              </div>
              <button class="btn btn--soft btn--small" type="button" @click="ui.openAuth('login')">
                登录 / 注册
              </button>
            </div>

            <ul class="comment-list">
              <CommentItem
                v-for="comment in comments"
                :key="comment.id"
                :comment="comment"
                allow-delete
                @delete="deleteComment"
              />
              <li v-if="!comments.length" class="comment-empty">
                还没有留言。来做第一个聊聊这道菜的人吧。
              </li>
            </ul>
          </section>
        </div>

        <aside class="detail-side">
          <section class="ingredients-card sticky-card">
            <div class="content-heading">
              <div><p class="eyebrow">INGREDIENTS</p><h2>食材清单</h2></div>
              <span class="content-heading__meta">{{ recipe.servings }} 人份</span>
            </div>
            <ul class="ingredients-list">
              <li v-for="(item, index) in recipe.ingredients" :key="index">
                <span class="ingredient-index">{{ String(index + 1).padStart(2, '0') }}</span>
                <span class="ingredient-name">{{ item.name }}</span>
                <span v-if="item.amount" class="ingredient-amount">{{ item.amount }}</span>
              </li>
            </ul>
            <p class="ingredients-note">
              <AppIcon name="leaf" /> 食材用量可以按手边的材料灵活调整，味道对了就好。
            </p>
          </section>

          <section class="author-card">
            <p class="eyebrow">THE COOK</p>
            <div class="author-card__person">
              <UserAvatar :user="recipe.author" size="lg" />
              <div>
                <strong>{{ recipe.author?.nickname || '厨友' }}</strong>
                <span>@{{ recipe.author?.username || '' }}</span>
              </div>
            </div>
            <p>{{ recipe.author?.bio || '正在用美食记录生活。' }}</p>
            <RouterLink
              class="text-link"
              :to="{ name: 'recipes', query: { author: recipe.author?.id || '' } }"
            >
              Ta 的其他菜谱 <AppIcon name="arrowRight" />
            </RouterLink>
          </section>

          <svg class="side-illustration" viewBox="0 0 240 140" fill="none" aria-hidden="true">
            <path d="M28 100c22-30 45-30 67 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M54 91c18-20 35-20 52 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            <path d="M204 34v61M193 48c0-15 11-25 11-25s11 10 11 25" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="204" cy="104" r="8" stroke="currentColor" stroke-width="1.2"/>
            <path d="M90 118h80" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-dasharray="2 8"/>
          </svg>
        </aside>
      </div>

      <section v-if="related.length" class="related-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">MORE FROM THE KITCHEN</p>
            <h2 class="section-title">你也许还想做</h2>
          </div>
          <RouterLink class="text-link" to="/recipes">更多菜谱 <AppIcon name="arrowRight" /></RouterLink>
        </div>
        <div class="recipe-grid recipe-grid--three">
          <RecipeCard v-for="item in related" :key="item.id" :recipe="item" />
        </div>
      </section>
    </div>

    <div class="mobile-detail-bar">
      <button
        class="mobile-detail-bar__item"
        :class="{ 'is-active': recipe.liked }"
        type="button"
        aria-label="喜欢"
        @click="toggleLike(recipe)"
      >
        <AppIcon name="heart" /><span>{{ compactNumber(recipe.likeCount) }}</span>
      </button>
      <button
        class="mobile-detail-bar__item"
        :class="{ 'is-active': recipe.favorited }"
        type="button"
        aria-label="收藏"
        @click="toggleFavorite(recipe)"
      >
        <AppIcon name="bookmark" /><span>{{ compactNumber(recipe.favoriteCount) }}</span>
      </button>
      <button
        class="mobile-detail-bar__item"
        type="button"
        aria-label="留言"
        @click="scrollToComments"
      >
        <AppIcon name="message" /><span>{{ comments.length }}</span>
      </button>
      <button class="mobile-detail-bar__cta" type="button" @click="focusComment">写下留言</button>
    </div>
  </div>
</template>
