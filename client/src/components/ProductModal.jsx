import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';

export default function ProductModal({ isOpen, onClose, onSubmit, editingProduct, isSubmitting, apiError }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Electronics',
    price: '',
    stock: '',
    description: '',
    status: 'in_stock'
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        sku: editingProduct.sku || '',
        category: editingProduct.category || 'Electronics',
        price: editingProduct.price !== undefined ? editingProduct.price : '',
        stock: editingProduct.stock !== undefined ? editingProduct.stock : '',
        description: editingProduct.description || '',
        status: editingProduct.status || 'in_stock'
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: 'Electronics',
        price: '',
        stock: '',
        description: '',
        status: 'in_stock'
      });
    }
    setFieldErrors({});
  }, [editingProduct, isOpen]);

  useEffect(() => {
    // Extract field-level errors if API returned Zod validation details (HTTP 400)
    if (apiError && apiError.details && Array.isArray(apiError.details)) {
      const errMap = {};
      apiError.details.forEach(item => {
        if (item.field) {
          errMap[item.field] = item.message;
        }
      });
      setFieldErrors(errMap);
    } else {
      setFieldErrors({});
    }
  }, [apiError]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name.trim(),
      sku: formData.sku.trim(),
      category: formData.category.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      description: formData.description.trim(),
      status: formData.status
    });
  };

  const isEdit = Boolean(editingProduct);

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 className="modal-title">
            {isEdit ? `Edit Product #${editingProduct.id}` : 'Create New Product'}
          </h3>
          <button className="modal-close" onClick={onClose} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {apiError && !apiError.details && (
            <div className="error-banner">
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>{apiError.message || 'An error occurred while saving the product.'}</div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              required
              className="input-control"
              placeholder="e.g. Wireless Ergonomic Mouse"
              value={formData.name}
              onChange={handleChange}
            />
            {fieldErrors.name && <div className="form-error">{fieldErrors.name}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">SKU (Unique Code) *</label>
              <input
                type="text"
                name="sku"
                required
                className="input-control"
                placeholder="e.g. PERIPH-9009"
                value={formData.sku}
                onChange={handleChange}
              />
              {fieldErrors.sku && <div className="form-error">{fieldErrors.sku}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                name="category"
                required
                className="input-control"
                placeholder="e.g. Electronics"
                value={formData.category}
                onChange={handleChange}
              />
              {fieldErrors.category && <div className="form-error">{fieldErrors.category}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                name="price"
                required
                className="input-control"
                placeholder="29.99"
                value={formData.price}
                onChange={handleChange}
              />
              {fieldErrors.price && <div className="form-error">{fieldErrors.price}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                required
                className="input-control"
                placeholder="50"
                value={formData.stock}
                onChange={handleChange}
              />
              {fieldErrors.stock && <div className="form-error">{fieldErrors.stock}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="select-control"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              rows={3}
              className="input-control"
              placeholder="Product specification, features, details..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Update Product' : 'Create Product'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
