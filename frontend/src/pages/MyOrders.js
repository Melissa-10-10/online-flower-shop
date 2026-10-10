import React, { useState, useEffect } from 'react';
import { orderApi } from '../services/api';
import Navbar from '../components/Navbar';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED: 'bg-indigo-100 text-indigo-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function MyOrders({ cart }) {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    setLoading(true);
    orderApi.myOrders({ page, size: 10 })
      .then(res => { setOrders(res.data.content); setTotalPages(res.data.totalPages); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cartCount} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No orders yet.</div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <div>
                    <p className="font-semibold text-gray-800">Order #{order.id}</p>
                    <p className="text-sm text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-pink-600">${order.totalAmount}</span>
                    <span className="text-gray-400">{expanded === order.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expanded === order.id && (
                  <div className="border-t px-4 py-3 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-2">📍 {order.deliveryAddress}</p>
                    <table className="w-full text-sm">
                      <thead><tr className="text-gray-400 text-left"><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                      <tbody>
                        {order.items?.map((item, i) => (
                          <tr key={i} className="border-t">
                            <td className="py-1">{item.productName}</td>
                            <td>{item.quantity}</td>
                            <td>${item.unitPrice}</td>
                            <td>${item.subtotal}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
