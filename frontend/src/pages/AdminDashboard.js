import React, { useState, useEffect, useCallback } from 'react';
import { orderApi, productApi } from '../services/api';
import Navbar from '../components/Navbar';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const EMPTY_PRODUCT = { name: '', category: '', price: '', stockQuantity: '', description: '', imageUrl: '', available: true };

export default function AdminDashboard() {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(0);
  const [ordersTotalPages, setOrdersTotalPages] = useState(0);
  const [products, setProducts] = useState([]);
  const [productsPage, setProductsPage] = useState(0);
  const [productsTotalPages, setProductsTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchOrders = useCallback(() => {
    setLoading(true);
    orderApi.allOrders({ page: ordersPage, size: 20 })
      .then(res => { setOrders(res.data.content); setOrdersTotalPages(res.data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ordersPage]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    productApi.getAll({ page: productsPage, size: 20 })
      .then(res => { setProducts(res.data.content); setProductsTotalPages(res.data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productsPage]);

  useEffect(() => { if (tab === 'orders') fetchOrders(); }, [tab, fetchOrders]);
  useEffect(() => { if (tab === 'products') fetchProducts(); }, [tab, fetchProducts]);

  const updateOrderStatus = async (id, status) => {
    try {
      const updated = await orderApi.updateStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? updated.data : o));
    } catch {}
  };

  const openCreate = () => { setProductForm(EMPTY_PRODUCT); setEditingId(null); setFormError(''); setShowForm(true); };
  const openEdit = (p) => { setProductForm({ ...p, price: p.price.toString(), stockQuantity: p.stockQuantity.toString() }); setEditingId(p.id); setFormError(''); setShowForm(true); };

  const saveProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    const payload = { ...productForm, price: parseFloat(productForm.price), stockQuantity: parseInt(productForm.stockQuantity) };
    try {
      if (editingId) {
        await productApi.update(editingId, payload);
      } else {
        await productApi.create(payload);
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      const data = err.response?.data;
      setFormError(data?.errors ? Object.values(data.errors).join(', ') : data?.message || 'Failed to save product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await productApi.delete(id); fetchProducts(); } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['orders', 'products'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-medium capitalize transition ${tab === t ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 border hover:bg-pink-50'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-left">
                    <tr>
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Total</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">#{order.id}</td>
                        <td className="px-4 py-3">{order.customerName}</td>
                        <td className="px-4 py-3 text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-semibold text-pink-600">${order.totalAmount}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
                          >
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {ordersTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button onClick={() => setOrdersPage(p => Math.max(0, p - 1))} disabled={ordersPage === 0}
                    className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-pink-50">← Prev</button>
                  <span className="px-4 py-2 text-sm text-gray-600">Page {ordersPage + 1} of {ordersTotalPages}</span>
                  <button onClick={() => setOrdersPage(p => Math.min(ordersTotalPages - 1, p + 1))} disabled={ordersPage === ordersTotalPages - 1}
                    className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-pink-50">Next →</button>
                </div>
              )}
            </>
          )
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={openCreate} className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 text-sm font-medium">
                + Add Product
              </button>
            </div>

            {/* Product Form Modal */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">{editingId ? 'Edit Product' : 'Add Product'}</h3>
                  {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
                  <form onSubmit={saveProduct} className="space-y-3">
                    {[['name', 'Name'], ['category', 'Category'], ['imageUrl', 'Image URL (optional)'], ['description', 'Description (optional)']].map(([key, label]) => (
                      <input key={key} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        placeholder={label} value={productForm[key]} onChange={e => setProductForm({ ...productForm, [key]: e.target.value })}
                        required={['name', 'category'].includes(key)} />
                    ))}
                    <div className="flex gap-2">
                      <input type="number" step="0.01" min="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        placeholder="Price" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                      <input type="number" min="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        placeholder="Stock" value={productForm.stockQuantity} onChange={e => setProductForm({ ...productForm, stockQuantity: e.target.value })} required />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={productForm.available} onChange={e => setProductForm({ ...productForm, available: e.target.checked })} />
                      Available
                    </label>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 font-medium">Save</button>
                      <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 py-2 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading ? <div className="text-center py-20 text-gray-400">Loading...</div> : (
              <>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-left">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{p.name}</td>
                          <td className="px-4 py-3 text-gray-500">{p.category}</td>
                          <td className="px-4 py-3 text-pink-600 font-semibold">${p.price}</td>
                          <td className="px-4 py-3">{p.stockQuantity}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {p.available ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <button onClick={() => openEdit(p)} className="text-blue-500 hover:underline text-xs">Edit</button>
                            <button onClick={() => deleteProduct(p.id)} className="text-red-400 hover:underline text-xs">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {productsTotalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button onClick={() => setProductsPage(p => Math.max(0, p - 1))} disabled={productsPage === 0}
                      className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-pink-50">← Prev</button>
                    <span className="px-4 py-2 text-sm text-gray-600">Page {productsPage + 1} of {productsTotalPages}</span>
                    <button onClick={() => setProductsPage(p => Math.min(productsTotalPages - 1, p + 1))} disabled={productsPage === productsTotalPages - 1}
                      className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-pink-50">Next →</button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
