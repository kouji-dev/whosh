'use client';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GoogleButton from './GoogleButton';

const RegisterForm: React.FC = () => {
  const { register, loginWithGoogle, loading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-brown">Create your Magnet account</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <input
        type="text"
        placeholder="Name"
        className="input input-bordered w-full mb-4"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="input input-bordered w-full mb-4"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="input input-bordered w-full mb-6"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button
        type="submit"
        className="btn btn-primary w-full mb-4"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
      <GoogleButton onClick={loginWithGoogle} />
    </form>
  );
};

export default RegisterForm; 