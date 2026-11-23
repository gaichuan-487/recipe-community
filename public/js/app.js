'use strict';

/* ------------------------------------------------------------------ */
/* Constants & tiny helpers                                           */
/* ------------------------------------------------------------------ */

const TOKEN_KEY = 'shiguang_token';
const APP_TITLE = '食光记 · 美食菜谱分享社区';
const app = document.getElementById('app');
const headerEl = document.getElementById('site-header');
const modalRoot = document.getElementById('modal-root');
const toastRegion = document.getElementById('toast-region');

const state = {
  token: localStorage.getItem(TOKEN_KEY) || '',
  user: null,
  meta: null,
  route: null,
  renderSeq: 0,
  menuOpen: false,
  lastFocus: null,
  confirmResolver: null
};

const TAG_EMOJI = {
  番茄: '🍅',
  鸡蛋: '🥚',
  鸡胸肉: '🍗',
  猪肉: '🐷',
  牛肉: '🥩',
  排骨: '🍖',
  虾: '🦐',
  三文鱼: '🐟',
  豆腐: '🍥',
  土豆: '🥔',
  茄子: '🍆',
  菌菇: '🍄',
  白菜: '🥬',
  菠菜: '🌿',
  胡萝卜: '🥕',
  玉米: '🌽',
  面条: '🍜',
  南瓜: '🎃',
  甜椒: '🫑',
  牛油果: '🥑',
  橙子: '🍊'
};

const ICONS = {
  search:
    '<circle cx="11" cy="11" r="7.5"></circle><path d="m21 21-4.3-4.3"></path>',
  heart:
    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
  bookmark:
    '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"></path>',
  message:
    '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>',
  clock:
    '<circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15.5 14"></polyline>',
  flame:
    '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>',
  arrowRight:
    '<line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>',
  arrowUpRight:
    '<line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline>',
  chevronRight: '<polyline points="9 18 15 12 9 6"></polyline>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"></polyline>',
  chevronDown: '<polyline points="6 9 12 15 18 9"></polyline>',
  plus:
    '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"></line>',
  user:
    '<circle cx="12" cy="8" r="4"></circle><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"></path>',
  edit:
    '<path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>',
  trash:
    '<polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
  menu:
    '<line x1="4" y1="7" x2="20" y2="7"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="17" x2="20" y2="17"></line>',
  close:
    '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>',
  check: '<polyline points="20 6 9 17 4 12"></polyline>',
  upload:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="3"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>',
  sparkles:
    '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path><path d="M19 16v4"></path><path d="M17 18h4"></path><path d="M5 3v3"></path><path d="M3.5 4.5h3"></path>',
  eye:
    '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle>',
  shield:
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline>',
  chart:
    '<line x1="4" y1="20" x2="20" y2="20"></line><rect x="5" y="11" width="3" height="6" rx="1"></rect><rect x="10.5" y="7" width="3" height="10" rx="1"></rect><rect x="16" y="3" width="3" height="14" rx="1"></rect>',
  list:
    '<line x1="9" y1="6" x2="21" y2="6"></line><line x1="9" y1="12" x2="21" y2="12"></line><line x1="9" y1="18" x2="21" y2="18"></line><circle cx="4" cy="6" r="1"></circle><circle cx="4" cy="12" r="1"></circle><circle cx="4" cy="18" r="1"></circle>',
  grid:
    '<rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect>',
  home:
    '<path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9v11h14V9"></path><path d="M9 20v-6h6v6"></path>',
  send:
    '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
  camera:
    '<path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"></path><circle cx="12" cy="13" r="4"></circle>',
  share:
    '<circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.6" y1="10.5" x2="15.4" y2="6.5"></line><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"></line>',
  leaf:
    '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>',
  alert:
    '<circle cx="12" cy="12" r="9"></circle><line x1="12" y1="8" x2="12" y2="12.5"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
  info:
    '<circle cx="12" cy="12" r="9"></circle><line x1="12" y1="11" x2="12" y2="16"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>',
  star:
    '<polygon points="12 2.8 14.8 8.5 21.1 9.4 16.6 13.9 17.7 20.2 12 17.2 6.3 20.2 7.4 13.9 2.9 9.4 9.2 8.5 12 2.8"></polygon>',
  filter:
    '<path d="M4 5h16l-6.4 7.3V19l-3.2 1.5v-8.2L4 5Z"></path>',
  book:
    '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>',
  chefHat:
    '<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"></path><line x1="6" y1="17" x2="18" y2="17"></line>',
  bolt: '<polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2"></polygon>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>',
  copy:
    '<rect x="9" y="9" width="12" height="12" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>'
};

function icon(name, className = '') {
  return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.sparkles}</svg>`;
}

function escapeHtml(value) {
  const chars = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => chars[char]);
}

function formatNumber(value) {
  return new Intl.NumberFormat('zh-CN').format(Number(value) || 0);
}

function compactNumber(value) {
  const number = Number(value) || 0;
  if (number >= 100000) return `${(number / 10000).toFixed(0)}万`;
  if (number >= 10000) return `${(number / 10000).toFixed(1).replace('.0', '')}万`;
  if (number >= 1000) return `${(number / 1000).toFixed(1).replace('.0', '')}k`;
  return String(number);
}

function formatRelative(value) {
  if (!value) return '';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (Number.isNaN(diff)) return '';
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
  return formatDate(value);
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(
    date.getHours()
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function firstCharacter(value) {
  return Array.from(String(value || '?'))[0] || '?';
}

function avatarMarkup(user, size = 'md') {
  if (!user) return '';
  return `<span class="avatar avatar--${size}" style="--avatar-color:${escapeHtml(
    user.avatarColor || '#c95a3d'
  )}" aria-hidden="true"><span>${escapeHtml(firstCharacter(user.nickname))}</span></span>`;
}

function parseRoute() {
  const raw = (window.location.hash || '#/').replace(/^#/, '');
  const [pathPart, queryPart = ''] = raw.split('?');
  let path = pathPart || '/';
  if (!path.startsWith('/')) path = `/${path}`;
  return { path, params: new URLSearchParams(queryPart) };
}

function navigate(path) {
  const target = `#${path}`;
  if (window.location.hash === target) {
    renderRoute();
  } else {
    window.location.hash = target;
  }
}

function pageLoader(label = '正在打开厨房的小窗…') {
  return `<div class="page-loader" role="status" aria-live="polite">
    <span class="loader-mark">食</span>
    <p>${escapeHtml(label)}</p>
    <div class="loader-line"><span></span></div>
  </div>`;
}

function emptyState({ iconName = 'leaf', title, message, action = '' }) {
  return `<div class="empty-state">
    <span class="empty-state__icon">${icon(iconName)}</span>
    <h3>${escapeHtml(title)}</h3>
    <p>${escapeHtml(message)}</p>
    ${action}
  </div>`;
}

function statusPill(status) {
  const map = {
    approved: { label: '已发布', className: 'status--approved' },
    pending: { label: '审核中', className: 'status--pending' },
    rejected: { label: '未通过', className: 'status--rejected' }
  };
  const item = map[status] || map.pending;
  return `<span class="status-pill ${item.className}">${item.label}</span>`;
}

function toast(message, type = 'success') {
  const iconName = type === 'error' ? 'alert' : type === 'info' ? 'info' : 'check';
  const element = document.createElement('div');
  element.className = `toast toast--${type}`;
  element.innerHTML = `<span class="toast__icon">${icon(iconName)}</span><span>${escapeHtml(
    message
  )}</span>`;
  toastRegion.appendChild(element);
  window.requestAnimationFrame(() => element.classList.add('is-visible'));
  window.setTimeout(() => {
    element.classList.remove('is-visible');
    window.setTimeout(() => element.remove(), 260);
  }, 3400);
}

function setFormError(form, message) {
  const element = form.querySelector('[data-form-error]');
  if (!element) {
    if (message) toast(message, 'error');
    return;
  }
  element.textContent = message || '';
  element.hidden = !message;
}

function setButtonBusy(button, busy) {
  if (!button) return;
  button.disabled = busy;
  button.classList.toggle('is-busy', busy);
  if (busy) button.setAttribute('aria-busy', 'true');
  else button.removeAttribute('aria-busy');
}

function toastError(error) {
  toast(error?.message || '操作没有完成，请稍后再试', 'error');
}

/* ------------------------------------------------------------------ */
/* API & session                                                      */
/* ------------------------------------------------------------------ */

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.token) headers.set('Authorization', `Bearer ${state.token}`);
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(body);
  }
  const response = await fetch(`/api${path}`, { ...options, headers, body });
  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }
  if (!response.ok) {
    if (response.status === 401 && state.token && !path.startsWith('/auth/')) {
      clearSession(false);
    }
    const error = new Error(data.error || '请求失败，请稍后重试');
    error.status = response.status;
    error.details = data.details || [];
    throw error;
  }
  return data;
}

function setSession(token, user) {
  state.token = token;
  state.user = user;
  localStorage.setItem(TOKEN_KEY, token);
}

function clearSession(showMessage = true) {
  state.token = '';
  state.user = null;
  localStorage.removeItem(TOKEN_KEY);
  if (showMessage) toast('你已退出登录', 'info');
}

function requireLogin(message = '登录后就可以和厨友们互动啦') {
  if (state.user) return true;
  openAuth('login');
  toast(message, 'info');
  return false;
}

/* ------------------------------------------------------------------ */
/* Header                                                             */
/* ------------------------------------------------------------------ */

function renderHeader() {
  const route = state.route || parseRoute();
  const path = route.path;
  const user = state.user;
  const isAdmin = user?.role === 'admin';
  const navItems = [
    { label: '首页', href: '#/', active: path === '/' },
    { label: '发现菜谱', href: '#/recipes', active: path === '/recipes' },
    { label: '热门排行', href: '#/hot', active: path === '/hot' }
  ];
  if (isAdmin) {
    navItems.push({
      label: '后台管理',
      href: '#/admin',
      active: path.startsWith('/admin')
    });
  }

  const searchValue = path === '/recipes' ? route.params.get('q') || '' : '';
  const accountArea = user
    ? `<a class="user-pill" href="#/me" aria-label="进入个人中心">
        ${avatarMarkup(user, 'sm')}
        <span class="user-pill__name">${escapeHtml(user.nickname)}</span>
      </a>`
    : `<button class="btn btn--ghost btn--small header-login" type="button" data-action="open-auth">登录</button>`;

  const mobileLinks = navItems
    .map(
      (item) =>
        `<a class="drawer-link ${item.active ? 'is-active' : ''}" href="${item.href}">${item.label}${icon(
          'chevronRight'
        )}</a>`
    )
    .join('');

  headerEl.innerHTML = `<header class="site-header">
    <div class="header-inner container">
      <a class="brand" href="#/" aria-label="食光记首页">
        <span class="brand-mark"><span>食</span></span>
        <span class="brand-word">食光记<small>SHIGUANG KITCHEN</small></span>
      </a>
      <nav class="main-nav" aria-label="主导航">
        ${navItems
          .map(
            (item) =>
              `<a class="nav-link ${item.active ? 'is-active' : ''}" href="${item.href}">${
                item.label
              }</a>`
          )
          .join('')}
      </nav>
      <div class="header-actions">
        <form class="header-search js-search-form" role="search">
          <label class="visually-hidden" for="header-search-input">搜索菜谱</label>
          <span class="header-search__icon">${icon('search')}</span>
          <input id="header-search-input" type="search" name="q" placeholder="搜菜谱 / 食材" autocomplete="off" value="${escapeHtml(
            searchValue
          )}" />
        </form>
        ${accountArea}
        <a class="btn btn--primary btn--small header-publish" href="#/publish">${icon(
          'plus'
        )}<span>发布菜谱</span></a>
        <button class="menu-toggle" type="button" data-action="toggle-menu" aria-label="${
          state.menuOpen ? '关闭菜单' : '打开菜单'
        }" aria-expanded="${state.menuOpen}">${icon(state.menuOpen ? 'close' : 'menu')}</button>
      </div>
    </div>
    <div class="mobile-drawer ${state.menuOpen ? 'is-open' : ''}" aria-hidden="${
    state.menuOpen ? 'false' : 'true'
  }">
      <form class="drawer-search js-search-form" role="search">
        ${icon('search')}
        <input type="search" name="q" placeholder="今天想吃什么？" value="${escapeHtml(searchValue)}" />
      </form>
      <nav class="drawer-nav" aria-label="移动端导航">
        ${mobileLinks}
      </nav>
      <div class="drawer-actions">
        <a class="btn btn--primary btn--block" href="#/publish">${icon('plus')} 发布我的菜谱</a>
        ${
          user
            ? `<a class="btn btn--soft btn--block" href="#/me">${icon('user')} 个人中心</a>`
            : `<button class="btn btn--soft btn--block" type="button" data-action="open-auth">${icon(
                'user'
              )} 登录 / 注册</button>`
        }
      </div>
    </div>
    <button class="drawer-backdrop ${
      state.menuOpen ? 'is-open' : ''
    }" type="button" data-action="close-menu" aria-label="关闭菜单" tabindex="-1"></button>
  </header>`;

  if (state.menuOpen) document.body.classList.add('menu-open');
  else document.body.classList.remove('menu-open');
}

/* ------------------------------------------------------------------ */
/* Modal & auth                                                       */
/* ------------------------------------------------------------------ */

function closeModal() {
  if (!modalRoot.firstElementChild) return;
  modalRoot.innerHTML = '';
  document.body.classList.remove('modal-open');
  if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
    state.lastFocus.focus({ preventScroll: true });
  }
  state.lastFocus = null;
  state.confirmResolver = null;
}

