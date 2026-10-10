import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../services/api';
import Navbar from '../components/Navbar';

export default function Products({ cart, setCart }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Roses', 'Tulips', 'Lilies', 'Orchids', 'Sunflowers', 'Mixed'];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll({ page, size: 12, category: category || undefined, keyword: keyword || undefined });
      setProducts(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, category, keyword]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Flowers</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex gap-2">
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Search flowers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setKeyword(search); setPage(0); } }}
            />
            <button
              onClick={() => { setKeyword(search); setPage(0); }}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-600"
            >Search</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => { setCategory(''); setPage(0); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${!category ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-300 text-gray-600 hover:border-pink-400'}`}
            >All</button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => { setCategory(c); setPage(0); }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${category === c ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-300 text-gray-600 hover:border-pink-400'}`}
              >{c}</button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No products found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="h-44 bg-pink-100 flex items-center justify-center overflow-hidden">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                    : <span className="text-5xl">🌸</span>}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mb-1">{p.category}</p>
                  <p className="text-pink-600 font-bold">${p.price}</p>
                  <p className="text-xs text-gray-400 mb-2">Stock: {p.stockQuantity}</p>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stockQuantity === 0}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-300 text-white text-sm py-1.5 rounded-lg transition"
                  >
                    {p.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-pink-50">← Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-pink-50">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
