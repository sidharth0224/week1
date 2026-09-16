import React from 'react';
import { Edit2, Trash2, PackageX, AlertCircle } from 'lucide-react';

export default function ProductTable({ products, isLoading, error, onEdit, onDelete, onRetry }) {
  if (error) {
    return (
      <div className="table-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <AlertCircle size={40} color="#ef4444" style={{ marginBottom: '0.75rem', opacity: 0.9 }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
          Failed to load products
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '450px', margin: '0 auto 1.25rem' }}>
          {error.message || 'An error occurred while communicating with the REST API.'}
        </p>
        <button className="btn btn-secondary" onClick={onRetry}>
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td><div className="skeleton" style={{ height: '18px', width: '30px' }} /></td>
                <td><div className="skeleton" style={{ height: '18px', width: '180px' }} /></td>
                <td><div className="skeleton" style={{ height: '18px', width: '90px' }} /></td>
                <td><div className="skeleton" style={{ height: '18px', width: '100px' }} /></td>
                <td><div className="skeleton" style={{ height: '18px', width: '60px' }} /></td>
                <td><div className="skeleton" style={{ height: '18px', width: '70px' }} /></td>
                <td><div className="skeleton" style={{ height: '22px', width: '80px', borderRadius: '999px' }} /></td>
                <td><div className="skeleton" style={{ height: '30px', width: '120px' }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="table-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
        <PackageX size={44} color="#64748b" style={{ marginBottom: '0.75rem', opacity: 0.6 }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.3rem' }}>
          No products found
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          No items match your filter criteria or the database is empty.
        </p>
      </div>
    );
  }

  return (
    <div className="table-card animate-fade-in">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td><strong style={{ color: '#94a3b8' }}>#{p.id}</strong></td>
              <td>
                <div style={{ fontWeight: 700, color: '#f8fafc' }}>{p.name}</div>
                {p.description && (
                  <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.description}
                  </div>
                )}
              </td>
              <td>
                <span className="sku-tag">{p.sku}</span>
              </td>
              <td>{p.category}</td>
              <td>
                <strong style={{ color: '#ffffff', fontFamily: 'var(--font-code)' }}>
                  ${p.price.toFixed(2)}
                </strong>
              </td>
              <td>
                <span style={{ fontWeight: 600 }}>{p.stock}</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.3rem' }}>units</span>
              </td>
              <td>
                <span className={`badge badge-${p.status}`}>
                  {p.status.replace('_', ' ')}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button 
                    className="btn btn-secondary btn-icon" 
                    onClick={() => onEdit(p)}
                    title="Edit Product"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>

                  <button 
                    className="btn btn-danger btn-icon" 
                    onClick={() => onDelete(p)}
                    title="Delete Product"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