function openModal(innerHtml, options = {}) {
  state.lastFocus = document.activeElement;
  const label = options.label ? `aria-label="${escapeHtml(options.label)}"` : '';
  modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-backdrop>
    <div class="modal ${options.className || ''}" role="dialog" aria-modal="true" tabindex="-1" ${label}>
      <button class="modal-close" type="button" data-action="close-modal" aria-label="关闭">${icon(
        'close'
      )}</button>
      ${innerHtml}
    </div>
  </div>`;
  document.body.classList.add('modal-open');
  const backdrop = modalRoot.querySelector('[data-modal-backdrop]');
  backdrop?.addEventListener('mousedown', (event) => {
    if (event.target === backdrop) closeModal();
  });
  const focusTarget =
    modalRoot.querySelector('[data-autofocus]') || modalRoot.querySelector('.modal');
  window.setTimeout(() => focusTarget?.focus({ preventScroll: true }), 30);
}

function confirmDialog({ title, message, confirmText = '确认', danger = false }) {
  return new Promise((resolve) => {
    state.confirmResolver = resolve;
    openModal(
      `<div class="confirm-dialog">
        <span class="confirm-dialog__icon ${danger ? 'is-danger' : ''}">${icon(
          danger ? 'alert' : 'info'
        )}</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
        <div class="confirm-dialog__actions">
          <button class="btn btn--soft" type="button" data-action="confirm-no">再想想</button>
          <button class="btn ${danger ? 'btn--danger' : 'btn--primary'}" type="button" data-action="confirm-yes">${escapeHtml(
            confirmText
          )}</button>
        </div>
      </div>`,
      { className: 'modal--confirm', label: title }
    );
  });
}

function resolveConfirm(value) {
  if (state.confirmResolver) {
    state.confirmResolver(value);
    state.confirmResolver = null;
  }
  closeModal();
}

function authFormMarkup(mode) {
  if (mode === 'register') {
    return `<form id="register-form" class="auth-form" novalidate>
      <div class="field">
        <label class="field-label" for="register-nickname">怎么称呼你</label>
        <input class="input" id="register-nickname" name="nickname" maxlength="20" placeholder="例如：林小厨" autocomplete="nickname" data-autofocus required />
      </div>
      <div class="field">
        <label class="field-label" for="register-username">用户名</label>
        <input class="input" id="register-username" name="username" maxlength="20" placeholder="2–20 位字母、数字或中文" autocomplete="username" required />
      </div>
      <div class="field">
        <label class="field-label" for="register-password">密码</label>
        <input class="input" id="register-password" name="password" type="password" placeholder="至少 6 位" autocomplete="new-password" required />
      </div>
      <div class="field">
        <label class="field-label" for="register-confirm">确认密码</label>
        <input class="input" id="register-confirm" name="confirm" type="password" placeholder="再输入一次密码" autocomplete="new-password" required />
      </div>
      <p class="form-error" data-form-error hidden></p>
      <button class="btn btn--primary btn--block auth-submit" type="submit">创建我的账号</button>
      <p class="auth-switch">已经有账号？<button type="button" data-action="auth-tab" data-mode="login">直接登录</button></p>
    </form>`;
  }
  return `<form id="login-form" class="auth-form" novalidate>
    <div class="field">
      <label class="field-label" for="login-username">用户名</label>
      <input class="input" id="login-username" name="username" placeholder="输入你的用户名" autocomplete="username" data-autofocus required />
    </div>
    <div class="field">
      <label class="field-label" for="login-password">密码</label>
      <input class="input" id="login-password" name="password" type="password" placeholder="输入密码" autocomplete="current-password" required />
    </div>
    <p class="form-error" data-form-error hidden></p>
    <button class="btn btn--primary btn--block auth-submit" type="submit">进入我的厨房</button>
    <p class="auth-switch">还没有账号？<button type="button" data-action="auth-tab" data-mode="register">注册一个</button></p>
  </form>`;
}

function openAuth(mode = 'login') {
  state.lastFocus = document.activeElement;
  openModal(
    `<div class="auth-layout">
      <div class="auth-art" style="background-image:url('/images/ingredients.jpg')">
        <div class="auth-art__wash"></div>
        <div class="auth-art__content">
          <span class="brand-mark brand-mark--light"><span>食</span></span>
          <p class="eyebrow">WELCOME TO THE TABLE</p>
          <h2>每一次下厨，<br />都值得被记住。</h2>
          <p>收藏灵感，分享步骤，和认真吃饭的人交换厨房日常。</p>
          <span class="auth-art__seal">烟火<br />可亲</span>
        </div>
      </div>
      <div class="auth-panel">
        <div class="auth-tabs" role="tablist" aria-label="登录或注册">
          <button class="auth-tab ${
            mode === 'login' ? 'is-active' : ''
          }" type="button" data-action="auth-tab" data-mode="login" role="tab" aria-selected="${
      mode === 'login'
    }">登录</button>
          <button class="auth-tab ${
            mode === 'register' ? 'is-active' : ''
          }" type="button" data-action="auth-tab" data-mode="register" role="tab" aria-selected="${
      mode === 'register'
    }">注册</button>
        </div>
        <div id="auth-form-area">${authFormMarkup(mode)}</div>
        <div class="demo-box">
          <div class="demo-box__head"><span>没有账号？直接体验</span><span class="demo-box__line"></span></div>
          <div class="demo-buttons">
            <button class="demo-button" type="button" data-action="quick-login" data-username="xiaoyu">
              <span class="demo-button__icon">${icon('chefHat')}</span>
              <span><strong>普通用户</strong><small>xiaoyu / 123456</small></span>
            </button>
            <button class="demo-button" type="button" data-action="quick-login" data-username="admin">
              <span class="demo-button__icon">${icon('shield')}</span>
              <span><strong>管理员</strong><small>admin / admin123</small></span>
            </button>
          </div>
        </div>
      </div>
    </div>`,
    { className: 'modal--auth', label: mode === 'login' ? '登录' : '注册' }
  );
}

function switchAuthTab(mode) {
  const area = modalRoot.querySelector('#auth-form-area');
  if (!area) return;
  area.innerHTML = authFormMarkup(mode);
  modalRoot.querySelectorAll('.auth-tab').forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  const input = area.querySelector('input');
  window.setTimeout(() => input?.focus(), 20);
}

function finishLogin(data, welcomeMessage) {
  setSession(data.token, data.user);
  closeModal();
  renderHeader();
  toast(welcomeMessage || `欢迎回来，${data.user.nickname}`, 'success');
  renderRoute();
}

async function submitLogin(form) {
  const button = form.querySelector('[type="submit"]');
  const username = form.elements.username?.value.trim() || '';
  const password = form.elements.password?.value || '';
  setFormError(form, '');
  if (!username || !password) {
    setFormError(form, '请把用户名和密码都填好');
    return;
  }
  setButtonBusy(button, true);
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { username, password }
    });
    finishLogin(data);
  } catch (error) {
    setFormError(form, error.message);
  } finally {
    setButtonBusy(button, false);
  }
}

async function submitRegister(form) {
  const button = form.querySelector('[type="submit"]');
  const nickname = form.elements.nickname?.value.trim() || '';
  const username = form.elements.username?.value.trim() || '';
  const password = form.elements.password?.value || '';
  const confirm = form.elements.confirm?.value || '';
  setFormError(form, '');
  if (!nickname || !username || !password) {
    setFormError(form, '请完整填写昵称、用户名和密码');
    return;
  }
  if (password.length < 6) {
    setFormError(form, '密码至少需要 6 位');
    return;
  }
  if (password !== confirm) {
    setFormError(form, '两次输入的密码不一致');
    return;
  }
  setButtonBusy(button, true);
  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: { nickname, username, password }
    });
    finishLogin(data, `账号创建成功，欢迎你，${data.user.nickname}`);
  } catch (error) {
    setFormError(form, error.message);
  } finally {
    setButtonBusy(button, false);
  }
}

async function quickLogin(button) {
  if (!requireLoginOrNoop()) return;
  const username = button.dataset.username;
  const password = username === 'admin' ? 'admin123' : '123456';
  setButtonBusy(button, true);
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { username, password }
    });
    finishLogin(data, `已切换到${data.user.role === 'admin' ? '管理员' : '体验'}账号`);
  } catch (error) {
    toastError(error);
  } finally {
    setButtonBusy(button, false);
  }
}

function requireLoginOrNoop() {
  return true;
}

/* ------------------------------------------------------------------ */
/* Interactions                                                       */
/* ------------------------------------------------------------------ */

function updateLikeUI(recipeId, liked, count) {
  document.querySelectorAll(`[data-action="toggle-like"][data-id="${recipeId}"]`).forEach(
    (button) => {
      button.classList.toggle('is-active', liked);
      button.setAttribute('aria-pressed', String(liked));
      button.setAttribute('aria-label', liked ? '取消喜欢' : '喜欢这道菜谱');
    }
  );
  document
    .querySelectorAll(`[data-like-count="${recipeId}"]`)
    .forEach((element) => {
      element.textContent = compactNumber(count);
    });
}

function updateFavoriteUI(recipeId, favorited, count) {
  document
    .querySelectorAll(`[data-action="toggle-favorite"][data-id="${recipeId}"]`)
    .forEach((button) => {
      button.classList.toggle('is-active', favorited);
      button.setAttribute('aria-pressed', String(favorited));
      button.setAttribute('aria-label', favorited ? '取消收藏' : '收藏这道菜谱');
    });
  document
    .querySelectorAll(`[data-favorite-count="${recipeId}"]`)
    .forEach((element) => {
      element.textContent = compactNumber(count);
    });
}

async function toggleLike(button) {
  if (!requireLogin('登录后就可以喜欢这道菜谱')) return;
  const recipeId = button.dataset.id;
  if (!recipeId || button.dataset.busy === '1') return;
  button.dataset.busy = '1';
  try {
    const data = await api(`/recipes/${encodeURIComponent(recipeId)}/like`, {
      method: 'POST'
    });
    updateLikeUI(recipeId, data.liked, data.likeCount);
    toast(data.liked ? '已加入你的喜欢' : '已取消喜欢', data.liked ? 'success' : 'info');
  } catch (error) {
    toastError(error);
  } finally {
    delete button.dataset.busy;
  }
}

async function toggleFavorite(button) {
  if (!requireLogin('登录后就可以收藏这道菜谱')) return;
  const recipeId = button.dataset.id;
  if (!recipeId || button.dataset.busy === '1') return;
  button.dataset.busy = '1';
  try {
    const data = await api(`/recipes/${encodeURIComponent(recipeId)}/favorite`, {
      method: 'POST'
    });
    updateFavoriteUI(recipeId, data.favorited, data.favoriteCount);
    toast(data.favorited ? '已收藏，随时回来找它' : '已取消收藏', data.favorited ? 'success' : 'info');
  } catch (error) {
    toastError(error);
  } finally {
    delete button.dataset.busy;
  }
}

async function logout() {
  try {
    await api('/auth/logout', { method: 'POST' });
  } catch {
    /* The session is stateless; clearing the local token is enough. */
  }
  clearSession();
  renderHeader();
  const path = parseRoute().path;
  if (path.startsWith('/me') || path.startsWith('/publish') || path.startsWith('/admin')) {
    navigate('/');
  } else {
    renderRoute();
  }
}

async function handleDeleteRecipe(button) {
  const id = button.dataset.id;
  const title = button.dataset.title || '这份菜谱';
  const confirmed = await confirmDialog({
    title: '确定删除这份菜谱？',
    message: `「${title}」删除后无法恢复，相关评论也会一起移除。`,
    confirmText: '删除',
    danger: true
  });
  if (!confirmed) return;
  try {
    await api(`/recipes/${encodeURIComponent(id)}`, { method: 'DELETE' });
    toast('菜谱已删除', 'info');
    navigate('/me?tab=works');
  } catch (error) {
    toastError(error);
  }
}

async function handleDeleteComment(button) {
  const id = button.dataset.id;
  const recipeId = button.dataset.recipeId;
  const confirmed = await confirmDialog({
    title: '删除这条留言？',
    message: '留言删除后将无法恢复。',
    confirmText: '删除留言',
    danger: true
  });
  if (!confirmed) return;
  try {
    await api(`/comments/${encodeURIComponent(id)}`, { method: 'DELETE' });
    button.closest('.comment-item')?.remove();
    const comments = document.querySelectorAll('.comment-item');
    document
      .querySelectorAll(`[data-comment-count="${recipeId}"]`)
      .forEach((element) => {
        element.textContent = String(comments.length);
      });
    toast('留言已删除', 'info');
  } catch (error) {
    toastError(error);
  }
}

function syncStepNumbers(editorList) {
  editorList.querySelectorAll('.step-editor').forEach((step, index) => {
    const badge = step.querySelector('.step-editor__number');
    if (badge) badge.textContent = String(index + 1).padStart(2, '0');
    const remove = step.querySelector('[data-action="remove-step"]');
    if (remove) remove.disabled = editorList.querySelectorAll('.step-editor').length <= 1;
  });
}

function updatePublishChecklist() {
  const form = document.getElementById('publish-form');
  if (!form) return;
  const title = form.elements.title?.value.trim() || '';
  const summary = form.elements.summary?.value.trim() || '';
  const cover = form.querySelector('.cover-url')?.value || '';
  const ingredients = [...form.querySelectorAll('[data-ingredient-row]')].filter(
    (row) => row.querySelector('.ingredient-name')?.value.trim()
  ).length;
  const steps = [...form.querySelectorAll('.step-editor')];
  const filledSteps = steps.filter((step) => step.querySelector('.step-text')?.value.trim()).length;
  const stepsWithImages = steps.filter((step) => step.querySelector('.step-image')?.value).length;
  const tagCount = form.querySelectorAll('input[name="tags"]:checked').length;
  const checks = {
    basics: title.length >= 2 && summary.length >= 5,
    cover: Boolean(cover),
    ingredients: ingredients >= 3,
    steps: filledSteps >= 2 && stepsWithImages >= 1,
    tags: tagCount >= 1
  };
  let completed = 0;
  Object.entries(checks).forEach(([key, value]) => {
    if (value) completed += 1;
    const item = document.querySelector(`[data-check="${key}"]`);
    if (item) item.classList.toggle('is-done', value);
  });
  const total = Object.keys(checks).length;
  const percent = Math.round((completed / total) * 100);
  const meter = document.querySelector('[data-checklist-meter]');
  if (meter) meter.style.setProperty('--progress', `${percent}%`);
  const label = document.querySelector('[data-checklist-percent]');
  if (label) label.textContent = `${percent}%`;
}

function updateTagLimit(form) {
  if (!form) return;
  const choices = [...form.querySelectorAll('input[name="tags"]')];
  const selected = choices.filter((choice) => choice.checked).length;
  choices.forEach((choice) => {
    choice.disabled = !choice.checked && selected >= 6;
  });
  const count = form.querySelector('[data-tag-count]');
  if (count) count.textContent = `${selected} / 6`;
}

function addCustomTag(form) {
  const input = form?.querySelector('[data-custom-tag-input]');
  const value = input?.value.trim() || '';
  if (!value) {
    input?.focus();
    return;
  }
  if (!/^[一-龥A-Za-z0-9·]{2,12}$/.test(value)) {
    toast('食材名请使用 2–12 个汉字、字母或数字', 'error');
    return;
  }
  const choices = form.querySelector('[data-tag-group="食材"] .tag-picker__choices');
  if (!choices) return;
  const selected = form.querySelectorAll('input[name="tags"]:checked').length;
  const existing = [...form.querySelectorAll('input[name="tags"]')].find(
    (choice) => choice.value === value
  );
  if (existing) {
    if (!existing.checked) {
      if (selected >= 6) {
        toast('最多选择 6 个标签，先取消一个再添加', 'error');
        return;
      }
      existing.checked = true;
    }
  } else {
    if (selected >= 6) {
      toast('最多选择 6 个标签，先取消一个再添加', 'error');
      return;
    }
    const label = document.createElement('label');
    label.className = 'tag-choice tag-choice--custom';
    label.innerHTML = `<input type="checkbox" name="tags" value="${escapeHtml(
      value
    )}" checked />
      <span>${escapeHtml(value)}</span>`;
    choices.appendChild(label);
  }
  input.value = '';
  updateTagLimit(form);
  updatePublishChecklist();
  toast(`已添加食材标签「${value}」`);
}

async function handleUploadInput(input) {
  if (!state.user) {
    openAuth('login');
    input.value = '';
    return;
  }
  const file = input.files?.[0];
  if (!file) return;
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    toast('请选择 JPG、PNG、WebP 或 GIF 图片', 'error');
    input.value = '';
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    toast('图片不能超过 8MB', 'error');
    input.value = '';
    return;
  }

  const kind = input.dataset.upload;
  const form = input.closest('form');
  const coverShell = input.closest('.cover-upload');
  const stepEditor = input.closest('.step-editor');
  const uploadShell = kind === 'cover' ? coverShell : stepEditor?.querySelector('.step-upload');
  uploadShell?.classList.add('is-uploading');

  const body = new FormData();
  body.append('image', file);
  try {
    const data = await api('/upload', { method: 'POST', body });
    if (kind === 'cover') {
      const hidden = form.querySelector('.cover-url');
      const preview = coverShell.querySelector('.cover-preview');
      if (hidden) hidden.value = data.url;
      if (preview) preview.src = data.url;
      coverShell.classList.add('has-image');
    } else if (stepEditor) {
      const hidden = stepEditor.querySelector('.step-image');
      const preview = stepEditor.querySelector('.step-preview');
      if (hidden) hidden.value = data.url;
      if (preview) preview.src = data.url;
      uploadShell.classList.add('has-image');
    }
    toast('图片上传好了');
    updatePublishChecklist();
  } catch (error) {
    toastError(error);
  } finally {
    uploadShell?.classList.remove('is-uploading');
    input.value = '';
  }
}

/* ------------------------------------------------------------------ */
/* Submissions                                                        */
/* ------------------------------------------------------------------ */

function handleSearchForm(form) {
  const query = form.elements.q?.value.trim() || '';
  navigate(query ? `/recipes?q=${encodeURIComponent(query)}` : '/recipes');
}

async function handleCommentSubmit(form) {
  if (!requireLogin('登录后就可以留下你的厨房留言')) return;
  const recipeId = form.dataset.recipeId;
  const textarea = form.querySelector('textarea[name="content"]');
  const button = form.querySelector('[type="submit"]');
  const content = textarea?.value.trim() || '';
  setFormError(form, '');
  if (content.length < 2) {
    setFormError(form, '留言至少需要 2 个字');
    textarea?.focus();
    return;
  }
  setButtonBusy(button, true);
  try {
    const data = await api(`/recipes/${encodeURIComponent(recipeId)}/comments`, {
      method: 'POST',
      body: { content }
    });
    const list = document.querySelector('.comment-list');
    const empty = list?.querySelector('.comment-empty');
    if (empty) empty.remove();
    if (list) {
      list.insertAdjacentHTML('beforeend', commentMarkup(data.comment, recipeId, true));
    }
    textarea.value = '';
    const counter = form.querySelector('[data-comment-counter]');
    if (counter) counter.textContent = '0';
    document
      .querySelectorAll(`[data-comment-count="${recipeId}"]`)
      .forEach((element) => {
        element.textContent = String(data.commentCount);
      });
    toast('留言已送达');
  } catch (error) {
    setFormError(form, error.message);
  } finally {
    setButtonBusy(button, false);
  }
}

function collectPublishPayload(form) {
  const tags = [...form.querySelectorAll('input[name="tags"]:checked')].map(
    (input) => input.value
  );
  const ingredients = [...form.querySelectorAll('[data-ingredient-row]')]
    .map((row) => ({
      name: row.querySelector('.ingredient-name')?.value.trim() || '',
      amount: row.querySelector('.ingredient-amount')?.value.trim() || ''
    }))
    .filter((item) => item.name);
  const steps = [...form.querySelectorAll('.step-editor')]
    .map((step) => ({
      text: step.querySelector('.step-text')?.value.trim() || '',
      image: step.querySelector('.step-image')?.value || ''
    }))
    .filter((item) => item.text);
  const difficulty = form.querySelector('input[name="difficulty"]:checked')?.value || '简单';
  return {
    title: form.elements.title?.value.trim() || '',
    summary: form.elements.summary?.value.trim() || '',
    cover: form.querySelector('.cover-url')?.value || '',
    category: form.elements.category?.value || '',
    difficulty,
    time: Number(form.elements.time?.value),
    servings: Number(form.elements.servings?.value),
    tags,
    ingredients,
    steps,
    tips: form.elements.tips?.value.trim() || ''
  };
}

function validatePublishPayload(payload) {
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

async function handlePublishSubmit(form) {
  if (!requireLogin('登录后就可以发布自己的菜谱')) return;
  if (form.querySelector('.is-uploading')) {
    setFormError(form, '还有图片正在上传，请稍等片刻');
    return;
  }
  const button = form.querySelector('[type="submit"]');
  const payload = collectPublishPayload(form);
  const message = validatePublishPayload(payload);
  setFormError(form, '');
  if (message) {
    setFormError(form, message);
    return;
  }
  const editId = form.dataset.editId || '';
  setButtonBusy(button, true);
  try {
    const data = await api(editId ? `/recipes/${encodeURIComponent(editId)}` : '/recipes', {
      method: editId ? 'PUT' : 'POST',
      body: payload
    });
    openPublishSuccess(data, Boolean(editId));
  } catch (error) {
    setFormError(form, error.message);
    if (Array.isArray(error.details) && error.details.length > 1) {
      toast(error.details[1], 'error');
    }
  } finally {
    setButtonBusy(button, false);
  }
}

function openPublishSuccess(data, isEdit) {
  const recipe = data.recipe;
  const approved = recipe.status === 'approved';
  openModal(
    `<div class="success-dialog">
      <div class="success-dialog__mark">${icon(approved ? 'check' : 'clock')}</div>
      <p class="eyebrow">${approved ? 'PUBLISHED' : 'IN REVIEW'}</p>
      <h2>${approved ? (isEdit ? '菜谱已更新' : '菜谱已发布') : isEdit ? '修改已提交' : '菜谱已送达审核'}</h2>
      <p>${
        approved
          ? '这份认真已经被端上桌了，去看看吧。'
          : '管理员会尽快看看你的菜谱。审核通过后，它就会出现在社区里。'
      }</p>
      <div class="success-dialog__recipe">
        <img src="${escapeHtml(recipe.cover)}" alt="" />
        <div><strong>${escapeHtml(recipe.title)}</strong><span>${approved ? '已公开' : '审核中'}</span></div>
      </div>
      <div class="success-dialog__actions">
        ${
          approved
            ? `<a class="btn btn--primary" href="#/recipe/${encodeURIComponent(recipe.id)}">看看我的菜谱</a>`
            : `<a class="btn btn--primary" href="#/me?tab=works">去个人中心</a>`
        }
        <a class="btn btn--soft" href="#/recipes">继续逛逛</a>
      </div>
    </div>`,
    { className: 'modal--success', label: '发布结果' }
  );
}

async function handleAdminSearch(form) {
  const query = form.elements.q?.value.trim() || '';
  const base = form.dataset.base || '/admin/recipes';
  const status = form.dataset.status || '';
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (status) params.set('status', status);
  const suffix = params.toString() ? `?${params.toString()}` : '';
  navigate(`${base}${suffix}`);
}

/* ------------------------------------------------------------------ */
/* Global events                                                      */
/* ------------------------------------------------------------------ */

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (form.classList.contains('js-search-form')) {
    event.preventDefault();
    handleSearchForm(form);
    return;
  }
  if (form.classList.contains('js-admin-search-form')) {
    event.preventDefault();
    handleAdminSearch(form);
    return;
  }
  if (form.id === 'login-form') {
    event.preventDefault();
    submitLogin(form);
    return;
  }
  if (form.id === 'register-form') {
    event.preventDefault();
    submitRegister(form);
    return;
  }
  if (form.id === 'comment-form') {
    event.preventDefault();
    handleCommentSubmit(form);
    return;
  }
  if (form.id === 'publish-form') {
    event.preventDefault();
    handlePublishSubmit(form);
    return;
  }
  if (form.id === 'reject-form') {
    event.preventDefault();
    rejectRecipeFromForm(form);
  }
});

document.addEventListener('change', (event) => {
  const target = event.target;
  if (target.matches('input[type="file"][data-upload]')) {
    handleUploadInput(target);
    return;
  }
  if (target.matches('input[name="tags"]')) {
    updateTagLimit(target.closest('form'));
    updatePublishChecklist();
    return;
  }
  if (target.matches('[data-sort-select]')) {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    params.set('sort', target.value);
    navigate(`/recipes?${params.toString()}`);
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const input = event.target.closest?.('[data-custom-tag-input]');
  if (!input) return;
  event.preventDefault();
  addCustomTag(input.closest('form'));
});

document.addEventListener('input', (event) => {
  const target = event.target;
  if (target.closest('#publish-form')) updatePublishChecklist();
  if (target.matches('[data-comment-input]')) {
    const form = target.closest('form');
    const counter = form?.querySelector('[data-comment-counter]');
    if (counter) counter.textContent = String(target.value.length);
  }
});

document.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'toggle-menu') {
    state.menuOpen = !state.menuOpen;
    renderHeader();
    return;
  }
  if (action === 'close-menu') {
    state.menuOpen = false;
    renderHeader();
    return;
  }
  if (action === 'open-auth') {
    event.preventDefault();
    openAuth('login');
    return;
  }
  if (action === 'auth-tab') {
    event.preventDefault();
    switchAuthTab(target.dataset.mode || 'login');
    return;
  }
  if (action === 'quick-login') {
    event.preventDefault();
    quickLogin(target);
    return;
  }
  if (action === 'close-modal') {
    event.preventDefault();
    closeModal();
    return;
  }
  if (action === 'confirm-yes') {
    resolveConfirm(true);
    return;
  }
  if (action === 'confirm-no') {
    resolveConfirm(false);
    return;
  }
  if (action === 'logout') {
    event.preventDefault();
    logout();
    return;
  }
  if (action === 'toggle-like') {
    event.preventDefault();
    toggleLike(target);
    return;
  }
  if (action === 'toggle-favorite') {
    event.preventDefault();
    toggleFavorite(target);
    return;
  }
  if (action === 'delete-recipe') {
    event.preventDefault();
    handleDeleteRecipe(target);
    return;
  }
  if (action === 'delete-comment') {
    event.preventDefault();
    handleDeleteComment(target);
    return;
  }
  if (action === 'add-custom-tag') {
    event.preventDefault();
    addCustomTag(target.closest('form'));
    return;
  }
  if (action === 'add-ingredient') {
    event.preventDefault();
    addIngredientRow();
    return;
  }
  if (action === 'remove-ingredient') {
    event.preventDefault();
    const row = target.closest('[data-ingredient-row]');
    const list = row?.parentElement;
    if (row && list && list.querySelectorAll('[data-ingredient-row]').length > 1) {
      row.remove();
      updatePublishChecklist();
    }
    return;
  }
  if (action === 'add-step') {
    event.preventDefault();
    addStepEditor();
    return;
  }
  if (action === 'remove-step') {
    event.preventDefault();
    const editor = target.closest('.step-editor');
    const list = editor?.parentElement;
    if (editor && list && list.querySelectorAll('.step-editor').length > 1) {
      editor.remove();
      syncStepNumbers(list);
      updatePublishChecklist();
    }
    return;
  }
  if (action === 'review-open') {
    event.preventDefault();
    openReviewModal(target.dataset.id);
    return;
  }
  if (action === 'approve-recipe') {
    event.preventDefault();
    approveRecipe(target.dataset.id, target);
    return;
  }
  if (action === 'copy-link') {
    event.preventDefault();
    copyCurrentLink();
    return;
  }
  if (action === 'scroll-comments') {
    event.preventDefault();
    document.querySelector('.comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (action === 'focus-comment') {
    event.preventDefault();
    document.querySelector('[data-comment-input]')?.focus();
    document.querySelector('.comments-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (action === 'view-image') {
    event.preventDefault();
    openImageLightbox(target.dataset.src || '', target.dataset.alt || '菜谱图片');
    return;
  }
  if (action === 'retry-route') {
    event.preventDefault();
    renderRoute();
  }
});

document.addEventListener('keydown', (event) => {
  const modal = modalRoot.querySelector('.modal');
  if (!modal) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [
    ...modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ].filter((element) => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

/* Chart hover/tooltips are wired at the bottom of this file. */

/* ------------------------------------------------------------------ */
/* Route rendering                                                    */
/* ------------------------------------------------------------------ */

async function renderRoute() {
  const route = parseRoute();
  const seq = ++state.renderSeq;
  state.route = route;
  state.menuOpen = false;
  closeModal();
  renderHeader();
  document.title = APP_TITLE;
  window.scrollTo({ top: 0, behavior: 'auto' });
  app.innerHTML = pageLoader();
  app.setAttribute('aria-busy', 'true');

  try {
    if (route.path === '/') {
      await renderHomeView(seq);
    } else if (route.path === '/recipes') {
      await renderRecipesView(seq, route);
    } else if (route.path === '/hot') {
      await renderHotView(seq, route);
    } else if (route.path.startsWith('/recipe/')) {
      await renderRecipeDetailView(seq, route);
    } else if (route.path === '/publish') {
      await renderPublishView(seq, route);
    } else if (route.path === '/me') {
      await renderProfileView(seq, route);
    } else if (route.path === '/admin') {
      await renderAdminOverview(seq, route);
    } else if (route.path === '/admin/review') {
      await renderAdminReview(seq, route);
    } else if (route.path === '/admin/recipes') {
      await renderAdminRecipes(seq, route);
    } else {
      app.innerHTML = notFoundView();
    }
  } catch (error) {
    if (seq !== state.renderSeq) return;
    console.error(error);
    app.innerHTML = errorView(error);
  } finally {
    if (seq === state.renderSeq) app.removeAttribute('aria-busy');
  }
}

/* ------------------------------------------------------------------ */
/* Boot                                                               */
/* ------------------------------------------------------------------ */

async function init() {
  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
  state.route = parseRoute();

  try {
    if (state.token) {
      try {
        const data = await api('/auth/me');
        state.user = data.user;
      } catch {
        clearSession(false);
      }
    }
    state.meta = await api('/meta');
  } catch (error) {
    headerEl.innerHTML = '';
    app.innerHTML = errorView(error);
    return;
  }

  renderHeader();
  window.addEventListener('hashchange', renderRoute);
  await renderRoute();
}

/* ------------------------------------------------------------------ */
/* Views                                                              */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Shared view pieces                                                 */
/* ------------------------------------------------------------------ */

function recipeCard(recipe, options = {}) {
  const href = `#/recipe/${encodeURIComponent(recipe.id)}`;
  const tags = (recipe.tags || [])
    .slice(0, 2)
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join('');
  return `<article class="recipe-card" data-card-id="${escapeHtml(recipe.id)}">
    <div class="recipe-card__cover">
      <a href="${href}" aria-label="查看菜谱：${escapeHtml(recipe.title)}">
        <img src="${escapeHtml(recipe.cover)}" alt="${escapeHtml(recipe.title)}" loading="lazy" decoding="async" />
      </a>
      <span class="recipe-card__category">${escapeHtml(recipe.category)}</span>
      ${options.showStatus && recipe.status !== 'approved' ? statusPill(recipe.status) : ''}
      <button class="round-action recipe-card__save ${
        recipe.favorited ? 'is-active' : ''
      }" type="button" data-action="toggle-favorite" data-id="${escapeHtml(recipe.id)}" aria-pressed="${
    recipe.favorited
  }" aria-label="${recipe.favorited ? '取消收藏' : '收藏这道菜谱'}">${icon('bookmark')}</button>
    </div>
    <div class="recipe-card__body">
      <div class="recipe-card__tags">${tags}</div>
      <h3 class="recipe-card__title"><a href="${href}">${escapeHtml(recipe.title)}</a></h3>
      <p class="recipe-card__summary">${escapeHtml(recipe.summary)}</p>
      <div class="recipe-card__footer">
        <div class="author-line">
          ${avatarMarkup(recipe.author, 'xs')}
          <span class="author-line__name">${escapeHtml(recipe.author?.nickname || '厨友')}</span>
        </div>
        <div class="card-stats">
          <button class="stat-action ${recipe.liked ? 'is-active' : ''}" type="button" data-action="toggle-like" data-id="${escapeHtml(
            recipe.id
          )}" aria-pressed="${recipe.liked}" aria-label="${
    recipe.liked ? '取消喜欢' : '喜欢这道菜谱'
  }">${icon('heart')}<span data-like-count="${escapeHtml(recipe.id)}">${compactNumber(
    recipe.likeCount
  )}</span></button>
          <span class="stat-action is-static" aria-label="收藏数">${icon(
            'bookmark'
          )}<span data-favorite-count="${escapeHtml(recipe.id)}">${compactNumber(
    recipe.favoriteCount
  )}</span></span>
          <span class="stat-action is-static" aria-label="评论数">${icon(
            'message'
          )}<span>${compactNumber(recipe.commentCount)}</span></span>
        </div>
      </div>
    </div>
  </article>`;
}

