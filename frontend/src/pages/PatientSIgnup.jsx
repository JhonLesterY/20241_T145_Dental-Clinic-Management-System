import React, { useState } from 'react'; 
import { Link, useNavigate} from 'react-router-dom'; // Import Link for navigation
import { useGoogleLogin } from '@react-oauth/google';
import "../App.css";


const PatientSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous error/success messages
    setError('');
    setSuccess('');
    
    try {
        const formData = {
            name: name.trim(),
            email: email.trim()
        };

        // Debug log to see exactly what we're sending
        console.log('Sending data:', JSON.stringify(formData, null, 2));

        const response = await fetch('http://localhost:5000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)  // Send only name and email
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        setSuccess(data.message);
        setName('');
        setEmail('');
        
        setTimeout(() => navigate('/login'), 3000);

    } catch (error) {
        console.error('Signup error:', error);
        // Format user-friendly error message
        let errorMessage = error.message;
        
        // Handle specific error messages
        if (errorMessage.includes('E11000') || errorMessage.includes('already exists')) {
            errorMessage = 'A user with this email already exists.';
        }
        
        setError(errorMessage);
    }
  };

  const googleSignup = useGoogleLogin({
    onSuccess: async (response) => {
        try {
            // Clear previous error/success messages
            setError('');
            setSuccess('');
            
            console.log('Google login success, getting user info...');
            
            // Get user info from Google
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` }
            });
            
            if (!userInfoResponse.ok) {
                throw new Error('Failed to get Google user info');
            }
            
            const userInfo = await userInfoResponse.json();
            console.log('Google user info:', userInfo);
            
            // Send to your backend
            const res = await fetch('http://localhost:5000/auth/google-signup', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  name: userInfo.name,
                  email: userInfo.email,
                  access_token: response.access_token,
                  googleId: userInfo.sub  // Include Google's unique identifier
              })
          });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to signup with Google');
            }

            console.log('Signup successful:', data);
            
            // Store user data
            sessionStorage.setItem('token', data.token);
            sessionStorage.setItem('patient_id', data.user.id);
            sessionStorage.setItem('role', 'patient');
            sessionStorage.setItem('name', data.user.name);

            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Signup error:', error);
            
            // Format user-friendly error message
            let errorMessage = error.message;
            
            // Handle specific error messages
            if (errorMessage.includes('E11000') || errorMessage.includes('already exists')) {
                errorMessage = 'A user with this email already exists.';
            }
            
            setError(errorMessage || 'Failed to signup with Google');
        }
    },
    onError: (error) => {
        console.error('Google signup error:', error);
        setError('Google signup failed. Please try again.');
    }
  });

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      <div className="flex flex-1">
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

        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-[#003367] text-white">
          <div className="w-full max-w-md p-8 bg-white text-gray-800 rounded-lg shadow-lg">
            <h4 className="text-2xl font-semibold text-center mb-6">Sign Up</h4>

            {error && (
              <div className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                <svg className="flex-shrink-0 inline w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}
             {success && (
                <div className="flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50">
                  <svg className="flex-shrink-0 inline w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  <span className="font-medium">{success}</span>
                </div>
              )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <input
                type="email"
                placeholder="Institutional Email"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 text-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />


              <button
                type="submit"
                className="w-full bg-[#003367] text-white py-3 rounded-lg hover:bg-blue-800 transition-colors font-semibold"
              >
                Sign Up
              </button>
            </form>

            <div className="relative my-4 text-center">
              <span className="text-gray-500">or</span>
            </div>

            {/* Google Sign-In Button */}
            <button
                onClick={() => googleSignup()}
                className="w-full flex justify-center items-center space-x-2 border border-gray-300 bg-white py-3 rounded-lg hover:bg-gray-100 transition-colors"
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
                <span className="text-blue-800">Continue with Google</span>
              </button>

            <div className="flex flex-col text-sm items-center mt-4">
              <span className="text-gray-700">Already have an account?</span>
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;
