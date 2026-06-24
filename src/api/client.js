/**
 * 美客多工作台 PRO - API 基础客户端
 * 封装了基础的 Fetch 请求和 Token 注入 (由 Vite Proxy 自动处理 Token)
 */

export const API_BASE = '/api';

export const apiClient = {
  get: async (path, params = {}) => {
    const url = new URL(`${window.location.origin}${API_BASE}${path}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  post: async (path, body = {}) => {
    const url = new URL(`${window.location.origin}${API_BASE}${path}`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  patch: async (path, body = {}) => {
    const url = new URL(`${window.location.origin}${API_BASE}${path}`);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  del: async (path) => {
    const url = new URL(`${window.location.origin}${API_BASE}${path}`);
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
