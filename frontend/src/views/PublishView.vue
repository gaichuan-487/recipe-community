<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { apiGet, apiPost, apiPut } from '@/api/client';
import { useAuthStore } from '@/stores/auth';
import { useMetaStore } from '@/stores/meta';
import { useToastStore } from '@/stores/toast';
import { TAG_EMOJI, CUSTOM_TAG_RE } from '@/utils/tags';
import { uploadRecipeImage } from '@/composables/useRecipeActions';
import AuthGate from '@/components/AuthGate.vue';
import BaseModal from '@/components/BaseModal.vue';
import ErrorState from '@/components/ErrorState.vue';
import PageLoader from '@/components/PageLoader.vue';

const route = useRoute();
const auth = useAuthStore();
const metaStore = useMetaStore();
const toast = useToastStore();

const loading = ref(true);
const errorStatus = ref(0);
const recipe = ref(null);
const submitting = ref(false);
const formError = ref('');
const successRecipe = ref(null);
const successIsEdit = ref(false);
const customTagInput = ref('');
const customTags = ref([]);
const selectedTags = ref([]);
const ingredientEditor = ref(null);
const stepEditorList = ref(null);

const form = reactive({
  title: '',
  summary: '',
  cover: '',
  category: '',
  difficulty: '简单',
  time: 30,
  servings: 2,
  tips: ''
});

const ingredients = ref([]);
const steps = ref([]);
const uploadingCover = ref(false);

const editId = computed(() => (typeof route.query.id === 'string' ? route.query.id : ''));
const submitLabel = computed(() => {
  if (!recipe.value) return '提交审核';
  if (auth.isAdmin) return '保存修改';
  return '保存修改并重新提交';
});
const isApprovedSuccess = computed(() => successRecipe.value?.status === 'approved');

const checklist = computed(() => {
  const checks = {
    basics: form.title.trim().length >= 2 && form.summary.trim().length >= 5,
    cover: Boolean(form.cover),
    ingredients: ingredients.value.filter((item) => item.name.trim()).length >= 3,
    steps:
      steps.value.filter((step) => step.text.trim()).length >= 2 &&
      steps.value.some((step) => step.image),
    tags: selectedTags.value.length >= 1
  };
  const items = Object.keys(checks).map((key) => ({ key, done: checks[key] }));
  const completed = items.filter((item) => item.done).length;
  return {
    items,
    percent: Math.round((completed / items.length) * 100)
  };
});

function resetForm(source) {
  recipe.value = source || null;
  form.title = source?.title || '';
  form.summary = source?.summary || '';
  form.cover = source?.cover || '';
  form.category = source?.category || '';
  form.difficulty = source?.difficulty || '简单';
  form.time = source?.time || 30;
  form.servings = source?.servings || 2;
  form.tips = source?.tips || '';

  const sourceIngredients = source?.ingredients?.length
    ? source.ingredients
    : [{ name: '', amount: '' }, { name: '', amount: '' }, { name: '', amount: '' }];
  ingredients.value = sourceIngredients.map((item) => ({
    name: item.name || '',
    amount: item.amount || ''
  }));

  const sourceSteps = source?.steps?.length ? source.steps : [{}, {}, {}];
  steps.value = sourceSteps.map((step) => ({
    text: step.text || '',
    image: step.image || '',
    uploading: false
  }));

  const metaTags = new Set(metaStore.tagGroups.flatMap((group) => group.tags));
  const tags = source?.tags || [];
  customTags.value = tags.filter((tag) => !metaTags.has(tag));
  selectedTags.value = [...tags];

  customTagInput.value = '';
  formError.value = '';
  successRecipe.value = null;
}

async function load() {
  loading.value = true;
  errorStatus.value = 0;
  if (!auth.isLoggedIn) {
    loading.value = false;
    return;
  }

  const id = editId.value;
  if (!id) {
    resetForm(null);
    loading.value = false;
    return;
  }

  try {
    const data = await apiGet(`/recipes/${encodeURIComponent(id)}`);
    if (data.recipe.author?.id !== auth.user.id && !auth.isAdmin) {
      errorStatus.value = 403;
      return;
    }
    resetForm(data.recipe);
  } catch (error) {
    errorStatus.value = error.status || 0;
  } finally {
    loading.value = false;
  }
}

