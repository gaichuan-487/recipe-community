<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const props = defineProps({
  modalClass: { type: String, default: '' },
  label: { type: String, default: '' },
  dismissible: { type: Boolean, default: true }
});

const emit = defineEmits(['close']);
const dialog = ref(null);

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

let lastFocus = null;

// 多个弹层可能叠在一起（例如审核弹窗里查看大图）：
// 只有最上层的弹窗响应键盘，滚动锁也按打开数量维护。
const modalStack = [];
let openCount = 0;

function requestClose() {
  if (props.dismissible) emit('close');
}

function onBackdrop(event) {
  if (event.target === event.currentTarget) requestClose();
}

function focusableItems() {
  if (!dialog.value) return [];
  return [...dialog.value.querySelectorAll(FOCUSABLE)].filter(
    (element) => element.offsetParent !== null
  );
}

function onKeydown(event) {
  if (modalStack[modalStack.length - 1] !== dialog.value) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    requestClose();
    return;
  }
  if (event.key !== 'Tab' || !dialog.value) return;

  const items = focusableItems();
  if (!items.length) {
    event.preventDefault();
    dialog.value.focus();
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || active === dialog.value)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

onMounted(() => {
  lastFocus = document.activeElement;
  modalStack.push(dialog.value);
  openCount += 1;
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onKeydown);

  window.setTimeout(() => {
    const target = dialog.value?.querySelector('[data-autofocus]') || dialog.value;
    target?.focus({ preventScroll: true });
  }, 30);
});

onBeforeUnmount(() => {
  const index = modalStack.indexOf(dialog.value);
  if (index !== -1) modalStack.splice(index, 1);
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
    document.body.classList.remove('modal-open');
  }
  document.removeEventListener('keydown', onKeydown);
  if (lastFocus && typeof lastFocus.focus === 'function') {
    lastFocus.focus({ preventScroll: true });
  }
  lastFocus = null;
});
</script>

<template>
  <Teleport to="body">
    <div class="modal-backdrop" @mousedown="onBackdrop">
      <div
        ref="dialog"
        class="modal"
        :class="modalClass"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-label="label || undefined"
      >
        <button class="modal-close" type="button" aria-label="关闭" @click="requestClose">
          <AppIcon name="close" />
        </button>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