function rankingPanel(items) {
  if (!items.length) return '';
  return `<aside class="ranking-panel">
    <div class="ranking-panel__head">
      <span class="ranking-panel__flame">${icon('flame')}</span>
      <div>
        <p class="eyebrow">KITCHEN HEAT</p>
        <h3>厨房热榜</h3>
      </div>
      <a class="round-action round-action--small" href="#/hot" aria-label="查看完整榜单">${icon(
        'arrowUpRight'
      )}</a>
    </div>
    <ol class="ranking-list">
      ${items
        .map(
          (item, index) => `<li class="ranking-item">
        <a class="ranking-item__link" href="#/recipe/${encodeURIComponent(item.id)}">
          <span class="rank-number">${String(index + 1).padStart(2, '0')}</span>
          <span class="rank-thumb"><img src="${escapeHtml(
            item.cover
          )}" alt="" loading="lazy" /></span>
          <span class="rank-info">
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.author?.nickname || '厨友')} · ${compactNumber(
              item.likeCount
            )} 喜欢</small>
          </span>
        </a>
      </li>`
        )
        .join('')}
    </ol>
    <a class="ranking-panel__all" href="#/hot">查看完整榜单 ${icon('arrowRight')}</a>
  </aside>`;
}

function commentMarkup(comment, recipeId, allowDelete = false) {
  const canDelete =
    allowDelete &&
    state.user &&
    (comment.author?.id === state.user.id || state.user.role === 'admin');
  return `<li class="comment-item" data-comment-id="${escapeHtml(comment.id)}">
    ${avatarMarkup(comment.author, 'sm')}
    <div class="comment-item__body">
      <div class="comment-item__head">
        <div><strong>${escapeHtml(comment.author?.nickname || '厨友')}</strong><span>${formatRelative(
          comment.createdAt
        )}</span></div>
        ${
          canDelete
            ? `<button class="text-button text-button--danger" type="button" data-action="delete-comment" data-id="${escapeHtml(
                comment.id
              )}" data-recipe-id="${escapeHtml(recipeId)}">删除</button>`
            : ''
        }
      </div>
      <p>${escapeHtml(comment.content)}</p>
    </div>
  </li>`;
}

function errorView(error) {
  const status = error?.status;
  const title = status === 404 ? '这道菜好像已经端走了' : '厨房里冒出了一点小状况';
  const message =
    status === 404
      ? '菜谱可能已被删除，也可能还在等待审核。换一道菜看看？'
      : '页面暂时没有加载出来，稍后再试一次，或者先回首页逛逛。';
  return `<section class="status-page">
    <div class="status-page__card">
      <span class="status-page__mark">${status === 404 ? '404' : '!'}</span>
      <p class="eyebrow">A SMALL KITCHEN MISHAP</p>
      <h1>${title}</h1>
      <p>${message}</p>
      <div class="status-page__actions">
        <button class="btn btn--primary" type="button" data-action="retry-route">再试一次</button>
        <a class="btn btn--soft" href="#/">回到首页</a>
      </div>
    </div>
  </section>`;
}

function notFoundView() {
  return `<section class="status-page">
    <div class="status-page__card">
      <span class="status-page__mark">404</span>
      <p class="eyebrow">PAGE NOT FOUND</p>
      <h1>这里没有开火</h1>
      <p>这个页面不存在。也许是地址写错了，回厨房重新找找看吧。</p>
      <div class="status-page__actions">
        <a class="btn btn--primary" href="#/">回到首页</a>
        <a class="btn btn--soft" href="#/recipes">看看菜谱</a>
      </div>
    </div>
  </section>`;
}

function authGateView({ eyebrow: gateEyebrow, title, message, adminOnly = false }) {
  return `<section class="auth-gate container">
    <div class="auth-gate__visual">
      <div class="auth-gate__card">
        <img src="/images/ingredients.jpg" alt="料理台上的新鲜食材" />
        <span class="stamp-note">${adminOnly ? '后厨入口' : '欢迎回来'}</span>
      </div>
    </div>
    <div class="auth-gate__copy">
      <p class="eyebrow">${escapeHtml(gateEyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <div class="auth-gate__actions">
        ${
          state.user
            ? `<a class="btn btn--primary" href="#/me">回到个人中心</a>
               <a class="btn btn--soft" href="#/">四处逛逛</a>`
            : `<button class="btn btn--primary" type="button" data-action="open-auth">${
                adminOnly ? '登录管理账号' : '登录 / 注册'
              }</button>
               <a class="btn btn--soft" href="#/">先去逛逛</a>`
        }
      </div>
      ${
        adminOnly && !state.user
          ? `<div class="auth-gate__hint"><strong>体验管理员</strong><span>admin / admin123</span></div>`
          : ''
      }
    </div>
  </section>`;
}

function buildLibraryUrl(baseFilters, overrides = {}) {
  const merged = { ...baseFilters, ...overrides };
  const params = new URLSearchParams();
  ['tag', 'category', 'q', 'sort'].forEach((key) => {
    const value = merged[key];
    if (value && !(key === 'sort' && value === 'latest')) params.set(key, value);
  });
  const query = params.toString();
  return `#/recipes${query ? `?${query}` : ''}`;
}

function categoryFiltersMarkup(filters) {
  const categories = state.meta?.categories || [];
  return `<div class="filter-tabs" role="group" aria-label="按菜品分类筛选">
    <a class="filter-tab ${!filters.category ? 'is-active' : ''}" href="${buildLibraryUrl(
    filters,
    { category: '' }
  )}">全部</a>
    ${categories
      .map(
        (category) =>
          `<a class="filter-tab ${
            filters.category === category ? 'is-active' : ''
          }" href="${buildLibraryUrl(filters, { category })}">${escapeHtml(category)}</a>`
      )
      .join('')}
  </div>`;
}

function tagFiltersMarkup(filters) {
  return (state.meta?.tagGroups || [])
    .map(
      (group) => `<div class="filter-group">
        <span class="filter-group__label">${escapeHtml(group.name)}</span>
        <div class="filter-chips">
          ${group.tags
            .map(
              (tag) =>
                `<a class="filter-chip ${
                  filters.tag === tag ? 'is-active' : ''
                }" href="${buildLibraryUrl(filters, { tag })}">${
                  TAG_EMOJI[tag] ? `<span aria-hidden="true">${TAG_EMOJI[tag]}</span>` : ''
                }${escapeHtml(tag)}</a>`
            )
            .join('')}
        </div>
      </div>`
    )
    .join('');
}

/* ------------------------------------------------------------------ */
/* Home                                                               */
/* ------------------------------------------------------------------ */

async function renderHomeView(seq) {
  const [recipesData, rankingData] = await Promise.all([
    api('/recipes?sort=latest&limit=7'),
    api('/ranking?limit=5')
  ]);
  if (seq !== state.renderSeq) return;

  const items = recipesData.items || [];
  const ranking = rankingData.items || [];
  const feature = ranking[0] || items[0];
  if (!feature) throw new Error('还没有公开的菜谱');

  const people = [
    ...new Map(
      [...ranking, ...items].map((recipe) => [recipe.author?.id, recipe.author])
    ).values()
  ]
    .filter(Boolean)
    .slice(0, 4);
  const miniRecipe = items.find((item) => item.id !== feature.id) || items[0];
  const ingredients =
    state.meta?.tagGroups?.find((group) => group.name === '食材')?.tags || [];
  const categories = state.meta?.categories || [];
  const newThisWeek = items.filter(
    (item) => Date.now() - new Date(item.createdAt).getTime() < 7 * 86400000
  ).length;
  const community = state.meta?.community || {};

  app.innerHTML = `<div class="home-page">
    <section class="home-hero">
      <div class="container home-hero__inner">
        <div class="hero-copy">
          <p class="eyebrow"><span class="eyebrow__line"></span> RECIPE · STORY · DAILY LIFE</p>
          <h1 class="hero-title">把日子，<br /><span class="hero-title__accent">煮成喜欢的样子。</span></h1>
          <p class="hero-lead">从冰箱里现有的食材出发，把每一顿饭认真做完。这里有家常菜谱、厨房灵感和一群好好吃饭的人。</p>
          <form class="hero-search js-search-form" role="search">
            <span class="hero-search__icon">${icon('search')}</span>
            <label class="visually-hidden" for="hero-search-input">搜索菜谱或食材</label>
            <input id="hero-search-input" type="search" name="q" placeholder="试试搜「番茄」「一人食」…" autocomplete="off" />
            <button class="btn btn--primary hero-search__button" type="submit">找菜谱</button>
          </form>
          <div class="hero-community">
            <div class="avatar-stack" aria-hidden="true">
              ${people.map((person) => avatarMarkup(person, 'sm')).join('')}
              <span class="avatar avatar--sm avatar--more">+</span>
            </div>
            <p>已有 <strong>${formatNumber(community.cooks || 0)}</strong> 位厨友，写下 <strong>${formatNumber(
    community.approvedRecipes || items.length
  )}</strong> 道公开菜谱</p>
          </div>
          <div class="hero-caption">
            <span class="hero-caption__rule"></span>
            <span>本周新收录 ${newThisWeek} 道菜谱</span>
            <span class="hero-caption__dot"></span>
            <span>${formatNumber(community.totalLikes || 0)} 次喜欢</span>
          </div>
        </div>

        <div class="hero-visual">
          <span class="hero-scribble">今天也要<br />好好吃饭</span>
          <div class="hero-orbit hero-orbit--one"></div>
          <div class="hero-orbit hero-orbit--two"></div>
          <article class="feature-card">
            <div class="feature-card__top">
              <span class="feature-pick">${icon('sparkles')} 今日精选</span>
              <span class="feature-time">${icon('clock')} ${feature.time} 分钟</span>
            </div>
            <a class="feature-card__cover" href="#/recipe/${encodeURIComponent(feature.id)}" aria-label="查看精选菜谱">
              <img src="${escapeHtml(feature.cover)}" alt="${escapeHtml(feature.title)}" decoding="async" />
            </a>
            <div class="feature-card__body">
              <div class="feature-card__tags">
                ${feature.tags
                  .slice(0, 2)
                  .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
                  .join('')}
              </div>
              <h2><a href="#/recipe/${encodeURIComponent(feature.id)}">${escapeHtml(
    feature.title
  )}</a></h2>
              <div class="feature-card__meta">
                <div class="author-line">${avatarMarkup(feature.author, 'xs')}<span class="author-line__name">${escapeHtml(
    feature.author?.nickname || '厨友'
  )}</span></div>
                <span class="feature-heat">${icon('heart')} ${compactNumber(feature.likeCount)}</span>
              </div>
            </div>
            <span class="feature-seal">今日<br />上桌</span>
          </article>
          ${
            miniRecipe
              ? `<a class="hero-mini-card" href="#/recipe/${encodeURIComponent(miniRecipe.id)}">
                  <img src="${escapeHtml(miniRecipe.cover)}" alt="" loading="lazy" />
                  <span><small>ALSO GOOD</small><strong>${escapeHtml(
                    miniRecipe.title
                  )}</strong></span>
                  <i>${icon('arrowUpRight')}</i>
                </a>`
              : ''
          }
          <div class="hero-floating-note">${icon('flame')}<span><strong>${compactNumber(
    feature.likeCount
  )}</strong> 人正在喜欢</span></div>
        </div>
      </div>
    </section>

    <section class="ingredient-shelf">
      <div class="container">
        <div class="shelf-head">
          <div>
            <p class="eyebrow">COOK WITH WHAT YOU HAVE</p>
            <h2>从手边的食材开始</h2>
          </div>
          <a class="text-link" href="#/recipes">全部菜谱 ${icon('arrowRight')}</a>
        </div>
        <div class="ingredient-chips">
          <a class="ingredient-chip ingredient-chip--all" href="#/recipes">全部</a>
          ${ingredients
            .map(
              (tag) =>
                `<a class="ingredient-chip" href="#/recipes?tag=${encodeURIComponent(
                  tag
                )}"><span class="ingredient-chip__emoji" aria-hidden="true">${
                  TAG_EMOJI[tag] || '🍽'
                }</span>${escapeHtml(tag)}</a>`
            )
            .join('')}
        </div>
        <div class="category-row">
          <span class="category-row__label">按场景</span>
          ${categories
            .map(
              (category) =>
                `<a class="category-link" href="#/recipes?category=${encodeURIComponent(
                  category
                )}">${escapeHtml(category)} ${icon('chevronRight')}</a>`
            )
            .join('')}
        </div>
      </div>
    </section>

    <section class="section home-recipes">
      <div class="container">
        <div class="section-heading">
          <div>
            <p class="eyebrow">FRESH FROM THE KITCHEN</p>
            <h2 class="section-title">最近，大家都在做什么</h2>
          </div>
          <a class="text-link" href="#/recipes">发现更多 ${icon('arrowRight')}</a>
        </div>
        <div class="home-layout">
          <div class="recipe-grid">
            ${items
              .slice(0, 6)
              .map((recipe) => recipeCard(recipe))
              .join('')}
          </div>
          <div class="home-sidebar">
            ${rankingPanel(ranking)}
            <div class="sidebar-tip">
              <span class="sidebar-tip__icon">${icon('leaf')}</span>
              <p>“不必追求复杂的调味。食材新鲜，火候刚好，一顿饭就已经很好了。”</p>
              <span class="sidebar-tip__sign">—— 食光记编辑部</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="community-banner">
      <div class="container community-banner__inner">
        <div class="community-quote">
          <span class="community-quote__mark">“</span>
          <p class="eyebrow">THE TABLE IS BETTER TOGETHER</p>
          <blockquote>好好吃饭，<br />是最小单位的自我照顾。</blockquote>
          <p class="community-quote__note">把今天做的那道菜写下来吧。也许正好能成为另一个人明天晚餐的灵感。</p>
          <a class="btn btn--light" href="#/publish">写下我的菜谱 ${icon('arrowRight')}</a>
        </div>
        <div class="community-numbers">
          <div class="community-number">
            <span class="community-number__label">公开菜谱</span>
            <strong>${formatNumber(community.approvedRecipes || 0)}</strong>
            <small>RECIPES</small>
          </div>
          <div class="community-number">
            <span class="community-number__label">认真做饭的人</span>
            <strong>${formatNumber(community.cooks || 0)}</strong>
            <small>COOKS</small>
          </div>
          <div class="community-number">
            <span class="community-number__label">收藏与喜欢</span>
            <strong>${compactNumber(community.totalLikes || 0)}</strong>
            <small>LOVES</small>
          </div>
        </div>
        <span class="community-banner__stamp">人间<br />烟火</span>
      </div>
    </section>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Recipe library                                                     */