function toggleTag(value) {
  const index = selectedTags.value.indexOf(value);
  if (index !== -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(value);
  }
}

function isTagDisabled(tag) {
  return !selectedTags.value.includes(tag) && selectedTags.value.length >= 6;
}

function addCustomTag() {
  const value = customTagInput.value.trim();
  if (!value) {
    document.getElementById('custom-tag-input')?.focus();
    return;
  }
  if (!CUSTOM_TAG_RE.test(value)) {
    toast.error('食材名请使用 2–12 个汉字、字母或数字');
    return;
  }

  if (customTags.value.includes(value)) {
    if (!selectedTags.value.includes(value)) {
      if (selectedTags.value.length >= 6) {
        toast.error('最多选择 6 个标签，先取消一个再添加');
        return;
      }
      selectedTags.value.push(value);
    }
  } else {
    if (selectedTags.value.length >= 6) {
      toast.error('最多选择 6 个标签，先取消一个再添加');
      return;
    }
    customTags.value.push(value);
    selectedTags.value.push(value);
  }

  customTagInput.value = '';
  toast.success(`已添加食材标签「${value}」`);
}

function addIngredient() {
  ingredients.value.push({ name: '', amount: '' });
  nextTick(() => {
    const inputs = ingredientEditor.value?.querySelectorAll('.ingredient-name');
    inputs?.[inputs.length - 1]?.focus();
  });
}

function removeIngredient(index) {
  if (ingredients.value.length <= 1) return;
  ingredients.value.splice(index, 1);
}

function addStep() {
  steps.value.push({ text: '', image: '', uploading: false });
  nextTick(() => {
    const areas = stepEditorList.value?.querySelectorAll('.step-text');
    areas?.[areas.length - 1]?.focus();
  });
}

function removeStep(index) {
  if (steps.value.length <= 1) return;
  steps.value.splice(index, 1);
}

async function onCoverUpload(event) {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  uploadingCover.value = true;
  try {
    const url = await uploadRecipeImage(file);
    if (url) {
      form.cover = url;
      toast.success('图片上传好了');
    }
  } finally {
    uploadingCover.value = false;
    input.value = '';
  }
}

async function onStepUpload(step, event) {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  step.uploading = true;
  try {
    const url = await uploadRecipeImage(file);
    if (url) {
      step.image = url;
      toast.success('图片上传好了');
    }
  } finally {
    step.uploading = false;
    input.value = '';
  }
}

function collectPayload() {
  return {
    title: form.title.trim(),
    summary: form.summary.trim(),
    cover: form.cover,
    category: form.category,
    difficulty: form.difficulty,
    time: Number(form.time),
    servings: Number(form.servings),
    tags: [...selectedTags.value],
    ingredients: ingredients.value
      .map((item) => ({ name: item.name.trim(), amount: item.amount.trim() }))
      .filter((item) => item.name),
    steps: steps.value
      .map((step) => ({ text: step.text.trim(), image: step.image }))
      .filter((item) => item.text),
    tips: form.tips.trim()
  };
}

function validatePayload(payload) {
  if (payload.title.length < 2) return '先给菜谱起一个名字吧';
  if (payload.summary.length < 5) return '用一句话介绍这道菜的特别之处吧';
  if (!payload.cover) return '请上传一张菜谱封面图';
  if (!payload.category) return '请选择菜谱分类';
  if (!Number.isFinite(payload.time) || payload.time < 5) return '请填写合理的烹饪时间';
  if (!Number.isInteger(payload.servings) || payload.servings < 1) return '请填写份量';
  if (!payload.tags.length) return '至少选择一个食材或风味标签';
  if (payload.tags.length > 6) return '标签最多选择 6 个';
  if (!payload.ingredients.length) return '请填写食材清单';
  if (!payload.steps.length) return '请至少写下一个烹饪步骤';
  if (!payload.steps.some((step) => step.image)) return '整份菜谱至少需要一张步骤配图';
  return '';
}

