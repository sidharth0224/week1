import React from 'react';
import { Search, Plus, Filter } from 'lucide-react';

export default function FilterBar({ 
  search, 
  onSearchChange, 
  category, 
  onCategoryChange, 
  status, 
  onStatusChange, 
  onOpenCreate 
}) {
  return (
    <div className="controls-card">
      <div className="filter-group">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input-control"
            placeholder="Search by product name, SKU, description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <select 
            className="select-control"
            value={category} 
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Groceries">Groceries</option>
            <option value="Home & Kitchen">Home & Kitchen</option>
            <option value="Outdoor">Outdoor</option>
          </select>

          <select 
            className="select-control"
            value={status} 
            onChange={(e) => onStatusChange(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary" onClick={onOpenCreate}>
        <Plus size={18} />
        <span>Add Product</span>
      </button>
    </div>
  );
}