/* ------------------------------------------------------------------ */

async function renderRecipesView(seq, route) {
  const filters = {
    tag: route.params.get('tag') || '',
    category: route.params.get('category') || '',
    q: route.params.get('q') || '',
    sort: route.params.get('sort') || 'latest'
  };
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const data = await api(`/recipes?${query.toString()}`);
  if (seq !== state.renderSeq) return;
  const items = data.items || [];
  const activeFilters = [
    filters.tag && { label: `食材 · ${filters.tag}`, clear: buildLibraryUrl(filters, { tag: '' }) },
    filters.category && {
      label: `分类 · ${filters.category}`,
      clear: buildLibraryUrl(filters, { category: '' })
    },
    filters.q && {
      label: `搜索 · ${filters.q}`,
      clear: buildLibraryUrl(filters, { q: '' })
    }
  ].filter(Boolean);

  app.innerHTML = `<div class="library-page">
    <section class="library-hero">
      <span class="library-hero__stamp">灵感<br />菜谱库</span>
      <div class="library-hero__leaf">${icon('leaf')}</div>
      <div class="container library-hero__inner">
        <p class="eyebrow">THE RECIPE LIBRARY</p>
        <h1>今天，想吃点什么？</h1>
        <p>从冰箱里有的食材出发，或只是跟着心情挑一道。总有一顿饭，值得你认真对待。</p>
        <form class="library-search js-search-form" role="search">
          <span>${icon('search')}</span>
          <label class="visually-hidden" for="library-search-input">搜索菜谱、食材或作者</label>
          <input id="library-search-input" type="search" name="q" value="${escapeHtml(
            filters.q
          )}" placeholder="搜一道菜、一种食材，或者一位厨友…" autocomplete="off" />
          <button class="btn btn--primary" type="submit">开始找灵感</button>
        </form>
      </div>
    </section>

    <section class="library-content container">
      <div class="filter-panel">
        <div class="filter-panel__top">
          <span class="filter-panel__title">${icon('filter')} 筛选灵感</span>
          ${
            activeFilters.length || filters.sort !== 'latest'
              ? `<a class="text-button" href="#/recipes">清除全部筛选</a>`
              : ''
          }
        </div>
        ${categoryFiltersMarkup(filters)}
        <div class="filter-groups">${tagFiltersMarkup(filters)}</div>
      </div>

      <div class="results-bar">
        <div class="results-summary">
          <strong>${formatNumber(data.total || items.length)}</strong>
          <span>道菜谱${filters.tag ? `，来自「${escapeHtml(filters.tag)}」` : ''}</span>
          ${
            activeFilters.length
              ? `<div class="active-filters">${activeFilters
                  .map(
                    (filter) =>
                      `<a class="active-filter" href="${filter.clear}">${escapeHtml(
                        filter.label
                      )} ${icon('close')}</a>`
                  )
                  .join('')}</div>`
              : ''
          }
        </div>
        <label class="sort-select">
          <span>排序</span>
          <select data-sort-select aria-label="菜谱排序方式">
            <option value="latest" ${filters.sort === 'latest' ? 'selected' : ''}>最新收录</option>
            <option value="hot" ${filters.sort === 'hot' ? 'selected' : ''}>人气最高</option>
            <option value="quick" ${filters.sort === 'quick' ? 'selected' : ''}>最快上手</option>
          </select>
          ${icon('chevronDown')}
        </label>
      </div>

      ${
        items.length
          ? `<div class="recipe-grid recipe-grid--three">${items
              .map((recipe) => recipeCard(recipe))
              .join('')}</div>`
          : emptyState({
              iconName: 'search',
              title: '没有找到合适的菜谱',
              message: '换个食材或关键词试试。也可以成为第一个分享这道菜的人。',
              action: `<div class="empty-state__actions"><a class="btn btn--primary" href="#/publish">发布我的菜谱</a><a class="btn btn--soft" href="#/recipes">查看全部</a></div>`
            })
      }
    </section>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Hot ranking                                                        */
/* ------------------------------------------------------------------ */

async function renderHotView(seq, route) {
  const data = await api('/ranking?limit=10');
  if (seq !== state.renderSeq) return;
  const items = data.items || [];
  const tagUse = new Map();
  items.forEach((recipe) => {
    recipe.tags.forEach((tag) => tagUse.set(tag, (tagUse.get(tag) || 0) + 1));
  });
  const topTags = [...tagUse.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  app.innerHTML = `<div class="hot-page">
    <section class="hot-hero">
      <div class="container hot-hero__inner">
        <div class="hot-hero__copy">
          <p class="eyebrow">THE KITCHEN HEAT LIST</p>
          <h1>这周，<br /><em>大家都在馋什么？</em></h1>
          <p>由真实的喜欢、收藏、留言与浏览热度共同决定。每一次心动，都在把好吃的菜往前推。</p>
        </div>
        <div class="hot-hero__aside">
          <span class="hot-hero__seal">热<br />榜</span>
          <div class="hot-hero__note">
            <span>${icon('flame')}</span>
            <div><strong>${items.length}</strong><small>道菜正在上榜</small></div>
          </div>
          <div class="hot-hero__note hot-hero__note--soft">
            <span>${icon('heart')}</span>
            <div><strong>${compactNumber(
              items.reduce((sum, item) => sum + item.likeCount, 0)
            )}</strong><small>次真实的喜欢</small></div>
          </div>
        </div>
      </div>
    </section>

    <section class="hot-content container">
      <div class="hot-layout">
        <div class="hot-board">
          <div class="hot-board__head">
            <div><p class="eyebrow">RANKED WITH LOVE</p><h2>本周厨房热度榜</h2></div>
            <span class="hot-board__update">${icon('clock')} 实时更新</span>
          </div>
          <div class="hot-list">
            ${items
              .map(
                (recipe, index) => `<article class="hot-item ${
                  index === 0 ? 'is-lead' : ''
                }">
                  <div class="hot-item__rank"><span>${String(index + 1).padStart(
                    2,
                    '0'
                  )}</span><small>${index === 0 ? 'TOP' : '热度'}</small></div>
                  <a class="hot-item__cover" href="#/recipe/${encodeURIComponent(recipe.id)}">
                    <img src="${escapeHtml(recipe.cover)}" alt="${escapeHtml(
                  recipe.title
                )}" loading="lazy" />
                    ${index === 0 ? '<span class="hot-item__crown">本周最馋</span>' : ''}
                  </a>
                  <div class="hot-item__content">
                    <div class="recipe-card__tags">${recipe.tags
                      .slice(0, 3)
                      .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
                      .join('')}</div>
                    <h3><a href="#/recipe/${encodeURIComponent(recipe.id)}">${escapeHtml(
                  recipe.title
                )}</a></h3>
                    <p>${escapeHtml(recipe.summary)}</p>
                    <div class="hot-item__meta">
                      <div class="author-line">${avatarMarkup(
                        recipe.author,
                        'xs'
                      )}<span class="author-line__name">${escapeHtml(
                  recipe.author?.nickname || '厨友'
                )}</span></div>
                      <span>${formatRelative(recipe.createdAt)}</span>
                    </div>
                    <div class="hot-item__stats">
                      <span>${icon('heart')} ${compactNumber(recipe.likeCount)} 喜欢</span>
                      <span>${icon('bookmark')} ${compactNumber(recipe.favoriteCount)} 收藏</span>
                      <span>${icon('message')} ${compactNumber(recipe.commentCount)} 留言</span>
                      <span>${icon('eye')} ${compactNumber(recipe.viewCount)} 次浏览</span>
                    </div>
                  </div>
                  <a class="hot-item__cta" href="#/recipe/${encodeURIComponent(
                    recipe.id
                  )}" aria-label="查看 ${escapeHtml(recipe.title)}">${icon('arrowUpRight')}</a>
                </article>`
              )
              .join('')}
          </div>
        </div>

        <aside class="hot-aside">
          <div class="panel hot-formula">
            <span class="hot-formula__icon">${icon('bolt')}</span>
            <p class="eyebrow">HOW IT WORKS</p>
            <h3>热度从哪里来？</h3>
            <p>不是简单的浏览量。我们把厨友们真实的动作也算进去了：</p>
            <div class="formula-list">
              <div><span class="formula-list__icon">${icon('heart')}</span><strong>喜欢</strong><small>让喜欢的菜被更多人看见</small></div>
              <div><span class="formula-list__icon">${icon('bookmark')}</span><strong>收藏</strong><small>想再做一次的菜更有分量</small></div>
              <div><span class="formula-list__icon">${icon('message')}</span><strong>留言</strong><small>厨房里的交流同样被珍视</small></div>
            </div>
            <p class="hot-formula__foot">综合计算，不只看数字大小，也照顾新菜谱。</p>
          </div>
          <div class="hot-tags panel">
            <p class="eyebrow">TRENDING INGREDIENTS</p>
            <h3>上榜菜里的热门食材</h3>
            <div class="hot-tag-cloud">
              ${topTags
                .map(
                  ([tag, count]) =>
                    `<a href="#/recipes?tag=${encodeURIComponent(tag)}">${
                      TAG_EMOJI[tag] ? `<span aria-hidden="true">${TAG_EMOJI[tag]}</span>` : ''
                    }${escapeHtml(tag)}<small>${count}</small></a>`
                )
                .join('')}
            </div>
          </div>
          <div class="hot-aside__quote">
            <span>“</span>
            <p>榜单会变，认真吃饭这件事不会。</p>
            <a href="#/recipes">继续找灵感 ${icon('arrowRight')}</a>
          </div>
        </aside>
      </div>
    </section>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Recipe detail                                                      */
/* ------------------------------------------------------------------ */

async function renderRecipeDetailView(seq, route) {
  const id = decodeURIComponent(route.path.split('/')[2] || '');
  if (!id) {
    app.innerHTML = notFoundView();
    return;
  }
  const [detailData, relatedData] = await Promise.all([
    api(`/recipes/${encodeURIComponent(id)}`),
    api('/recipes?sort=hot&limit=5').catch(() => ({ items: [] }))
  ]);
  if (seq !== state.renderSeq) return;

  const recipe = detailData.recipe;
  const related = (relatedData.items || []).filter((item) => item.id !== recipe.id).slice(0, 3);
  const canModerate = Boolean(state.user && state.user.role === 'admin');
  document.title = `${recipe.title} · 食光记`;

  const statusBanner =
    recipe.status !== 'approved'
      ? `<div class="detail-status ${recipe.status === 'rejected' ? 'detail-status--danger' : ''}">
          <span class="detail-status__icon">${icon(recipe.status === 'rejected' ? 'alert' : 'clock')}</span>
          <div>
            <strong>${recipe.status === 'rejected' ? '这份菜谱没有通过审核' : '这份菜谱正在等待审核'}</strong>
            <p>${
              recipe.status === 'rejected'
                ? escapeHtml(
                    recipe.rejectReason || '可以按照管理员的建议修改后再次提交。'
                  )
                : '只有你和管理员可以看见它，审核通过后就会出现在社区里。'
            }</p>
          </div>
          <div class="detail-status__actions">
            <a class="btn btn--small btn--soft" href="#/publish?id=${encodeURIComponent(recipe.id)}">${icon('edit')} 修改菜谱</a>
            ${
              canModerate && recipe.status === 'pending'
                ? `<button class="btn btn--small btn--primary" type="button" data-action="review-open" data-id="${escapeHtml(
                    recipe.id
                  )}">去审核</button>`
                : ''
            }
          </div>
        </div>`
      : '';

  const comments = recipe.comments || [];
  const user = state.user;
  const commentForm = user
    ? `<form class="comment-form" id="comment-form" data-recipe-id="${escapeHtml(recipe.id)}">
        ${avatarMarkup(user, 'sm')}
        <div class="comment-form__field">
          <label class="visually-hidden" for="comment-content">写下你的厨房留言</label>
          <textarea id="comment-content" name="content" data-comment-input maxlength="400" placeholder="做过之后有什么想说的？或者问问作者…" required></textarea>
          <div class="comment-form__foot">
            <span><span data-comment-counter>0</span> / 400</span>
            <p class="form-error" data-form-error hidden></p>
            <button class="btn btn--primary btn--small" type="submit">发送留言 ${icon('send')}</button>
          </div>
        </div>
      </form>`
    : `<div class="login-prompt">
        <span>${icon('message')}</span>
        <div><strong>登录后，和作者聊两句</strong><p>留下你的做菜心得，也可以问问火候和小技巧。</p></div>
        <button class="btn btn--soft btn--small" type="button" data-action="open-auth">登录 / 注册</button>
      </div>`;

  app.innerHTML = `<div class="detail-page">
    <div class="container">
      <nav class="breadcrumb" aria-label="面包屑导航">
        <a href="#/">首页</a>${icon('chevronRight')}
        <a href="#/recipes">菜谱</a>${icon('chevronRight')}
        <a href="#/recipes?category=${encodeURIComponent(recipe.category)}">${escapeHtml(recipe.category)}</a>${icon(
          'chevronRight'
        )}
        <span>${escapeHtml(recipe.title)}</span>
      </nav>
      ${statusBanner}
      <article class="detail-hero">
        <button class="detail-cover" type="button" data-action="view-image" data-src="${escapeHtml(
          recipe.cover
        )}" data-alt="${escapeHtml(recipe.title)}" aria-label="查看大图">
          <img src="${escapeHtml(recipe.cover)}" alt="${escapeHtml(recipe.title)}" decoding="async" />
          <span class="detail-cover__zoom">${icon('search')} 查看大图</span>
        </button>
        <div class="detail-intro">
          <div class="detail-tags">
            <span class="category-label">${escapeHtml(recipe.category)}</span>
            ${recipe.tags
              .map(
                (tag) =>
                  `<a class="tag tag--link" href="#/recipes?tag=${encodeURIComponent(tag)}">${escapeHtml(
                    tag
                  )}</a>`
              )
              .join('')}
          </div>
          <h1>${escapeHtml(recipe.title)}</h1>
          <p class="detail-summary">${escapeHtml(recipe.summary)}</p>
          <div class="detail-author">
            ${avatarMarkup(recipe.author, 'md')}
            <div>
              <strong>${escapeHtml(recipe.author?.nickname || '厨友')}</strong>
              <span>${formatDate(recipe.createdAt)} 发布 · ${compactNumber(
                recipe.viewCount
              )} 次浏览</span>
            </div>
            ${recipe.isOwner ? '<span class="author-self">我的作品</span>' : ''}
          </div>
          <div class="detail-metrics">
            <div><span>${icon('clock')} 烹饪时间</span><strong>${recipe.time} <small>分钟</small></strong></div>
            <div><span>${icon('users')} 份量</span><strong>${recipe.servings} <small>人份</small></strong></div>
            <div><span>${icon('chefHat')} 难度</span><strong>${escapeHtml(recipe.difficulty)}</strong></div>
          </div>
          <div class="detail-actions">
            <button class="detail-action detail-action--like ${
              recipe.liked ? 'is-active' : ''
            }" type="button" data-action="toggle-like" data-id="${escapeHtml(recipe.id)}" aria-pressed="${
    recipe.liked
  }" aria-label="${recipe.liked ? '取消喜欢' : '喜欢这道菜谱'}">
              <span class="detail-action__icon">${icon('heart')}</span>
              <span class="detail-action__text"><strong data-like-count="${escapeHtml(
                recipe.id
              )}">${compactNumber(recipe.likeCount)}</strong><small>喜欢</small></span>
            </button>
            <button class="detail-action ${
              recipe.favorited ? 'is-active' : ''
            }" type="button" data-action="toggle-favorite" data-id="${escapeHtml(recipe.id)}" aria-pressed="${
    recipe.favorited
  }" aria-label="${recipe.favorited ? '取消收藏' : '收藏这道菜谱'}">
              <span class="detail-action__icon">${icon('bookmark')}</span>
              <span class="detail-action__text"><strong data-favorite-count="${escapeHtml(
                recipe.id
              )}">${compactNumber(recipe.favoriteCount)}</strong><small>收藏</small></span>
            </button>
            <button class="detail-action" type="button" data-action="scroll-comments" aria-label="前往留言区">
              <span class="detail-action__icon">${icon('message')}</span>
              <span class="detail-action__text"><strong data-comment-count="${escapeHtml(
                recipe.id
              )}">${comments.length}</strong><small>留言</small></span>
            </button>
            <button class="detail-action detail-action--share" type="button" data-action="copy-link" aria-label="分享这道菜谱">
              <span class="detail-action__icon">${icon('share')}</span>
              <span class="detail-action__text"><strong>分享</strong><small>给朋友</small></span>
            </button>
            ${
              recipe.isOwner
                ? `<a class="detail-action detail-action--edit" href="#/publish?id=${encodeURIComponent(
                    recipe.id
                  )}"><span class="detail-action__icon">${icon(
                    'edit'
                  )}</span><span class="detail-action__text"><strong>编辑</strong><small>我的菜谱</small></span></a>`
                : ''
            }
          </div>
        </div>
      </article>

      <div class="detail-body">
        <div class="detail-main">
          <section class="content-card steps-section">
            <div class="content-heading">
              <div><p class="eyebrow">STEP BY STEP</p><h2>烹饪步骤</h2></div>
              <span class="content-heading__meta">共 ${recipe.steps.length} 步</span>
            </div>
            <ol class="steps-list">
              ${recipe.steps
                .map(
                  (step, index) => `<li class="step-item ${step.image ? '' : 'step-item--no-image'}">
                    <div class="step-number">${String(index + 1).padStart(2, '0')}</div>
                    <div class="step-copy">
                      <span class="step-label">STEP ${String(index + 1).padStart(2, '0')}</span>
                      <p>${escapeHtml(step.text)}</p>
                    </div>
                    ${
                      step.image
                        ? `<button class="step-photo" type="button" data-action="view-image" data-src="${escapeHtml(
                            step.image
                          )}" data-alt="步骤 ${index + 1} 配图"><img src="${escapeHtml(
                            step.image
                          )}" alt="步骤 ${index + 1} 配图" loading="lazy" /></button>`
                        : ''
                    }
                  </li>`
                )
                .join('')}
            </ol>
          </section>

          ${
            recipe.tips
              ? `<section class="tips-card">
                  <span class="tips-card__icon">${icon('chefHat')}</span>
                  <div><p class="eyebrow">A NOTE FROM THE KITCHEN</p><h2>作者的小贴士</h2><p>${escapeHtml(
                    recipe.tips
                  )}</p></div>
                </section>`
              : ''
          }

          <section class="comments-section" id="comments">
            <div class="comments-head">
              <div><p class="eyebrow">AROUND THE TABLE</p><h2>厨房留言 <span data-comment-count="${escapeHtml(
                recipe.id
              )}">${comments.length}</span></h2></div>
              ${icon('message')}
            </div>
            ${commentForm}
            <ul class="comment-list">
              ${
                comments.length
                  ? comments.map((comment) => commentMarkup(comment, recipe.id, true)).join('')
                  : '<li class="comment-empty">还没有留言。来做第一个聊聊这道菜的人吧。</li>'
              }
            </ul>
          </section>
        </div>

        <aside class="detail-side">
          <section class="ingredients-card sticky-card">
            <div class="content-heading">
              <div><p class="eyebrow">INGREDIENTS</p><h2>食材清单</h2></div>
              <span class="content-heading__meta">${recipe.servings} 人份</span>
            </div>
            <ul class="ingredients-list">
              ${recipe.ingredients
                .map(
                  (item, index) => `<li><span class="ingredient-index">${String(index + 1).padStart(
                    2,
                    '0'
                  )}</span><span class="ingredient-name">${escapeHtml(
                    item.name
                  )}</span>${
                    item.amount
                      ? `<span class="ingredient-amount">${escapeHtml(item.amount)}</span>`
                      : ''
                  }</li>`
                )
                .join('')}
            </ul>
            <p class="ingredients-note">${icon(
              'leaf'
            )} 食材用量可以按手边的材料灵活调整，味道对了就好。</p>
          </section>

          <section class="author-card">
            <p class="eyebrow">THE COOK</p>
            <div class="author-card__person">
              ${avatarMarkup(recipe.author, 'lg')}
              <div><strong>${escapeHtml(recipe.author?.nickname || '厨友')}</strong><span>@${escapeHtml(
                recipe.author?.username || ''
              )}</span></div>
            </div>
            <p>${escapeHtml(recipe.author?.bio || '正在用美食记录生活。')}</p>
            <a class="text-link" href="#/recipes?author=${encodeURIComponent(
              recipe.author?.id || ''
            )}">Ta 的其他菜谱 ${icon('arrowRight')}</a>
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

      ${
        related.length
          ? `<section class="related-section">
              <div class="section-heading">
                <div><p class="eyebrow">MORE FROM THE KITCHEN</p><h2 class="section-title">你也许还想做</h2></div>
                <a class="text-link" href="#/recipes">更多菜谱 ${icon('arrowRight')}</a>
              </div>
              <div class="recipe-grid recipe-grid--three">${related
                .map((item) => recipeCard(item))
                .join('')}</div>
            </section>`
          : ''
      }
    </div>

    <div class="mobile-detail-bar">
      <button class="mobile-detail-bar__item ${recipe.liked ? 'is-active' : ''}" type="button" data-action="toggle-like" data-id="${escapeHtml(
        recipe.id
      )}" aria-label="喜欢">${icon('heart')}<span data-like-count="${escapeHtml(
    recipe.id
  )}">${compactNumber(recipe.likeCount)}</span></button>
      <button class="mobile-detail-bar__item ${
        recipe.favorited ? 'is-active' : ''
      }" type="button" data-action="toggle-favorite" data-id="${escapeHtml(
    recipe.id
  )}" aria-label="收藏">${icon('bookmark')}<span data-favorite-count="${escapeHtml(
    recipe.id
  )}">${compactNumber(recipe.favoriteCount)}</span></button>
      <button class="mobile-detail-bar__item" type="button" data-action="scroll-comments" aria-label="留言">${icon(
        'message'
      )}<span>${comments.length}</span></button>
      <button class="mobile-detail-bar__cta" type="button" data-action="focus-comment">写下留言</button>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Publish / edit                                                     */
/* ------------------------------------------------------------------ */

function ingredientRowMarkup(item = {}) {
  return `<div class="ingredient-row" data-ingredient-row>
    <input class="input ingredient-name" placeholder="食材名称，如 番茄" value="${escapeHtml(
      item.name || ''
    )}" aria-label="食材名称" />
    <input class="input ingredient-amount" placeholder="用量（选填），如 2 个" value="${escapeHtml(
      item.amount || ''
    )}" aria-label="食材用量（选填）" />
    <button class="icon-button icon-button--subtle" type="button" data-action="remove-ingredient" aria-label="移除这项食材">${icon(
      'minus'
    )}</button>
  </div>`;
}

function stepEditorMarkup(step = {}) {
  return `<div class="step-editor">
    <div class="step-editor__head">
      <span class="step-editor__number">01</span>
      <div class="step-editor__label"><strong>一个步骤</strong><small>写清火候、时间和小细节</small></div>
      <button class="icon-button icon-button--subtle" type="button" data-action="remove-step" aria-label="移除这个步骤">${icon(
        'minus'
      )}</button>
    </div>
    <div class="step-editor__grid">
      <textarea class="textarea step-text" rows="4" maxlength="500" placeholder="例如：番茄切块，中火炒至软烂出沙…">${escapeHtml(
        step.text || ''
      )}</textarea>
      <label class="step-upload ${step.image ? 'has-image' : ''}">
        <input class="visually-hidden" type="file" data-upload="step" accept="image/jpeg,image/png,image/webp,image/gif" />
        <img class="step-preview" ${step.image ? `src="${escapeHtml(step.image)}"` : ''} alt="步骤配图预览" />
        <span class="step-upload__empty">${icon('camera')}<strong>添加步骤图（选填）</strong><small>整份菜谱至少一张 · 最大 8MB</small></span>
        <span class="step-upload__change">${icon('image')} 更换配图</span>
        <span class="step-upload__loading"><span class="mini-spinner"></span>上传中…</span>
      </label>
      <input class="step-image" type="hidden" value="${escapeHtml(step.image || '')}" />
    </div>
  </div>`;
}

async function renderPublishView(seq, route) {
  if (!state.user) {
    app.innerHTML = authGateView({
      eyebrow: 'SHARE YOUR TABLE',
      title: '先把你的厨房打开吧',
      message: '登录之后，就可以写下菜谱、上传步骤图，把自己的拿手味道分享给更多人。'
    });
    return;
  }

  const editId = route.params.get('id') || '';
  let recipe = null;
  if (editId) {
    const data = await api(`/recipes/${encodeURIComponent(editId)}`);
    recipe = data.recipe;
    if (seq !== state.renderSeq) return;
    if (recipe.author?.id !== state.user.id && state.user.role !== 'admin') {
      app.innerHTML = errorView({
        status: 403,
        message: '只能编辑自己的菜谱'
      });
      return;
    }
  }

  const tags = new Set(recipe?.tags || []);
  const ingredients =
    recipe?.ingredients?.length ? recipe.ingredients : [{ name: '', amount: '' }, { name: '', amount: '' }, { name: '', amount: '' }];
  const steps = recipe?.steps?.length ? recipe.steps : [{}, {}, {}];
  const isAdminEdit = recipe && state.user.role === 'admin';
  const submitLabel = recipe
    ? isAdminEdit
      ? '保存修改'
      : '保存修改并重新提交'
    : '提交审核';

  const metaTags = new Set(state.meta.tagGroups.flatMap((group) => group.tags));
  const customTags = [...tags].filter((tag) => !metaTags.has(tag));
  const tagChoice = (tag) => `<label class="tag-choice">
      <input type="checkbox" name="tags" value="${escapeHtml(tag)}" ${
    tags.has(tag) ? 'checked' : ''
  } />
      <span>${TAG_EMOJI[tag] ? `<i aria-hidden="true">${TAG_EMOJI[tag]}</i>` : ''}${escapeHtml(
    tag
  )}</span>
    </label>`;
  const tagGroups =
    state.meta.tagGroups
      .map(
        (group) => `<div class="tag-picker__group" data-tag-group="${escapeHtml(group.name)}">
        <span class="tag-picker__label">${escapeHtml(group.name)}</span>
        <div class="tag-picker__choices">
          ${group.tags.map((tag) => tagChoice(tag)).join('')}
          ${group.name === '食材' ? customTags.map((tag) => tagChoice(tag)).join('') : ''}
        </div>
      </div>`
      )
      .join('') +
    `<div class="tag-picker__custom">
      <span class="tag-picker__label">自定义</span>
      <div class="tag-picker__custom-row">
        <input class="input" id="custom-tag-input" type="text" maxlength="12" placeholder="没找到？输入食材名，如 空心菜" data-custom-tag-input aria-label="自定义食材标签" />
        <button class="btn btn--soft btn--small" type="button" data-action="add-custom-tag">添加</button>
      </div>
    </div>`;

  app.innerHTML = `<div class="publish-page">
    <section class="publish-masthead">
      <div class="container publish-masthead__inner">
        <div>
          <p class="eyebrow">${recipe ? 'EDIT YOUR RECIPE' : 'SHARE YOUR TABLE'}</p>
          <h1>${recipe ? '把这道菜，<em>再写好一点。</em>' : '写下一道，<em>属于你的味道。</em>'}</h1>
          <p>${
            recipe
              ? '修改后会重新进入审核，审核通过后会替换原来的公开版本。'
              : '不用是专业厨师。把你觉得好吃的做法认真写下来，就足够动人。'
          }</p>
        </div>
        <span class="publish-masthead__seal">${recipe ? '再<br />写' : '写<br />下'}</span>
      </div>
    </section>

    <div class="container publish-layout">
      <form class="publish-form" id="publish-form" data-edit-id="${escapeHtml(editId)}" novalidate>
        ${
          recipe?.status === 'rejected'
            ? `<div class="edit-notice edit-notice--danger">
                <span>${icon('alert')}</span>
                <div><strong>上次审核未通过</strong><p>${escapeHtml(
                  recipe.rejectReason || '请检查内容和配图后重新提交。'
                )}</p></div>
              </div>`
            : ''
        }
        ${
          recipe?.status === 'pending'
            ? `<div class="edit-notice"><span>${icon('clock')}</span><div><strong>当前正在审核中</strong><p>你仍然可以继续修改，提交后会以最新版本重新进入审核。</p></div></div>`
            : ''
        }

        <section class="form-card">
          <div class="form-card__head">
            <span class="form-section-number">01</span>
            <div><h2>先给这道菜一个名字</h2><p>标题和简介，是别人认识它的第一眼。</p></div>
          </div>
          <div class="field">
            <label class="field-label" for="recipe-title">菜谱标题 <span class="required">*</span></label>
            <input class="input input--large" id="recipe-title" name="title" maxlength="40" placeholder="例如：番茄罗勒蝴蝶面" value="${escapeHtml(
              recipe?.title || ''
            )}" required />
          </div>
          <div class="field">
            <label class="field-label" for="recipe-summary">一句话简介 <span class="required">*</span></label>
            <input class="input" id="recipe-summary" name="summary" maxlength="200" placeholder="它为什么值得被做一次？" value="${escapeHtml(
              recipe?.summary || ''
            )}" required />
          </div>

          <div class="field">
            <span class="field-label">封面图 <span class="required">*</span></span>
            <label class="cover-upload ${recipe?.cover ? 'has-image' : ''}">
              <input class="visually-hidden" type="file" data-upload="cover" accept="image/jpeg,image/png,image/webp,image/gif" />
              <img class="cover-preview" ${recipe?.cover ? `src="${escapeHtml(recipe.cover)}"` : ''} alt="菜谱封面预览" />
              <span class="cover-upload__empty">${icon('camera')}<strong>上传一张让人想吃的封面</strong><small>建议横图 · JPG / PNG / WebP · 最大 8MB</small></span>
              <span class="cover-upload__change">${icon('image')} 点击更换封面</span>
              <span class="cover-upload__loading"><span class="mini-spinner"></span>正在上传封面…</span>
            </label>
            <input class="cover-url" type="hidden" name="cover" value="${escapeHtml(
              recipe?.cover || ''
            )}" />
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
                <select class="select" id="recipe-category" name="category" required>
                  <option value="">选择分类</option>
                  ${state.meta.categories
                    .map(
                      (category) =>
                        `<option value="${escapeHtml(category)}" ${
                          recipe?.category === category ? 'selected' : ''
                        }>${escapeHtml(category)}</option>`
                    )
                    .join('')}
                </select>
                ${icon('chevronDown')}
              </div>
            </div>
            <div class="field">
              <label class="field-label" for="recipe-time">烹饪时间（分钟）</label>
              <input class="input" id="recipe-time" name="time" type="number" min="5" max="600" value="${
                recipe?.time || 30
              }" required />
            </div>
            <div class="field">
              <label class="field-label" for="recipe-servings">份量（人）</label>
              <input class="input" id="recipe-servings" name="servings" type="number" min="1" max="20" value="${
                recipe?.servings || 2
              }" required />
            </div>
          </div>
          <div class="field">
            <span class="field-label">难度</span>
            <div class="segmented">
              ${state.meta.difficulties
                .map(
                  (difficulty) => `<label class="segmented__item">
                    <input type="radio" name="difficulty" value="${escapeHtml(difficulty)}" ${
                    (recipe?.difficulty || '简单') === difficulty ? 'checked' : ''
                  } />
                    <span>${escapeHtml(difficulty)}</span>
                  </label>`
                )
                .join('')}
            </div>
          </div>
          <div class="field">
            <div class="field-label-row">
              <span class="field-label">食材与风味标签 <span class="required">*</span></span>
              <span class="field-counter" data-tag-count>0 / 6</span>
            </div>
            <div class="tag-picker">${tagGroups}</div>
            <span class="field-help">选择能帮助别人找到这道菜的标签，最多 6 个。</span>
          </div>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <span class="form-section-number">03</span>
            <div><h2>列好食材清单</h2><p>按需准备，用量可以留空，不多买也不漏掉。</p></div>
          </div>
          <div class="ingredient-editor">
            ${ingredients.map((item) => ingredientRowMarkup(item)).join('')}
          </div>
          <button class="add-row-button" type="button" data-action="add-ingredient">${icon(
            'plus'
          )} 再加一项食材</button>
          <span class="field-help">用量可以不填，只写食材名称也可以，页面只显示名称。</span>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <span class="form-section-number">04</span>
            <div><h2>一步一步写下来</h2><p>每个步骤的配图都是选填的，整份菜谱有一张关键图就够。</p></div>
          </div>
          <div class="step-editor-list">
            ${steps.map((step) => stepEditorMarkup(step)).join('')}
          </div>
          <button class="add-row-button" type="button" data-action="add-step">${icon(
            'plus'
          )} 再加一个步骤</button>
          <span class="field-help">每个步骤不必都配图，整份菜谱有一张关键步骤图即可。</span>
        </section>

        <section class="form-card">
          <div class="form-card__head">
            <span class="form-section-number">05</span>
            <div><h2>最后，说一点小技巧</h2><p>那些“更容易成功”的秘密，值得分享。</p></div>
          </div>
          <div class="field">
            <label class="field-label" for="recipe-tips">作者小贴士</label>
            <textarea class="textarea" id="recipe-tips" name="tips" rows="4" maxlength="300" placeholder="例如：番茄一定要选熟透的，炒到软烂出沙，酱汁才会自然清甜。">${escapeHtml(
              recipe?.tips || ''
            )}</textarea>
            <span class="field-help">可以写下替代食材、保存方式或者容易失败的地方。</span>
          </div>
        </section>

        <div class="publish-submit-bar">
          <p class="form-error" data-form-error hidden></p>
          <div class="publish-submit-bar__row">
            <a class="btn btn--soft" href="${recipe ? `#/recipe/${encodeURIComponent(recipe.id)}` : '#/'}">取消</a>
            <button class="btn btn--primary publish-submit" type="submit">${escapeHtml(
              submitLabel
            )} ${icon('arrowRight')}</button>
          </div>
          <p class="publish-submit-bar__note">${icon(
            'shield'
          )} 提交后由管理员审核，通常在 24 小时内完成。</p>
        </div>
      </form>

      <aside class="publish-aside">
        <div class="aside-card checklist-card">
          <div class="aside-card__head"><p class="eyebrow">BEFORE YOU SEND</p><h3>发布检查</h3><span data-checklist-percent>0%</span></div>
          <div class="checklist-meter" data-checklist-meter style="--progress:0%"><span></span></div>
          <ul class="checklist">
            <li data-check="basics">${icon('check')} 标题与简介已写好</li>
            <li data-check="cover">${icon('check')} 有一张好看的封面</li>
            <li data-check="ingredients">${icon('check')} 至少 3 种食材</li>
            <li data-check="steps">${icon('check')} 至少 2 步，配图至少 1 张</li>
            <li data-check="tags">${icon('check')} 已选择分类标签</li>
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
          <span>${icon('leaf')}</span>
          <h3>一点点小建议</h3>
          <p>步骤不必写得像说明书。把你真正做过、觉得有用的细节写下来，就是一份好菜谱。</p>
        </div>
      </aside>
    </div>
  </div>`;

  const form = document.getElementById('publish-form');
  if (form) {
    updateTagLimit(form);
    updatePublishChecklist();
  }
}

function addIngredientRow() {
  const editor = document.querySelector('.ingredient-editor');
  if (!editor) return;
  editor.insertAdjacentHTML('beforeend', ingredientRowMarkup());
  editor.lastElementChild?.querySelector('.ingredient-name')?.focus();
  updatePublishChecklist();
}

function addStepEditor() {
  const list = document.querySelector('.step-editor-list');
  if (!list) return;
  list.insertAdjacentHTML('beforeend', stepEditorMarkup());
  syncStepNumbers(list);
  list.lastElementChild?.querySelector('.step-text')?.focus();
  updatePublishChecklist();
}

/* ------------------------------------------------------------------ */
/* Profile / my kitchen                                               */
/* ------------------------------------------------------------------ */

function profileWorkCard(item) {
  const statusLabel =
    item.status === 'approved' ? '已发布' : item.status === 'pending' ? '审核中' : '未通过';
  return `<article class="work-card work-card--${escapeHtml(item.status)}">
    <a class="work-card__cover" href="#/recipe/${encodeURIComponent(item.id)}">
      <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy" />
      <span class="status-pill status-pill--${escapeHtml(item.status)}">${escapeHtml(
        statusLabel
      )}</span>
    </a>
    <div class="work-card__body">
      <p class="work-card__meta">${escapeHtml(item.category)} · ${formatDate(item.createdAt)}</p>
      <h3><a href="#/recipe/${encodeURIComponent(item.id)}">${escapeHtml(item.title)}</a></h3>
      <p class="work-card__summary">${escapeHtml(item.summary)}</p>
      ${
        item.status === 'rejected'
          ? `<div class="work-card__reject">
              <strong>${icon('alert')} 审核建议</strong>
              <p>${escapeHtml(item.rejectReason || '请完善内容后重新提交。')}</p>
            </div>`
          : ''
      }
      <div class="work-card__metrics">
        <span>${icon('heart')} ${compactNumber(item.likeCount)}</span>
        <span>${icon('bookmark')} ${compactNumber(item.favoriteCount)}</span>
        <span>${icon('message')} ${compactNumber(item.commentCount)}</span>
        <span>${icon('eye')} ${compactNumber(item.viewCount)}</span>
      </div>
      <div class="work-card__actions">
        <a class="text-link" href="#/recipe/${encodeURIComponent(item.id)}">查看</a>
        <a class="text-link" href="#/publish?id=${encodeURIComponent(item.id)}">${icon(
          'edit'
        )} 编辑</a>
        <button class="text-link text-link--danger" type="button" data-action="delete-recipe" data-id="${escapeHtml(
          item.id
        )}" data-title="${escapeHtml(item.title)}">${icon('trash')} 删除</button>
      </div>
    </div>
  </article>`;
}

async function renderProfileView(seq, route) {
  if (!state.user) {
    app.innerHTML = authGateView({
      eyebrow: 'MY KITCHEN',
      title: '登录，回到你的厨房',
      message: '你的作品、收藏和赞过的菜谱，都在这里等你回来。'
    });
    return;
  }

  let works;
  let favorites;
  let likes;
  try {
    [works, favorites, likes] = await Promise.all([
      api('/me/recipes'),
      api('/me/favorites'),
      api('/me/likes')
    ]);
  } catch (error) {
    if (seq !== state.renderSeq) return;
    if (!state.user) {
      app.innerHTML = authGateView({
        eyebrow: 'MY KITCHEN',
        title: '登录，回到你的厨房',
        message: '你的作品、收藏和赞过的菜谱，都在这里等你回来。'
      });
      return;
    }
    throw error;
  }
  if (seq !== state.renderSeq) return;

  const user = state.user;
  const activeTab = ['works', 'favorites', 'likes'].includes(route.params.get('tab'))
    ? route.params.get('tab')
    : 'works';
  const statusFilter = ['approved', 'pending', 'rejected'].includes(route.params.get('status'))
    ? route.params.get('status')
    : 'all';
  const counts = {
    works: works.items.length,
    favorites: favorites.items.length,
    likes: likes.items.length
  };
  const filteredWorks =
    statusFilter === 'all'
      ? works.items
      : works.items.filter((item) => item.status === statusFilter);

  const tabLink = (tab) => `#/me?tab=${tab}`;
  const tab = (key, label) =>
    `<a class="profile-tab ${activeTab === key ? 'is-active' : ''}" href="${tabLink(key)}">${label}<span>${
      counts[key]
    }</span></a>`;

  const statusOptions = [
    { key: 'all', label: '全部', count: works.stats.total },
    { key: 'approved', label: '已发布', count: works.stats.approved },
    { key: 'pending', label: '审核中', count: works.stats.pending },
    { key: 'rejected', label: '未通过', count: works.stats.rejected }
  ];

  let tabContent = '';
  if (activeTab === 'works') {
    tabContent = `<div class="works-filter" role="group" aria-label="筛选作品状态">
        ${statusOptions
          .map(
            (option) => `<a class="works-filter__item ${
              statusFilter === option.key ? 'is-active' : ''
            }" href="#/me?tab=works${option.key === 'all' ? '' : `&status=${option.key}`}">${option.label}<span>${
              option.count
            }</span></a>`
          )
          .join('')}
      </div>
      ${
        filteredWorks.length
          ? `<div class="work-list">${filteredWorks.map(profileWorkCard).join('')}</div>`
          : `<div class="profile-empty">
              <span class="profile-empty__mark">${icon('chefHat')}</span>
              <h3>${
                works.items.length
                  ? '这个状态下还没有作品'
                  : '你的第一道菜，还在等你写下来'
              }</h3>
              <p>${
                works.items.length
                  ? '换一个状态看看，或者去发布新的味道。'
                  : '从一道常做的家常菜开始，把步骤和照片记下来，它会成为别人厨房里的灵感。'
              }</p>
              <a class="btn btn--primary" href="#/publish">发布菜谱 ${icon('arrowRight')}</a>
            </div>`
      }`;
  } else if (activeTab === 'favorites') {
    tabContent = favorites.items.length
      ? `<div class="recipe-grid recipe-grid--three">${favorites.items
          .map((item) => recipeCard(item))
          .join('')}</div>`
      : `<div class="profile-empty">
          <span class="profile-empty__mark">${icon('bookmark')}</span>
          <h3>收藏夹还空着</h3>
          <p>遇到想做的菜谱时，点一下收藏。它们会在这里安静等你。</p>
          <a class="btn btn--primary" href="#/recipes">去发现菜谱 ${icon('arrowRight')}</a>
        </div>`;
  } else {
    tabContent = likes.items.length
      ? `<div class="recipe-grid recipe-grid--three">${likes.items
          .map((item) => recipeCard(item))
          .join('')}</div>`
      : `<div class="profile-empty">
          <span class="profile-empty__mark">${icon('heart')}</span>
          <h3>还没有赞过菜谱</h3>
          <p>给认真记录的美食一点鼓励，喜欢的味道会留在这里。</p>
          <a class="btn btn--primary" href="#/hot">看看热门排行 ${icon('arrowRight')}</a>
        </div>`;
  }

  app.innerHTML = `<div class="profile-page">
    <section class="profile-hero">
      <div class="container">
        <div class="profile-hero__top">
          <div class="profile-identity">
            <span class="profile-avatar">${avatarMarkup(user, 'xl')}<i aria-hidden="true"></i></span>
            <div class="profile-identity__copy">
              <p class="eyebrow">MY KITCHEN · SINCE ${escapeHtml(
                String(new Date(user.createdAt).getFullYear())
              )}</p>
              <h1>${escapeHtml(user.nickname)}${
                user.role === 'admin' ? '<span class="role-badge">管理员</span>' : ''
              }</h1>
              <p class="profile-handle">@${escapeHtml(user.username)}</p>
              <p class="profile-bio">${escapeHtml(user.bio || '正在用美食记录生活。')}</p>
            </div>
          </div>
          <div class="profile-actions">
            <a class="btn btn--primary" href="#/publish">${icon('plus')} 发布新菜谱</a>
            ${
              user.role === 'admin'
                ? `<a class="btn btn--soft" href="#/admin">${icon('chart')} 后台管理</a>`
                : ''
            }
            <button class="btn btn--ghost" type="button" data-action="logout">${icon(
              'logout'
            )} 退出登录</button>
          </div>
        </div>

        <div class="profile-stats">
          <div class="profile-stat"><strong>${formatNumber(
            works.stats.total
          )}</strong><span>发布作品</span></div>
          <div class="profile-stat"><strong>${compactNumber(
            works.stats.likesReceived
          )}</strong><span>收到的喜欢</span></div>
          <div class="profile-stat"><strong>${compactNumber(
            works.stats.favoritesReceived
          )}</strong><span>被收藏</span></div>
          <div class="profile-stat"><strong>${compactNumber(
            works.stats.viewsReceived
          )}</strong><span>作品浏览</span></div>
          <span class="profile-stamp" aria-hidden="true">好好<br />吃饭</span>
        </div>
      </div>
    </section>

    <div class="container profile-body">
      <nav class="profile-tabs" aria-label="个人中心内容">
        ${tab('works', '我的作品')}
        ${tab('favorites', '我的收藏')}
        ${tab('likes', '赞过的')}
      </nav>
      <div class="profile-content">${tabContent}</div>

      ${
        user.role === 'admin'
          ? `<div class="admin-hint">
              <span>${icon('shield')}</span>
              <div><strong>你也是社区管理员</strong><p>待审核的菜谱、社区数据和作品管理都在后台。</p></div>
              <a class="btn btn--soft btn--small" href="#/admin/review">去审核${icon('arrowRight')}</a>
            </div>`
          : ''
      }
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Admin · shared shell                                               */
/* ------------------------------------------------------------------ */

function adminAccessGate() {
  app.innerHTML = authGateView({
    eyebrow: 'SHIGUANG CONSOLE',
    title: state.user ? '这里需要管理员权限' : '登录，进入厨房后台',
    message: state.user
      ? '当前账号没有后台权限。可以回到个人中心继续记录你的菜谱。'
      : '审核菜谱、查看社区数据，都在管理员的后台里。'
  });
}

function adminShell(active, content, pendingCount = 0) {
  const user = state.user;
  const navItems = [
    {
      key: 'overview',
      href: '#/admin',
      label: '数据概览',
      note: '社区今天的样子',
      icon: 'chart'
    },
    {
      key: 'review',
      href: '#/admin/review',
      label: '菜谱审核',
      note: '等待端上桌的味道',
      icon: 'shield',
      badge: pendingCount
    },
    {
      key: 'recipes',
      href: '#/admin/recipes',
      label: '全部菜谱',
      note: '浏览与管理作品',
      icon: 'book'
    }
  ];

  return `<div class="admin-page">
    <section class="admin-hero">
      <div class="container admin-hero__inner">
        <div class="admin-hero__copy">
          <p class="eyebrow">SHIGUANG KITCHEN · CONSOLE</p>
          <h1>厨房后台</h1>
          <p>照看好每一份认真写下的菜谱，也照看这个认真吃饭的小社区。</p>
        </div>
        <div class="admin-hero__side">
          <div class="admin-signed">
            ${avatarMarkup(user, 'sm')}
            <div><span>当前管理员</span><strong>${escapeHtml(user?.nickname || '')}</strong></div>
          </div>
          <span class="admin-hero__date">${new Intl.DateTimeFormat('zh-CN', {
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          }).format(new Date())}</span>
        </div>
      </div>
    </section>

    <div class="container admin-layout">
      <aside class="admin-sidebar">
        <nav class="admin-nav" aria-label="后台导航">
          ${navItems
            .map(
              (item) => `<a class="admin-nav__item ${
                active === item.key ? 'is-active' : ''
              }" href="${item.href}">
                <span class="admin-nav__icon">${icon(item.icon)}</span>
                <span class="admin-nav__copy"><strong>${item.label}</strong><small>${item.note}</small></span>
                ${
                  item.badge
                    ? `<span class="admin-nav__badge">${item.badge > 99 ? '99+' : item.badge}</span>`
                    : ''
                }
              </a>`
            )
            .join('')}
        </nav>
        <div class="admin-sidebar__foot">
          <span class="admin-sidebar__mark">食</span>
          <p>“把每一顿饭，<br />都当成值得记录的一天。”</p>
          <a class="text-link" href="#/">返回社区 ${icon('arrowRight')}</a>
        </div>
      </aside>
      <section class="admin-content">${content}</section>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Admin · dashboard                                                  */
