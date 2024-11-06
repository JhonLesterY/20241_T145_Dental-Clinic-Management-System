import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import googleLogo from '../images/google.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (data.role === 'patient') {
          navigate('/dashboard');
        } else if (data.role === 'dentist') {
          navigate('/dentist-dashboard');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login.');
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    console.log('Google login response:', response);
    const token = response.access_token;
    if (!token) {
      console.error('Google ID token is missing');
      return;
    }
    try {
      const serverResponse = await fetch('/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken: token }),
      });

      const data = await serverResponse.json();
      if (serverResponse.ok) {
        localStorage.setItem('token', data.token);
        if (data.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (data.role === 'patient') {
          navigate('/dashboard');
        } else if (data.role === 'dentist') {
          navigate('/dentist-dashboard');
        }
      } else {
        setError('Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('An error occurred during Google login.');
    }
  };

  const handleGoogleLoginFailure = (error) => {
    console.error('Google Login Failed:', error);
    setError('Google login failed');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginFailure,
    scope: 'openid email profile',
  });

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Navigation Bar */}
      <nav className="bg-light-blue-300 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="logo-uniCare mr-2"></div>
            <span className="text-black font-bold">UniCare</span>
          </Link>
          <div className="h-6 border-l-2 border-black ml-4"></div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Section */}
        <div className="hidden lg:flex lg:w-1/2 text-white p-12 flex-col justify-start items-center left-section">
          <div className="logo-container flex space-x-4 items-center mb-8">
            <div className="lOGO-bsu"></div>
            <div className="logo-unicare"></div>
          </div>
          <div className="text-center" style={{ position: 'relative', zIndex: 2 }}>
            <h1 className="text-7xl mb-2 text-left university-text leading-snug">
              University<br />
              Dental Clinic <br />
              Management <br />
              System
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-start p-8 bg-[#003367]">
          <div className="w-full max-w-md p-8">
            <div className="mb-8 text-center">
              <h4 className="text-2xl text-white mb-2">Login</h4>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Institutional Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-blue-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-blue-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col text-sm items-center">
                <div className="flex items-center mb-4">
                  <hr className="flex-grow border-t border-white" />
                  <span className="mx-2 text-white">or</span>
                  <hr className="flex-grow border-t border-white" />
                </div>

                <div className="flex justify-between w-full">
                  <div className="flex flex-col items-center">
                    <a href="#" className="text-white text-center">Forgot Password?</a>
                    <hr className="border-t border-white w-full mt-1" />
                  </div>
                  <span className="mx-2 text-white">or</span>
                  <div className="flex flex-col items-center">
                    <Link to="/SignUp" className="text-white text-center">Create Account</Link>
                    <hr className="border-t border-white w-full mt-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => googleLogin()}
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 bg-white py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img src={googleLogo} alt="Google icon" className="w-5 h-5" />
                  <span className="text-blue-800">Sign in with Google</span>
                </button>

                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