async function submit() {
  if (uploadingCover.value || steps.value.some((step) => step.uploading)) {
    formError.value = '还有图片正在上传，请稍等片刻';
    return;
  }

  const payload = collectPayload();
  const message = validatePayload(payload);
  formError.value = '';
  if (message) {
    formError.value = message;
    return;
  }

  const id = editId.value;
  submitting.value = true;
  try {
    const data = id
      ? await apiPut(`/recipes/${encodeURIComponent(id)}`, payload)
      : await apiPost('/recipes', payload);
    successRecipe.value = data.recipe;
    successIsEdit.value = Boolean(id);
  } catch (error) {
    formError.value = error.message;
    if (Array.isArray(error.details) && error.details.length > 1) {
      toast.error(error.details[1]);
    }
  } finally {
    submitting.value = false;
  }
}

watch(() => route.query.id, load, { immediate: true });
</script>

<template>
  <PageLoader v-if="loading" />
  <ErrorState v-else-if="errorStatus" :status="errorStatus" @retry="load" />
  <AuthGate
    v-else-if="!auth.isLoggedIn"
    eyebrow="SHARE YOUR TABLE"
    title="先把你的厨房打开吧"
    message="登录之后，就可以写下菜谱、上传步骤图，把自己的拿手味道分享给更多人。"
  />
  <div v-else class="publish-page">
    <section class="publish-masthead">
      <div class="container publish-masthead__inner">
        <div>
          <p class="eyebrow">{{ recipe ? 'EDIT YOUR RECIPE' : 'SHARE YOUR TABLE' }}</p>
          <h1>
            <template v-if="recipe">把这道菜，<em>再写好一点。</em></template>
            <template v-else>写下一道，<em>属于你的味道。</em></template>
          </h1>
          <p>
            {{
              recipe
                ? '修改后会重新进入审核，审核通过后会替换原来的公开版本。'
                : '不用是专业厨师。把你觉得好吃的做法认真写下来，就足够动人。'
            }}
          </p>
        </div>
        <span class="publish-masthead__seal">
          <template v-if="recipe">再<br />写</template>
          <template v-else>写<br />下</template>
        </span>
      </div>
    </section>

    <div class="container publish-layout">
      <form class="publish-form" novalidate @submit.prevent="submit">
        <div v-if="recipe?.status === 'rejected'" class="edit-notice edit-notice--danger">
          <span><AppIcon name="alert" /></span>
          <div>
            <strong>上次审核未通过</strong>
            <p>{{ recipe.rejectReason || '请检查内容和配图后重新提交。' }}</p>
          </div>
        </div>
        <div v-if="recipe?.status === 'pending'" class="edit-notice">
          <span><AppIcon name="clock" /></span>
          <div>
            <strong>当前正在审核中</strong>
            <p>你仍然可以继续修改，提交后会以最新版本重新进入审核。</p>
          </div>
        </div>

        <section class="form-card">
          <div class="form-card__head">
            <span class="form-section-number">01</span>
            <div><h2>先给这道菜一个名字</h2><p>标题和简介，是别人认识它的第一眼。</p></div>
          </div>
          <div class="field">
            <label class="field-label" for="recipe-title">菜谱标题 <span class="required">*</span></label>
            <input
              id="recipe-title"
              v-model="form.title"
              class="input input--large"
              name="title"
              maxlength="40"
              placeholder="例如：番茄罗勒蝴蝶面"
              required
            />
          </div>
          <div class="field">
            <label class="field-label" for="recipe-summary">一句话简介 <span class="required">*</span></label>
            <input
              id="recipe-summary"
              v-model="form.summary"
              class="input"
              name="summary"
              maxlength="200"
              placeholder="它为什么值得被做一次？"
              required
            />
          </div>

          <div class="field">
            <span class="field-label">封面图 <span class="required">*</span></span>
            <label
              class="cover-upload"
              :class="{ 'has-image': form.cover, 'is-uploading': uploadingCover }"
            >
              <input
                class="visually-hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                @change="onCoverUpload"
              />
              <img class="cover-preview" :src="form.cover || undefined" alt="菜谱封面预览" />
              <span class="cover-upload__empty">
                <AppIcon name="camera" /><strong>上传一张让人想吃的封面</strong>
                <small>建议横图 · JPG / PNG / WebP · 最大 8MB</small>
              </span>
              <span class="cover-upload__change"><AppIcon name="image" /> 点击更换封面</span>
              <span class="cover-upload__loading"><span class="mini-spinner"></span>正在上传封面…</span>
            </label>
            <span class="field-help">一张自然光下、能看清食物的照片，通常最打动人。</span>
          </div>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <span class="form-section-number">02</span>
            <div><h2>介绍一下这道菜</h2><p>这些信息会帮助厨友更快判断它是否适合今天。</p></div>
          </div>
          <div class="form-grid form-grid--three">
            <div class="field">
              <label class="field-label" for="recipe-category">菜谱分类 <span class="required">*</span></label>
              <div class="select-wrap">
                <select id="recipe-category" v-model="form.category" class="select" name="category" required>
                  <option value="">选择分类</option>
                  <option v-for="category in metaStore.categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
                <AppIcon name="chevronDown" />
              </div>
            </div>
            <div class="field">
              <label class="field-label" for="recipe-time">烹饪时间（分钟）</label>
              <input
                id="recipe-time"
                v-model.number="form.time"
                class="input"
                name="time"
                type="number"
                min="5"
                max="600"
                required
              />
            </div>
            <div class="field">
              <label class="field-label" for="recipe-servings">份量（人）</label>
              <input
                id="recipe-servings"
                v-model.number="form.servings"
                class="input"
                name="servings"
                type="number"
                min="1"
                max="20"
                required
              />
            </div>
          </div>
          <div class="field">
            <span class="field-label">难度</span>
            <div class="segmented">
              <label v-for="difficulty in metaStore.difficulties" :key="difficulty" class="segmented__item">
                <input
                  v-model="form.difficulty"
                  type="radio"
                  name="difficulty"
                  :value="difficulty"
                />
                <span>{{ difficulty }}</span>
              </label>
            </div>
          </div>
          <div class="field">
            <div class="field-label-row">
              <span class="field-label">食材与风味标签 <span class="required">*</span></span>
              <span class="field-counter">{{ selectedTags.length }} / 6</span>
            </div>
            <div class="tag-picker">
              <div
                v-for="group in metaStore.tagGroups"
                :key="group.name"
                class="tag-picker__group"
                :data-tag-group="group.name"
              >
                <span class="tag-picker__label">{{ group.name }}</span>
                <div class="tag-picker__choices">
                  <label v-for="tag in group.tags" :key="tag" class="tag-choice">
                    <input
                      type="checkbox"
                      name="tags"
                      :value="tag"
                      :checked="selectedTags.includes(tag)"
                      :disabled="isTagDisabled(tag)"
                      @change="toggleTag(tag)"
                    />
                    <span><i v-if="TAG_EMOJI[tag]" aria-hidden="true">{{ TAG_EMOJI[tag] }}</i>{{ tag }}</span>
                  </label>
                  <template v-if="group.name === '食材'">
                    <label
                      v-for="tag in customTags"
                      :key="`custom-${tag}`"
                      class="tag-choice tag-choice--custom"
                    >
                      <input
                        type="checkbox"
                        name="tags"
                        :value="tag"
                        :checked="selectedTags.includes(tag)"
                        :disabled="isTagDisabled(tag)"
                        @change="toggleTag(tag)"
                      />
                      <span>{{ tag }}</span>
                    </label>
                  </template>
                </div>
              </div>
              <div class="tag-picker__custom">
                <span class="tag-picker__label">自定义</span>
                <div class="tag-picker__custom-row">
                  <input
                    id="custom-tag-input"
                    v-model="customTagInput"
                    class="input"
                    type="text"
                    maxlength="12"
                    placeholder="没找到？输入食材名，如 空心菜"
                    aria-label="自定义食材标签"
                    @keydown.enter.prevent="addCustomTag"
                  />
                  <button class="btn btn--soft btn--small" type="button" @click="addCustomTag">添加</button>
                </div>
              </div>
            </div>
            <span class="field-help">选择能帮助别人找到这道菜的标签，最多 6 个。</span>
          </div>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <span class="form-section-number">03</span>
            <div><h2>列好食材清单</h2><p>按需准备，用量可以留空，不多买也不漏掉。</p></div>
          </div>
          <div ref="ingredientEditor" class="ingredient-editor">
            <div v-for="(item, index) in ingredients" :key="index" class="ingredient-row">
              <input
                v-model="item.name"
                class="input ingredient-name"
                placeholder="食材名称，如 番茄"
                aria-label="食材名称"
              />
              <input
                v-model="item.amount"
                class="input ingredient-amount"
                placeholder="用量（选填），如 2 个"
                aria-label="食材用量（选填）"
              />
              <button
                class="icon-button icon-button--subtle"
                type="button"
                aria-label="移除这项食材"
                :disabled="ingredients.length <= 1"
                @click="removeIngredient(index)"
              >
                <AppIcon name="minus" />
              </button>
            </div>
          </div>
          <button class="add-row-button" type="button" @click="addIngredient">
            <AppIcon name="plus" /> 再加一项食材
          </button>
          <span class="field-help">用量可以不填，只写食材名称也可以，页面只显示名称。</span>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <span class="form-section-number">04</span>
            <div><h2>一步一步写下来</h2><p>每个步骤的配图都是选填的，整份菜谱有一张关键图就够。</p></div>
          </div>
          <div ref="stepEditorList" class="step-editor-list">
            <div v-for="(step, index) in steps" :key="index" class="step-editor">
              <div class="step-editor__head">
                <span class="step-editor__number">{{ String(index + 1).padStart(2, '0') }}</span>
                <div class="step-editor__label">
                  <strong>一个步骤</strong><small>写清火候、时间和小细节</small>
                </div>
                <button
                  class="icon-button icon-button--subtle"
                  type="button"
                  aria-label="移除这个步骤"
                  :disabled="steps.length <= 1"
                  @click="removeStep(index)"
                >
                  <AppIcon name="minus" />
                </button>
              </div>
              <div class="step-editor__grid">
                <textarea
                  v-model="step.text"
                  class="textarea step-text"
                  rows="4"
                  maxlength="500"
                  placeholder="例如：番茄切块，中火炒至软烂出沙…"
                ></textarea>
                <label
                  class="step-upload"
                  :class="{ 'has-image': step.image, 'is-uploading': step.uploading }"
                >
                  <input
                    class="visually-hidden"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    @change="onStepUpload(step, $event)"
                  />
                  <img class="step-preview" :src="step.image || undefined" alt="步骤配图预览" />
                  <span class="step-upload__empty">
                    <AppIcon name="camera" /><strong>添加步骤图（选填）</strong>
                    <small>整份菜谱至少一张 · 最大 8MB</small>
                  </span>
                  <span class="step-upload__change"><AppIcon name="image" /> 更换配图</span>
                  <span class="step-upload__loading"><span class="mini-spinner"></span>上传中…</span>
                </label>
              </div>
            </div>
          </div>
          <button class="add-row-button" type="button" @click="addStep">
            <AppIcon name="plus" /> 再加一个步骤
          </button>
          <span class="field-help">每个步骤不必都配图，整份菜谱有一张关键步骤图即可。</span>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <span class="form-section-number">05</span>
            <div><h2>最后，说一点小技巧</h2><p>那些“更容易成功”的秘密，值得分享。</p></div>
          </div>
          <div class="field">
            <label class="field-label" for="recipe-tips">作者小贴士</label>
            <textarea
              id="recipe-tips"
              v-model="form.tips"
              class="textarea"
              name="tips"
              rows="4"
              maxlength="300"
              placeholder="例如：番茄一定要选熟透的，炒到软烂出沙，酱汁才会自然清甜。"
            ></textarea>
            <span class="field-help">可以写下替代食材、保存方式或者容易失败的地方。</span>
          </div>
        </section>

        <div class="publish-submit-bar">
          <p v-show="formError" class="form-error">{{ formError }}</p>
          <div class="publish-submit-bar__row">
            <RouterLink
              class="btn btn--soft"
              :to="recipe ? `/recipe/${encodeURIComponent(recipe.id)}` : '/'"
            >
              取消
            </RouterLink>
            <button
              class="btn btn--primary publish-submit"
              :class="{ 'is-busy': submitting }"
              type="submit"
              :disabled="submitting"
              :aria-busy="submitting ? 'true' : undefined"
            >
              {{ submitLabel }} <AppIcon name="arrowRight" />
            </button>
          </div>
          <p class="publish-submit-bar__note">
            <AppIcon name="shield" /> 提交后由管理员审核，通常在 24 小时内完成。
          </p>
        </div>
      </form>

      <aside class="publish-aside">
        <div class="aside-card checklist-card">
          <div class="aside-card__head">
            <p class="eyebrow">BEFORE YOU SEND</p>
            <h3>发布检查</h3>
            <span>{{ checklist.percent }}%</span>
          </div>
          <div class="checklist-meter" :style="{ '--progress': `${checklist.percent}%` }"><span></span></div>
          <ul class="checklist">
            <li
              v-for="item in checklist.items"
              :key="item.key"
              :class="{ 'is-done': item.done }"
            >
              <AppIcon name="check" />
              <template v-if="item.key === 'basics'">标题与简介已写好</template>
              <template v-else-if="item.key === 'cover'">有一张好看的封面</template>
              <template v-else-if="item.key === 'ingredients'">至少 3 种食材</template>
              <template v-else-if="item.key === 'steps'">至少 2 步，配图至少 1 张</template>
              <template v-else>已选择分类标签</template>
            </li>
          </ul>
        </div>
        <div class="aside-card flow-card">
          <p class="eyebrow">HOW IT WORKS</p>
          <h3>发布之后会发生什么？</h3>
          <ol>
            <li><span>01</span><div><strong>提交菜谱</strong><p>保存你的文字与配图</p></div></li>
            <li><span>02</span><div><strong>管理员审核</strong><p>检查内容是否完整友好</p></div></li>
            <li><span>03</span><div><strong>端上桌</strong><p>通过后对所有人可见</p></div></li>
          </ol>
        </div>
        <div class="aside-card aside-card--note">
          <span><AppIcon name="leaf" /></span>
          <h3>一点点小建议</h3>
          <p>步骤不必写得像说明书。把你真正做过、觉得有用的细节写下来，就是一份好菜谱。</p>
        </div>
      </aside>
    </div>

    <BaseModal
      v-if="successRecipe"
      modal-class="modal--success"
      label="发布结果"
      @close="successRecipe = null"
    >
      <div class="success-dialog">
        <div class="success-dialog__mark">
          <AppIcon :name="isApprovedSuccess ? 'check' : 'clock'" />
        </div>
        <p class="eyebrow">{{ isApprovedSuccess ? 'PUBLISHED' : 'IN REVIEW' }}</p>
        <h2>
          {{
            isApprovedSuccess
              ? successIsEdit
                ? '菜谱已更新'
                : '菜谱已发布'
              : successIsEdit
                ? '修改已提交'
                : '菜谱已送达审核'
          }}
        </h2>
        <p>
          {{
            isApprovedSuccess
              ? '这份认真已经被端上桌了，去看看吧。'
              : '管理员会尽快看看你的菜谱。审核通过后，它就会出现在社区里。'
          }}
        </p>
        <div class="success-dialog__recipe">
          <img :src="successRecipe.cover" alt="" />
          <div>
            <strong>{{ successRecipe.title }}</strong>
            <span>{{ isApprovedSuccess ? '已公开' : '审核中' }}</span>
          </div>
        </div>
        <div class="success-dialog__actions">
          <RouterLink
            v-if="isApprovedSuccess"
            class="btn btn--primary"
            :to="`/recipe/${encodeURIComponent(successRecipe.id)}`"
          >
            看看我的菜谱
          </RouterLink>
          <RouterLink v-else class="btn btn--primary" :to="{ path: '/me', query: { tab: 'works' } }">
            去个人中心
          </RouterLink>
          <RouterLink class="btn btn--soft" to="/recipes">继续逛逛</RouterLink>
        </div>
      </div>
    </BaseModal>
  </div>
</template>