/* ------------------------------------------------------------------ */

function activityChartMarkup(daily) {
  const width = 720;
  const height = 264;
  const left = 42;
  const right = 18;
  const top = 28;
  const bottom = 40;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const baseline = height - bottom;
  const maxRaw = Math.max(1, ...daily.map((day) => day.recipes));
  const niceMax =
    maxRaw <= 4
      ? 4
      : maxRaw <= 10
      ? Math.ceil(maxRaw / 2) * 2
      : Math.ceil(maxRaw / 5) * 5;
  const ticks = [0, niceMax / 2, niceMax];
  const band = plotW / daily.length;
  const barW = 22;
  const latestIndex = daily.length - 1;
  const total = daily.reduce((sum, day) => sum + day.recipes, 0);

  const bars = daily
    .map((day, index) => {
      const x = left + band * index + (band - barW) / 2;
      const value = day.recipes;
      const h = value > 0 ? Math.max(4, (value / niceMax) * plotH) : 0;
      const y = baseline - h;
      const radius = Math.min(4, h);
      const path =
        h > 0
          ? `M${x} ${baseline} L${x} ${y + radius} Q${x} ${y} ${x + radius} ${y} L${
              x + barW - radius
            } ${y} Q${x + barW} ${y} ${x + barW} ${y + radius} L${x + barW} ${baseline} Z`
          : '';
      const label = escapeHtml(day.label);
      const tipSub = `${day.comments} 条留言 · ${day.users} 位新厨友`;
      return `<g class="chart-bar-group" data-chart-tip data-tip-title="${label}" data-tip-value="${
        value
      } 道菜谱" data-tip-sub="${escapeHtml(tipSub)}" tabindex="0" aria-label="${label}，新增 ${value} 道菜谱，${escapeHtml(
        tipSub
      )}">
        <rect class="chart-hit" x="${left + band * index}" y="${top}" width="${band}" height="${plotH}" rx="6" />
        ${path ? `<path class="chart-bar" d="${path}" />` : ''}
        ${
          index === latestIndex && value > 0
            ? `<text class="chart-direct-label" x="${x + barW / 2}" y="${y - 9}" text-anchor="middle">${value}</text>`
            : ''
        }
      </g>`;
    })
    .join('');

  return `<div class="chart-wrap">
    <div class="chart-tooltip" data-chart-tooltip hidden>
      <span class="chart-tooltip__title"></span>
      <strong class="chart-tooltip__value"></strong>
      <span class="chart-tooltip__sub"></span>
    </div>
    <svg class="activity-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="近 7 日新增菜谱，共 ${total} 道">
      <title>近 7 日新增菜谱</title>
      ${ticks
        .map((tick) => {
          const y = baseline - (tick / niceMax) * plotH;
          return `<line class="chart-gridline ${
            tick === 0 ? 'chart-gridline--base' : ''
          }" x1="${left}" x2="${width - right}" y1="${y}" y2="${y}" />
            <text class="chart-axis-label" x="${left - 12}" y="${y + 4}" text-anchor="end">${tick}</text>`;
        })
        .join('')}
      ${bars}
      ${daily
        .map(
          (day, index) =>
            `<text class="chart-x-label ${
              index === latestIndex ? 'chart-x-label--latest' : ''
            }" x="${left + band * index + band / 2}" y="${
              baseline + 23
            }" text-anchor="middle">${escapeHtml(day.label)}</text>`
        )
        .join('')}
    </svg>
    <div class="chart-caption">
      <span>单位：道 / 日</span>
      <span>近 7 日共新增 <strong>${total}</strong> 道菜谱</span>
    </div>
  </div>
  <details class="chart-table">
    <summary>查看数据表</summary>
    <div class="table-scroll">
      <table>
        <thead><tr><th scope="col">日期</th><th scope="col">新增菜谱</th><th scope="col">新增留言</th><th scope="col">新厨友</th></tr></thead>
        <tbody>
          ${daily
            .map(
              (day) =>
                `<tr><td>${escapeHtml(day.label)}</td><td>${day.recipes}</td><td>${
                  day.comments
                }</td><td>${day.users}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </details>`;
}

function categoryBarsMarkup(categories) {
  if (!categories.length) {
    return '<p class="admin-empty-inline">还没有已发布的菜谱。</p>';
  }
  const max = Math.max(...categories.map((item) => item.count), 1);
  return `<div class="category-bars">
    ${categories
      .map(
        (item) => `<div class="bar-row">
          <div class="bar-row__meta"><span>${escapeHtml(item.name)}</span><strong>${item.count}</strong></div>
          <div class="bar-track"><span style="width:${Math.max(
            6,
            Math.round((item.count / max) * 100)
          )}%"></span></div>
        </div>`
      )
      .join('')}
  </div>`;
}

