//Login Page
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

import "../App.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const recaptchaRef = useRef();
  const navigate = useNavigate();

  const handleRecaptchaChange = (value) => {
    console.log("reCAPTCHA value changed:", value ? "token received" : "token cleared");
    setIsVerified(!!value);
  };

  const handleGoogleClick = () => {
    if (!isVerified) {
      setError('Please complete the reCAPTCHA verification first');
      return;
    }
    googleLogin();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const recaptchaToken = recaptchaRef.current.getValue();
        if (!recaptchaToken) {
            setError('Please complete the reCAPTCHA verification');
            return;
        }

        const response = await fetch('http://localhost:5000/auth/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email, 
                password, 
                recaptchaToken: recaptchaToken
            })
        });

        const data = await response.json();
        console.log('Server response:', data); // Debug log

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Clear existing storage first
        sessionStorage.clear();

        // Store the new values using data.user.id
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.user.role);
        sessionStorage.setItem("patient_id", data.user.id); // Changed from patient_id to id

        // Verify storage
        const storedId = sessionStorage.getItem("patient_id");
        console.log('Stored patient_id:', storedId);

        if (data.user.role === 'patient' && storedId) {
            navigate('/dashboard');
        } else {
            setError('Invalid role type or missing patient ID');
        }
    } catch (error) {
        console.error('Login error:', error);
        setError(error.message || 'Failed to login');
        recaptchaRef.current?.reset();
        setIsVerified(false);
    }
};
// Google login handler
// In your Google login handler
const googleLogin = useGoogleLogin({
  onSuccess: async (response) => {
      try {
          // Get user info from Google
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${response.access_token}` }
          });
          const userInfo = await userInfoResponse.json();
          
          console.log('Google user info:', userInfo); // Debug log

          const recaptchaToken = recaptchaRef.current.getValue();
          if (!recaptchaToken) {
              setError('Please complete the reCAPTCHA verification');
              return;
          }

          const res = await fetch('http://localhost:5000/auth/google-login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  access_token: response.access_token,
                  recaptchaToken: recaptchaToken,
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture // Make sure this is included
              })
          });

          if (!res.ok) {
              const errorData = await res.json();
              console.error('Server error:', errorData); // Debug log
              throw new Error(errorData.message || 'Failed to login with Google');
          }

          const data = await res.json();
          console.log('Login response:', data); // Debug log

          sessionStorage.setItem('token', data.token);
          sessionStorage.setItem('patient_id', data.user.id);
          sessionStorage.setItem('role', 'patient');

          navigate('/dashboard');
      } catch (error) {
          console.error('Google login error:', error);
          setError(error.message || 'Failed to login with Google');
          recaptchaRef.current?.reset();
      }
  },
  onError: (error) => {
      console.error('Google login error:', error);
      setError('Google login failed');
      recaptchaRef.current?.reset();
  }
});

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
            <h1 className="text-4xl font-bold leading-tight text-white">
              University Dental Clinic Management System
            </h1>
          </div>
        </div>

        {/* Right Section with Blue Background */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#003367] text-white">
          <div className="w-full max-w-md p-8 bg-white text-gray-800 rounded-lg shadow-lg">
            <h4 className="text-2xl font-semibold text-center mb-6">Login</h4>

            {error && (
              <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Institutional Email"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-white-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-white-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

             {/* Add reCAPTCHA */}
             <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={handleRecaptchaChange}
        />
      </div>

              <div className="flex items-center justify-between text-sm text-gray-700">
                <Link to="/forgot-password" className="hover:underline">
                  Forgot Password?
                </Link>
                <span className="mx-2">or</span>
                <Link to="/SignUp" className="hover:underline">
                  Create Account
                </Link>
              </div>

              <button
        type="submit"
        disabled={!isVerified}
        className={`w-full py-3 rounded-lg font-semibold ${
          isVerified 
            ? 'bg-[#003367] text-white hover:bg-blue-800' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
                Continue
              </button>
            </form>

            <div className="relative my-4 text-center">
              <span className="text-gray-500">or continue with</span>
            </div>

            <button
      onClick={handleGoogleClick}
      type="button"
      disabled={!isVerified}
      className={`w-full flex justify-center items-center space-x-2 border border-gray-300 
        ${isVerified ? 'bg-white hover:bg-gray-100' : 'bg-gray-100 cursor-not-allowed'} 
        py-3 rounded-lg transition-colors`}
    >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className={isVerified ? 'text-blue-800' : 'text-gray-500'}>
                Continue with Google</span>
            </button>
            {error && (
                <div className="text-red-500 text-sm mt-2">
                    {error}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
