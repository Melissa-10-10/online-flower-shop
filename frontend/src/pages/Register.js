import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register(form);
      login(res.data);
      navigate('/products');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors ? Object.values(data.errors).join(', ') : data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, placeholder, type = 'text') => (
    <input
      type={type}
      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
      placeholder={placeholder}
      value={form[key]}
      onChange={e => setForm({ ...form, [key]: e.target.value })}
      required={['username', 'email', 'password'].includes(key)}
    />
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-pink-600 mb-2 text-center">🌸 Bloom & Blossom</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-6 text-center">Create Account</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {field('username', 'Username')}
          {field('email', 'Email', 'email')}
          {field('password', 'Password (min 6 chars)', 'password')}
          <div className="flex gap-2">
            {field('firstName', 'First Name')}
            {field('lastName', 'Last Name')}
          </div>
          {field('phone', 'Phone (10-15 digits)')}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
