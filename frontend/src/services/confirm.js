import { reactive } from 'vue';

export const confirmState = reactive({
  open: false,
  title: '',
  message: '',
  confirmLabel: '确定',
  danger: false
});

let resolver = null;

export function confirmDialog(options = {}) {
  // 如果已有确认框，先把它按“取消”处理，避免 Promise 永远悬空。
  if (resolver) {
    const previous = resolver;
    resolver = null;
    previous(false);
  }

  Object.assign(confirmState, {
    open: true,
    title: '请确认',
    message: '',
    confirmLabel: '确定',
    danger: false,
    ...options
  });

  return new Promise((resolve) => {
    resolver = resolve;
  });
}

export function resolveConfirm(value) {
  const finish = resolver;
  resolver = null;
  confirmState.open = false;
  if (finish) finish(Boolean(value));
}