async function renderAdminOverview(seq) {
  if (!state.user || state.user.role !== 'admin') {
    adminAccessGate();
    return;
  }
  const data = await api('/admin/stats');
  if (seq !== state.renderSeq) return;
  document.title = '数据概览 · 食光记后台';

  const { totals, last7, daily, categories, topRecipes, recentPending } = data;
  const content = `<div class="admin-view">
    <header class="admin-view__head">
      <div>
        <p class="eyebrow">OVERVIEW</p>
        <h1>今天的厨房</h1>
        <p>社区里的每一次开火、留言和收藏，都在这里留下小小的回声。</p>
      </div>
      <span class="admin-view__stamp">数据截至 ${formatDateTime(data.generatedAt)}</span>
    </header>

    <div class="admin-kpis">
      <div class="stat-tile">
        <div class="stat-tile__top"><span>已发布菜谱</span><i>${icon('book')}</i></div>
        <strong class="stat-tile__value">${formatNumber(totals.recipes)}</strong>
        <div class="stat-tile__foot"><span class="delta">近 7 日 +${last7.recipes}</span><span>道新菜谱</span></div>
      </div>
      <a class="stat-tile stat-tile--alert" href="#/admin/review">
        <div class="stat-tile__top"><span>待审核</span><i>${icon('clock')}</i></div>
        <strong class="stat-tile__value">${formatNumber(totals.pending)}</strong>
        <div class="stat-tile__foot"><span>${totals.rejected} 份未通过</span><span>去处理 ${icon('arrowRight')}</span></div>
      </a>
      <div class="stat-tile">
        <div class="stat-tile__top"><span>注册厨友</span><i>${icon('users')}</i></div>
        <strong class="stat-tile__value">${formatNumber(totals.users)}</strong>
        <div class="stat-tile__foot"><span class="delta">近 7 日 +${last7.users}</span><span>位新厨友</span></div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile__top"><span>社区互动</span><i>${icon('heart')}</i></div>
        <strong class="stat-tile__value">${compactNumber(totals.interactions)}</strong>
        <div class="stat-tile__foot"><span>${compactNumber(totals.likes)} 喜欢</span><span>${compactNumber(
    totals.favorites
  )} 收藏 · ${compactNumber(totals.comments)} 留言</span></div>
      </div>
    </div>

    <div class="admin-meta-strip">
      <div><span>审核通过率</span><strong>${totals.reviewRate}%</strong></div>
      <div><span>菜谱总浏览</span><strong>${compactNumber(totals.views)}</strong></div>
      <div><span>近 7 日留言</span><strong>${last7.comments}</strong></div>
      <div><span>全部投稿</span><strong>${totals.allRecipes}</strong></div>
    </div>

    <div class="dashboard-grid">
      <section class="panel panel--chart">
        <div class="panel__head">
          <div><p class="eyebrow">LAST 7 DAYS</p><h2>每天，都有新菜端上桌</h2></div>
          <span class="panel__meta">近 7 日新增菜谱</span>
        </div>
        ${activityChartMarkup(daily)}
      </section>

      <section class="panel">
        <div class="panel__head">
          <div><p class="eyebrow">BY CATEGORY</p><h2>大家爱做什么</h2></div>
          <span class="panel__meta">已发布</span>
        </div>
        ${categoryBarsMarkup(categories)}
        <div class="panel__note">${icon('info')} 分类分布帮助了解社区内容的重心。</div>
      </section>
    </div>

    <div class="dashboard-grid dashboard-grid--lower">
      <section class="panel">
        <div class="panel__head">
          <div><p class="eyebrow">IN THE QUEUE</p><h2>等你翻阅的菜谱</h2></div>
          <a class="text-link" href="#/admin/review">全部待审 ${icon('arrowRight')}</a>
        </div>
        ${
          recentPending.length
            ? `<div class="pending-mini-list">
                ${recentPending
                  .map(
                    (item) => `<div class="pending-mini">
                      <img src="${escapeHtml(item.cover)}" alt="" loading="lazy" />
                      <div class="pending-mini__copy">
                        <strong>${escapeHtml(item.title)}</strong>
                        <span>@${escapeHtml(item.author?.nickname || '厨友')} · ${formatRelative(
                          item.createdAt
                        )}</span>
                      </div>
                      <button class="btn btn--tiny btn--soft" type="button" data-action="review-open" data-id="${escapeHtml(
                        item.id
                      )}">审核</button>
                    </div>`
                  )
                  .join('')}
              </div>`
            : `<div class="admin-empty">
                <span>${icon('check')}</span>
                <div><strong>审核队列已经清空</strong><p>所有菜谱都处理好了，喝杯茶吧。</p></div>
              </div>`
        }
      </section>

      <section class="panel">
        <div class="panel__head">
          <div><p class="eyebrow">TRENDING</p><h2>最近的热门菜谱</h2></div>
          <a class="text-link" href="#/hot">热门排行 ${icon('arrowRight')}</a>
        </div>
        <ol class="admin-top-list">
          ${topRecipes
            .map(
              (item, index) => `<li>
                <span class="admin-top-list__rank">${String(index + 1).padStart(2, '0')}</span>
                <img src="${escapeHtml(item.cover)}" alt="" loading="lazy" />
                <div><strong>${escapeHtml(item.title)}</strong><span>${icon('heart')} ${compactNumber(
                  item.likeCount
                )} · ${icon('bookmark')} ${compactNumber(item.favoriteCount)}</span></div>
              </li>`
            )
            .join('')}
        </ol>
      </section>
    </div>
  </div>`;

  app.innerHTML = adminShell('overview', content, totals.pending);
  wireChartTooltips();
}

