const TOKEN_KEY = 'shiguang_token';

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function buildOptions({ method = 'GET', body, form, headers = {} } = {}) {
  const token = localStorage.getItem(TOKEN_KEY) || '';
  const options = { method, headers: { ...headers } };

  if (token) options.headers.Authorization = `Bearer ${token}`;
  if (form) {
    options.body = form;
  } else if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  return options;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY) || '';
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`/api${endpoint}`, buildOptions(options));

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && token && !endpoint.startsWith('/auth/')) {
      unauthorizedHandler?.();
    }
    throw new ApiError(
      data?.error || '请求没有成功，请稍后再试',
      response.status,
      Array.isArray(data?.details) ? data.details : []
    );
  }

  return data;
}

export const apiGet = (path) => api(path);
export const apiPost = (path, body) => api(path, { method: 'POST', body });
export const apiPut = (path, body) => api(path, { method: 'PUT', body });
export const apiDelete = (path) => api(path, { method: 'DELETE' });

export function apiUpload(file) {
  const form = new FormData();
  form.append('image', file);
  return api('/upload', { method: 'POST', form });
}
