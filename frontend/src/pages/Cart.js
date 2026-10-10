import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Cart({ cart, setCart }) {
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const updateQty = (id, delta) => {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    );
  };

  const placeOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (!address.trim()) { setError('Delivery address is required'); return; }
    setLoading(true);
    setError('');
    try {
      await orderApi.place({
        deliveryAddress: address,
        notes,
        items: cart.map(i => ({ productId: i.id, quantity: i.qty }))
      });
      setCart([]);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h2>
        {cart.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🛒</p>
            <p>Your cart is empty.</p>
            <button onClick={() => navigate('/products')} className="mt-4 text-pink-500 hover:underline">Browse flowers</button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm divide-y mb-6">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 bg-pink-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🌸</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-pink-600 text-sm">${item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full border text-gray-600 hover:bg-pink-50">−</button>
                    <span className="w-6 text-center font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full border text-gray-600 hover:bg-pink-50">+</button>
                  </div>
                  <p className="w-16 text-right font-semibold text-gray-700">${(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span className="text-pink-600">${total.toFixed(2)}</span>
              </div>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Delivery address *"
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Notes (optional)"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