/* ------------------------------------------------------------------ */
/* Admin · review queue                                               */
/* ------------------------------------------------------------------ */

async function renderAdminReview(seq, route) {
  if (!state.user || state.user.role !== 'admin') {
    adminAccessGate();
    return;
  }
  const query = route.params.get('q') || '';
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  const data = await api(`/admin/recipes?status=pending${query ? `&${params.toString()}` : ''}`);
  if (seq !== state.renderSeq) return;
  document.title = '菜谱审核 · 食光记后台';

  const content = `<div class="admin-view">
    <header class="admin-view__head">
      <div>
        <p class="eyebrow">REVIEW QUEUE</p>
        <h1>菜谱审核</h1>
        <p>读一读食材与步骤，把认真写下的味道端上桌。</p>
      </div>
      <span class="queue-count"><strong>${data.items.length}</strong> 份待审核</span>
    </header>

    <div class="admin-toolbar">
      <form class="admin-search js-admin-search-form" data-base="/admin/review" data-status="pending" role="search">
        <span>${icon('search')}</span>
        <label class="visually-hidden" for="admin-review-q">搜索待审核菜谱</label>
        <input id="admin-review-q" name="q" type="search" value="${escapeHtml(
          query
        )}" placeholder="搜索菜谱标题、作者或食材…" />
        <button class="btn btn--small btn--soft" type="submit">搜索</button>
      </form>
      <p class="admin-toolbar__hint">${icon('info')} 通过后立即公开，驳回会通知作者。</p>
    </div>

    ${
      data.items.length
        ? `<div class="review-queue">
            ${data.items
              .map(
                (item) => `<article class="review-card">
                  <button class="review-card__cover" type="button" data-action="review-open" data-id="${escapeHtml(
                    item.id
                  )}" aria-label="审核 ${escapeHtml(item.title)}">
                    <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy" />
                  </button>
                  <div class="review-card__body">
                    <div class="review-card__meta">
                      <span class="status-pill status-pill--pending">待审核</span>
                      <span>提交于 ${formatRelative(item.createdAt)}</span>
                    </div>
                    <h2>${escapeHtml(item.title)}</h2>
                    <p>${escapeHtml(item.summary)}</p>
                    <div class="review-card__byline">
                      ${avatarMarkup(item.author, 'xs')}
                      <span>${escapeHtml(item.author?.nickname || '厨友')}</span>
                      <i>·</i>
                      <span>${escapeHtml(item.category)} · ${escapeHtml(item.difficulty)} · ${
                  item.time
                } 分钟</span>
                    </div>
                    <div class="review-card__tags">${item.tags
                      .map((tag) => `<span class="tag tag--small">${escapeHtml(tag)}</span>`)
                      .join('')}</div>
                  </div>
                  <div class="review-card__actions">
                    <a class="btn btn--small btn--ghost" href="#/recipe/${encodeURIComponent(
                      item.id
                    )}" target="_blank" rel="noopener">查看页面 ${icon('external')}</a>
                    <button class="btn btn--small btn--primary" type="button" data-action="review-open" data-id="${escapeHtml(
                      item.id
                    )}">开始审核 ${icon('arrowRight')}</button>
                  </div>
                </article>`
              )
              .join('')}
          </div>`
        : `<div class="admin-empty admin-empty--large">
            <span>${icon('check')}</span>
            <div>
              <strong>${query ? '没有找到匹配的待审菜谱' : '审核队列已经清空'}</strong>
              <p>${
                query
                  ? '换一个关键词试试，或者清空搜索条件。'
                  : '所有提交都处理完了。新的味道到来时，会出现在这里。'
              }</p>
              ${
                query
                  ? '<a class="btn btn--small btn--soft" href="#/admin/review">清空搜索</a>'
                  : '<a class="btn btn--small btn--soft" href="#/admin">回到概览</a>'
              }
            </div>
          </div>`
    }
  </div>`;

  const countData = await api('/admin/recipes?status=pending');
  if (seq !== state.renderSeq) return;
  app.innerHTML = adminShell('review', content, countData.items.length);
}

