import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import ProductTable from './components/ProductTable';
import ProductModal from './components/ProductModal';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import { apiService, authService } from './services/api';

export default function App() {
  // Auth State
  const [user, setUser] = useState(authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Product State
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
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // ── Auth Handlers ──
  const handleAuth = async (mode, formData) => {
    if (mode === 'login') {
      const data = await authService.login(formData.email, formData.password);
      setUser(data.user);
      setIsAuthModalOpen(false);
      addToast(`Welcome back, ${data.user.username}!`);
    } else {
      const data = await authService.signup(formData.username, formData.email, formData.password);
      setUser(data.user);
      setIsAuthModalOpen(false);
      addToast(`Account created! Welcome, ${data.user.username}!`);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    addToast('Logged out successfully.');
  };

  // Guard: require login for protected actions
  const requireAuth = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      addToast('Please log in to perform this action.', 'error');
      return false;
    }
    return true;
  };

  // ── Product Data Loading ──
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setTableApiError(null);
    try {
      const response = await apiService.getProducts({ search, category, status });
      setProducts(response.data || []);
      setIsConnected(true);
    } catch (err) {
      setTableApiError(err);
      setIsConnected(err.code !== 'NETWORK_ERROR');
      addToast(err.message || 'Failed to fetch products', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [search, category, status]);

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const response = await apiService.getStats();
      setStats(response.data);
    } catch (err) { /* silent */ }
    finally { setIsLoadingStats(false); }
  }, []);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, [loadProducts, loadStats]);

  // ── CRUD Handlers (Protected) ──
  const handleOpenCreate = () => {
    if (!requireAuth()) return;
    setEditingProduct(null);
    setModalApiError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    if (!requireAuth()) return;
    setEditingProduct(product);
    setModalApiError(null);
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (formData) => {
    if (!requireAuth()) return;
    setIsSubmitting(true);
    setModalApiError(null);
    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, formData);
        addToast(`Product "${formData.name}" updated successfully!`);
      } else {
        await apiService.createProduct(formData);
        addToast(`Product "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      loadProducts();
      loadStats();
    } catch (err) {
      if (err.statusCode === 401) {
        authService.logout();
        setUser(null);
        setIsModalOpen(false);
        setIsAuthModalOpen(true);
        addToast('Session expired. Please log in again.', 'error');
      } else {
        setModalApiError(err);
        addToast(err.message || 'Failed to save product', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!requireAuth()) return;
    if (!window.confirm(`Delete "${product.name}" (SKU: ${product.sku})?`)) return;
    try {
      await apiService.deleteProduct(product.id);
      addToast(`Product "${product.name}" deleted.`);
      loadProducts();
      loadStats();
    } catch (err) {
      if (err.statusCode === 401) {
        authService.logout();
        setUser(null);
        setIsAuthModalOpen(true);
        addToast('Session expired. Please log in again.', 'error');
      } else {
        addToast(err.message || 'Delete failed', 'error');
      }
    }
  };

  const handleSeedDatabase = async () => {
    if (!requireAuth()) return;
    if (!window.confirm('Reset database to sample dataset?')) return;
    setIsSeeding(true);
    try {
      await apiService.seedDatabase();
      addToast('Database reset and seeded!');
      loadProducts();
      loadStats();
    } catch (err) {
      if (err.statusCode === 401) {
        authService.logout();
        setUser(null);
        setIsAuthModalOpen(true);
        addToast('Session expired. Please log in again.', 'error');
      } else {
        addToast(err.message || 'Seed failed', 'error');
      }
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
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="main-container">
        <StatsCards stats={stats} isLoading={isLoadingStats} />

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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuth}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
