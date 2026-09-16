/**
 * Centralized API Service Helper Module
 * Manages all HTTP requests to the Product Inventory REST API with JWT Auth
 */

const API_BASE_URL = '/api/v1';

class ApiServiceError extends Error {
  constructor(message, statusCode, code, details = null) {
    super(message);
    this.name = 'ApiServiceError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Generic fetch wrapper with automatic JWT Bearer token attachment and error parsing.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      const errorMsg = data.error?.message || `HTTP Request failed with status ${response.status}`;
      const errorCode = data.error?.code || 'UNKNOWN_ERROR';
      const errorDetails = data.error?.details || null;

      throw new ApiServiceError(errorMsg, response.status, errorCode, errorDetails);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiServiceError) {
      throw err;
    }
    throw new ApiServiceError(
      'Unable to connect to backend server. Please verify your Express API is running on port 3000.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const authService = {
  async signup(username, email, password) {
    const res = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getMe() {
    return await apiRequest('/auth/me', { method: 'GET' });
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('token');
  }
};

export const apiService = {
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.status) query.append('status', params.status);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.order) query.append('order', params.order);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit || 20);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await apiRequest(`/products${queryString}`, { method: 'GET' });
  },

  async getStats() {
    return await apiRequest('/products/stats', { method: 'GET' });
  },

  async getProductById(id) {
    return await apiRequest(`/products/${id}`, { method: 'GET' });
  },

  async createProduct(productData) {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async patchProduct(id, patchData) {
    return await apiRequest(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patchData)
    });
  },

  async deleteProduct(id) {
    return await apiRequest(`/products/${id}`, { method: 'DELETE' });
  },

  async seedDatabase() {
    return await apiRequest('/products/seed', { method: 'POST' });
  }
};
