import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Validate passwords
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Password reset successful!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.error || 'Failed to reset password');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
            <div className="flex flex-1">
                {/* Left Section */}
                <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center relative bg-cover bg-center left-section">
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

                {/* Right Section */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#003367] text-white">
                    <div className="w-full max-w-md p-8 bg-white text-gray-800 rounded-lg shadow-lg">
                        <h4 className="text-2xl font-semibold text-center mb-6">Reset Password</h4>

                        {message && (
                            <p className="text-green-600 text-center mb-4 bg-green-100 p-2 rounded">{message}</p>
                        )}
                        {error && (
                            <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded">{error}</p>
                        )}

<form onSubmit={handleSubmit} className="space-y-4">
                            {/* Password Input with Toggle */}
                            <div className="relative">
    <input
        type={showPassword ? "text" : "password"}
        placeholder="New Password"
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
    />
    {/* Replace button with clickable div */}
    <div
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
    >
        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
    </div>
</div>

<div className="relative">
    <input
        type={showConfirmPassword ? "text" : "password"}
        placeholder="Confirm New Password"
        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
    />
    {/* Replace button with clickable div */}
    <div
        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
    >
        {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
    </div>
</div>

                            <button
                                type="submit"
                                className="w-full bg-[#003367] text-white py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
                            >
                                Reset Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;