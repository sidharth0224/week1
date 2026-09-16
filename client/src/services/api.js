/**
 * Centralized API Service Helper Module
 * Manages all HTTP requests to the Product Inventory REST API
 */

const API_BASE_URL = '/api/v1/products';

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
 * Generic fetch wrapper with automatic error parsing and standard payload formatting.
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
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
    // Network failure or offline error
    throw new ApiServiceError(
      'Unable to connect to backend server. Please verify your Express API is running on port 3000.',
      0,
      'NETWORK_ERROR'
    );
  }
}

export const apiService = {
  /**
   * GET /api/v1/products
   * Fetch paginated & filtered list of products
   */
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
    return await apiRequest(queryString, { method: 'GET' });
  },

  /**
   * GET /api/v1/products/stats
   * Fetch aggregate inventory metrics
   */
  async getStats() {
    return await apiRequest('/stats', { method: 'GET' });
  },

  /**
   * GET /api/v1/products/:id
   * Fetch single product by ID
   */
  async getProductById(id) {
    return await apiRequest(`/${id}`, { method: 'GET' });
  },

  /**
   * POST /api/v1/products
   * Create a new product
   */
  async createProduct(productData) {
    return await apiRequest('', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  /**
   * PUT /api/v1/products/:id
   * Complete update of an existing product
   */
  async updateProduct(id, productData) {
    return await apiRequest(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  /**
   * PATCH /api/v1/products/:id
   * Partial update of a product
   */
  async patchProduct(id, patchData) {
    return await apiRequest(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patchData)
    });
  },

  /**
   * DELETE /api/v1/products/:id
   * Delete a product by ID
   */
  async deleteProduct(id) {
    return await apiRequest(`/${id}`, { method: 'DELETE' });
  },

  /**
   * POST /api/v1/products/seed
   * Reset database and seed sample products
   */
  async seedDatabase() {
    return await apiRequest('/seed', { method: 'POST' });
  }
};
