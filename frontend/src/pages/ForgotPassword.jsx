import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../App.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setMessage('A password reset link has been sent to your email.');
      } else {
        setError('Email not found. Please try again.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Section with Background Image */}
        <div
          className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center relative bg-cover bg-center left-section"
        >
          <div className="absolute inset-0 bg-[#003367] opacity-60"></div>
          <div className="relative z-10 flex flex-col items-center text-center text-white">
            <div className="flex items-center space-x-4 mb-8">
              <div className="logo-bsu w-12 h-12 bg-cover bg-center"></div>
              <div className="logo-unicare w-12 h-12 bg-cover bg-center"></div>
            </div>
            <h1 className="text-4xl font-bold leading-tight">
              University Dental Clinic Management System
            </h1>
          </div>
        </div>

        {/* Right Section with Blue Background */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#003367] text-white">
          <div className="w-full max-w-md p-8 bg-white text-gray-800 rounded-lg shadow-lg">
            <h4 className="text-2xl font-semibold text-center mb-6">Forgot Password</h4>

            {message && (
              <p className="text-green-600 text-center mb-4 bg-green-100 p-2 rounded">{message}</p>
            )}
            {error && (
              <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <button
                type="submit"
                className="w-full bg-[#003367] text-white py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
              >
                Send Reset Link
              </button>
            </form>

            <div className="mt-4 text-center text-gray-700">
              <Link to="/login" className="hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
