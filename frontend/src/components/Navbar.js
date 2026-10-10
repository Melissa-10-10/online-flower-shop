import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ cartCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/products" className="text-2xl font-bold text-pink-600">🌸 Bloom & Blossom</Link>
        <div className="flex items-center gap-4">
          <Link to="/products" className="text-gray-600 hover:text-pink-500 font-medium">Shop</Link>
          {user && (
            <>
              <Link to="/orders" className="text-gray-600 hover:text-pink-500 font-medium">My Orders</Link>
              {(user.role === 'ADMIN' || user.role === 'STAFF') && (
                <Link to="/admin" className="text-gray-600 hover:text-pink-500 font-medium">Dashboard</Link>
              )}
              <Link to="/cart" className="relative text-gray-600 hover:text-pink-500 font-medium">
                🛒
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <span className="text-sm text-gray-500">Hi, {user.username}</span>
              <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-600">Logout</button>
            </>
          )}
          {!user && (
            <Link to="/login" className="bg-pink-500 text-white px-4 py-1.5 rounded-lg hover:bg-pink-600 text-sm">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
