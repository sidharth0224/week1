import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import ProductTable from './components/ProductTable';
import ProductModal from './components/ProductModal';
import Toast from './components/Toast';
import { apiService } from './services/api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalApiError, setModalApiError] = useState(null);
  const [tableApiError, setTableApiError] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Products List
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setTableApiError(null);
    try {
      const response = await apiService.getProducts({ search, category, status });
      setProducts(response.data || []);
      setIsConnected(true);
    } catch (err) {
      console.error('API Error loading products:', err);
      setTableApiError(err);
      setIsConnected(err.code !== 'NETWORK_ERROR');
      addToast(err.message || 'Failed to fetch products from backend API', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [search, category, status]);

  // Fetch Inventory Metrics
  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const response = await apiService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('API Error loading stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, [loadProducts, loadStats]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalApiError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setModalApiError(null);
    setIsModalOpen(true);
  };

  // Submit Create or Edit Form
  const handleSubmitProduct = async (formData) => {
    setIsSubmitting(true);
    setModalApiError(null);

    try {
      if (editingProduct) {
        // PUT update
        await apiService.updateProduct(editingProduct.id, formData);
        addToast(`Product "${formData.name}" updated successfully!`, 'success');
      } else {
        // POST create
        await apiService.createProduct(formData);
        addToast(`Product "${formData.name}" created successfully!`, 'success');
      }
      setIsModalOpen(false);
      loadProducts();
      loadStats();
    } catch (err) {
      console.error('Form Submission Error:', err);
      setModalApiError(err);
      addToast(err.message || 'Failed to save product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}" (SKU: ${product.sku})?`)) {
      return;
    }

    try {
      await apiService.deleteProduct(product.id);
      addToast(`Product "${product.name}" deleted successfully.`, 'success');
      loadProducts();
      loadStats();
    } catch (err) {
      console.error('Delete Error:', err);
      addToast(err.message || 'Failed to delete product', 'error');
    }
  };

  // Reset & Seed Database
  const handleSeedDatabase = async () => {
    if (!window.confirm('Reset local SQLite database to initial sample dataset?')) {
      return;
    }

    setIsSeeding(true);
    try {
      await apiService.seedDatabase();
      addToast('Database reset and sample products seeded!', 'success');
      loadProducts();
      loadStats();
    } catch (err) {
      console.error('Seed Error:', err);
      addToast(err.message || 'Failed to seed database', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div>
      <Navbar 
        onSeedDatabase={handleSeedDatabase}
        isSeeding={isSeeding}
        isConnected={isConnected}
      />

      <main className="main-container">
        <StatsCards 
          stats={stats} 
          isLoading={isLoadingStats} 
        />

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          status={status}
          onStatusChange={setStatus}
          onOpenCreate={handleOpenCreate}
        />

        <ProductTable
          products={products}
          isLoading={isLoadingProducts}
          error={tableApiError}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteProduct}
          onRetry={loadProducts}
        />
      </main>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProduct}
        editingProduct={editingProduct}
        isSubmitting={isSubmitting}
        apiError={modalApiError}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