/* ------------------------------------------------------------------ */
/* Admin · all recipes                                                */
/* ------------------------------------------------------------------ */

async function renderAdminRecipes(seq, route) {
  if (!state.user || state.user.role !== 'admin') {
    adminAccessGate();
    return;
  }
  const status = ['pending', 'approved', 'rejected'].includes(route.params.get('status'))
    ? route.params.get('status')
    : '';
  const query = route.params.get('q') || '';
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (query) params.set('q', query);
  const data = await api(`/admin/recipes${params.toString() ? `?${params.toString()}` : ''}`);
  if (seq !== state.renderSeq) return;
  document.title = '全部菜谱 · 食光记后台';

  const all = await api('/admin/recipes');
  if (seq !== state.renderSeq) return;
  const counts = {
    all: all.items.length,
    pending: all.items.filter((item) => item.status === 'pending').length,
    approved: all.items.filter((item) => item.status === 'approved').length,
    rejected: all.items.filter((item) => item.status === 'rejected').length
  };

  const statusLinks = [
    { key: '', label: '全部', count: counts.all },
    { key: 'pending', label: '待审核', count: counts.pending },
    { key: 'approved', label: '已发布', count: counts.approved },
    { key: 'rejected', label: '未通过', count: counts.rejected }
  ];

  const content = `<div class="admin-view">
    <header class="admin-view__head">
      <div>
        <p class="eyebrow">ALL RECIPES</p>
        <h1>全部菜谱</h1>
        <p>社区里所有投稿的状态，都可以在这里查看与处理。</p>
      </div>
      <span class="queue-count"><strong>${data.items.length}</strong> 条结果</span>
    </header>

    <div class="admin-toolbar admin-toolbar--stack">
      <div class="admin-filter-tabs" role="group" aria-label="按状态筛选">
        ${statusLinks
          .map(
            (item) =>
              `<a class="admin-filter-tabs__item ${
                status === item.key ? 'is-active' : ''
              }" href="#/admin/recipes?${new URLSearchParams({
                ...(item.key ? { status: item.key } : {}),
                ...(query ? { q: query } : {})
              }).toString()}">${item.label}<span>${item.count}</span></a>`
          )
          .join('')}
      </div>
      <form class="admin-search js-admin-search-form" data-base="/admin/recipes" data-status="${escapeHtml(
        status
      )}" role="search">
        <span>${icon('search')}</span>
        <label class="visually-hidden" for="admin-recipes-q">搜索全部菜谱</label>
        <input id="admin-recipes-q" name="q" type="search" value="${escapeHtml(
          query
        )}" placeholder="搜索标题、作者、食材或标签…" />
        <button class="btn btn--small btn--soft" type="submit">搜索</button>
      </form>
    </div>

    ${
      data.items.length
        ? `<div class="admin-table-card">
            <div class="table-scroll">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th scope="col">菜谱</th>
                    <th scope="col">作者</th>
                    <th scope="col">状态</th>
                    <th scope="col">数据</th>
                    <th scope="col">提交时间</th>
                    <th scope="col"><span class="visually-hidden">操作</span></th>
                  </tr>
                </thead>
                <tbody>
                  ${data.items
                    .map(
                      (item) => `<tr>
                        <td>
                          <div class="table-recipe">
                            <img src="${escapeHtml(item.cover)}" alt="" loading="lazy" />
                            <div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(
                        item.category
                      )} · ${escapeHtml(item.difficulty)}</span></div>
                          </div>
                        </td>
                        <td><span class="table-author">${escapeHtml(
                          item.author?.nickname || '厨友'
                        )}</span></td>
                        <td><span class="status-pill status-pill--${escapeHtml(
                          item.status
                        )}">${
                        item.status === 'approved' ? '已发布' : item.status === 'pending' ? '待审核' : '未通过'
                      }</span></td>
                        <td><span class="table-numbers">${compactNumber(item.likeCount)} 喜欢<br />${compactNumber(
                        item.viewCount
                      )} 浏览</span></td>
                        <td><span class="table-date">${formatDate(item.createdAt)}</span></td>
                        <td>
                          <div class="table-actions">
                            <a class="btn btn--tiny btn--ghost" href="#/recipe/${encodeURIComponent(
                              item.id
                            )}" target="_blank" rel="noopener">查看</a>
                            ${
                              item.status === 'pending'
                                ? `<button class="btn btn--tiny btn--primary" type="button" data-action="review-open" data-id="${escapeHtml(
                                    item.id
                                  )}">审核</button>`
                                : `<button class="btn btn--tiny btn--soft" type="button" data-action="review-open" data-id="${escapeHtml(
                                    item.id
                                  )}">复核</button>`
                            }
                          </div>
                        </td>
                      </tr>`
                    )
                    .join('')}
                </tbody>
              </table>
            </div>
          </div>`
        : `<div class="admin-empty admin-empty--large">
            <span>${icon('search')}</span>
            <div>
              <strong>没有找到符合条件的菜谱</strong>
              <p>试试更换状态筛选，或清空搜索关键词。</p>
              <a class="btn btn--small btn--soft" href="#/admin/recipes">查看全部</a>
            </div>
          </div>`
    }
  </div>`;

  app.innerHTML = adminShell('recipes', content, counts.pending);
}

/* ------------------------------------------------------------------ */
/* Small image / clipboard helpers                                    */
/* ------------------------------------------------------------------ */

async function copyCurrentLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast('链接已复制，去分享给朋友吧');
  } catch {
    const input = document.createElement('input');
    input.value = window.location.href;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      toast('链接已复制，去分享给朋友吧');
    } catch {
      toast('复制失败，请从地址栏复制链接', 'error');
    }
    input.remove();
  }
}

function openImageLightbox(src, alt) {
  if (!src) return;
  openModal(
    `<div class="image-lightbox">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />
      <p>${escapeHtml(alt)}</p>
    </div>`,
    { className: 'modal--image', label: alt || '菜谱图片' }
  );
}

/* ------------------------------------------------------------------ */
/* Admin · review modal                                               */
/* ------------------------------------------------------------------ */

async function openReviewModal(id) {
  if (!state.user || state.user.role !== 'admin') {
    toast('这个操作需要管理员权限', 'error');
    return;
  }
  let data;
  try {
    data = await api(`/recipes/${encodeURIComponent(id)}`);
  } catch (error) {
    toastError(error);
    return;
  }
  const recipe = data.recipe;
  const statusText =
    recipe.status === 'approved'
      ? '已发布'
      : recipe.status === 'pending'
      ? '待审核'
      : '未通过';
  let reviewedNote = '';
  if (recipe.reviewedAt) {
    reviewedNote = `<p class="review-decision-note">${icon('check')} 上次处理：${formatDateTime(
      recipe.reviewedAt
    )}${recipe.reviewedBy ? ` · 由 ${escapeHtml(recipe.reviewedBy.nickname)}` : ''}</p>`;
  }

  openModal(
    `<div class="review-modal">
      <header class="review-modal__head">
        <div>
          <p class="eyebrow">REVIEW SUBMISSION</p>
          <h2>${escapeHtml(recipe.title)}</h2>
          <p>${escapeHtml(recipe.category)} · ${escapeHtml(recipe.difficulty)} · ${
      recipe.time
    } 分钟 · ${recipe.servings} 人份</p>
        </div>
        <span class="status-pill status-pill--${escapeHtml(recipe.status)}">${statusText}</span>
      </header>

      <div class="review-preview">
        <button class="review-preview__cover" type="button" data-action="view-image" data-src="${escapeHtml(
          recipe.cover
        )}" data-alt="${escapeHtml(recipe.title)}">
          <img src="${escapeHtml(recipe.cover)}" alt="${escapeHtml(recipe.title)}" />
          <span>${icon('search')} 查看大图</span>
        </button>
        <div class="review-preview__intro">
          <div class="review-preview__author">
            ${avatarMarkup(recipe.author, 'sm')}
            <div><strong>${escapeHtml(recipe.author?.nickname || '厨友')}</strong><span>@${escapeHtml(
      recipe.author?.username || ''
    )} · ${formatDateTime(recipe.createdAt)} 提交</span></div>
          </div>
          <p class="review-preview__summary">${escapeHtml(recipe.summary)}</p>
          <div class="review-preview__tags">${recipe.tags
            .map((tag) => `<span class="tag tag--small">${escapeHtml(tag)}</span>`)
            .join('')}</div>
          ${reviewedNote}
        </div>
      </div>

      <div class="review-preview__details">
        <section>
          <h3>食材清单 <span>${recipe.ingredients.length} 项</span></h3>
          <ul class="review-ingredients">
            ${recipe.ingredients
              .map(
                (item) =>
                  `<li><span>${escapeHtml(item.name)}</span>${
                    item.amount
                      ? `<strong>${escapeHtml(item.amount)}</strong>`
                      : ''
                  }</li>`
              )
              .join('')}
          </ul>
        </section>
        <section>
          <h3>烹饪步骤 <span>${recipe.steps.length} 步</span></h3>
          <ol class="review-steps">
            ${recipe.steps
              .map(
                (step, index) => `<li>
                  <span class="review-steps__number">${String(index + 1).padStart(2, '0')}</span>
                  <div><p>${escapeHtml(step.text)}</p>${
                  step.image
                    ? `<button class="review-steps__image" type="button" data-action="view-image" data-src="${escapeHtml(
                        step.image
                      )}" data-alt="步骤 ${index + 1} 配图"><img src="${escapeHtml(
                        step.image
                      )}" alt="步骤 ${index + 1} 配图" loading="lazy" /></button>`
                    : '<span class="review-steps__no-image">未配图</span>'
                }</div>
                </li>`
              )
              .join('')}
          </ol>
        </section>
        ${
          recipe.tips
            ? `<section><h3>作者小贴士</h3><p class="review-tips">${escapeHtml(recipe.tips)}</p></section>`
            : ''
        }
      </div>

      <div class="review-checkpoints">
        <span>${icon('check')} 封面清晰</span>
        <span>${icon('check')} 食材与步骤完整</span>
        <span>${icon('check')} 图片与内容相符</span>
        <span>${icon('check')} 表达友好、无广告</span>
      </div>

      <form class="review-actions" id="reject-form" data-id="${escapeHtml(recipe.id)}">
        <div class="field">
          <label class="field-label" for="reject-reason">驳回建议</label>
          <textarea class="textarea" id="reject-reason" name="reason" rows="3" maxlength="200" placeholder="写下具体的修改建议，作者会看到这段话。例如：步骤 3 缺少关键火候说明，补充后可再次提交。">${escapeHtml(
            recipe.rejectReason || ''
          )}</textarea>
          <span class="field-help">只有驳回时才需要填写，至少 5 个字。</span>
        </div>
        <p class="form-error" data-form-error hidden></p>
        <div class="review-actions__row">
          <button class="btn btn--danger-outline" type="submit">${icon('close')} 驳回并通知作者</button>
          <button class="btn btn--primary" type="button" data-action="approve-recipe" data-id="${escapeHtml(
            recipe.id
          )}">${icon('check')} 通过审核</button>
        </div>
      </form>
    </div>`,
    { className: 'modal--review', label: `审核 ${recipe.title}` }
  );
}

async function approveRecipe(id, button) {
  if (!id) return;
  setButtonBusy(button, true, '正在通过…');
  try {
    await api(`/admin/recipes/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      body: { action: 'approve' }
    });
    toast('审核通过，这道菜端上桌了');
    closeModal();
    await renderRoute();
  } catch (error) {
    setButtonBusy(button, false);
    toastError(error);
  }
}

async function rejectRecipeFromForm(form) {
  const id = form.dataset.id;
  const reason = form.elements.reason?.value.trim() || '';
  const errorEl = form.querySelector('[data-form-error]');
  if (reason.length < 5) {
    setFormError(form, '请填写至少 5 个字的驳回建议，让作者知道怎么修改。');
    form.elements.reason?.focus();
    return;
  }
  setFormError(form, '');
  const submit = form.querySelector('button[type="submit"]');
  setButtonBusy(submit, true, '正在提交…');
  try {
    await api(`/admin/recipes/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      body: { action: 'reject', reason }
    });
    toast('已驳回，审核建议会显示给作者', 'info');
    closeModal();
    await renderRoute();
  } catch (error) {
    setButtonBusy(submit, false);
    setFormError(form, error.message || '提交失败，请稍后再试。');
  }
}

/* ------------------------------------------------------------------ */
/* Chart tooltips                                                     */
/* ------------------------------------------------------------------ */

function wireChartTooltips() {
  const wrap = document.querySelector('.chart-wrap');
  if (!wrap) return;
  const tooltip = wrap.querySelector('[data-chart-tooltip]');
  const groups = [...wrap.querySelectorAll('[data-chart-tip]')];
  if (!tooltip || !groups.length) return;
  const titleEl = tooltip.querySelector('.chart-tooltip__title');
  const valueEl = tooltip.querySelector('.chart-tooltip__value');
  const subEl = tooltip.querySelector('.chart-tooltip__sub');
  let active = null;

  const place = (clientX, clientY) => {
    tooltip.hidden = false;
    const margin = 14;
    const width = tooltip.offsetWidth || 190;
    const height = tooltip.offsetHeight || 72;
    let left = clientX + margin;
    let top = clientY - height - margin;
    if (left + width > window.innerWidth - 10) left = clientX - width - margin;
    if (left < 10) left = 10;
    if (top < 10) top = clientY + margin;
    if (top + height > window.innerHeight - 10) top = window.innerHeight - height - 10;
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };

  const show = (group, clientX, clientY) => {
    active = group;
    titleEl.textContent = group.dataset.tipTitle || '';
    valueEl.textContent = group.dataset.tipValue || '';
    subEl.textContent = group.dataset.tipSub || '';
    place(clientX, clientY);
  };
  const hide = () => {
    active = null;
    tooltip.hidden = true;
  };

  groups.forEach((group) => {
    group.addEventListener('mouseenter', (event) => show(group, event.clientX, event.clientY));
    group.addEventListener('mousemove', (event) => {
      if (active === group) place(event.clientX, event.clientY);
    });
    group.addEventListener('mouseleave', hide);
    group.addEventListener('focus', () => {
      const rect = group.getBoundingClientRect();
      show(group, rect.left + rect.width / 2, rect.top);
    });
    group.addEventListener('blur', hide);
  });
}

/* ------------------------------------------------------------------ */
/* Start                                                              */
/* ------------------------------------------------------------------ */

init();
