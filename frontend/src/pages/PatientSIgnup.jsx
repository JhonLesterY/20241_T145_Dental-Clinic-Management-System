import React, { useState } from 'react';
import { Link, useNavigate} from 'react-router-dom'; // Import Link for navigation
import { GoogleLogin } from '@react-oauth/google';
import "../App.css";


const PatientSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    } 
    

    try {
      const response = await fetch('/patients/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phoneNumber: 'Optional phone number field if needed',
        })
      });
  
      const data = await response.json();
      
      if (response.ok) {
        console.log("Signup successful", data);
        navigate('/login');
      } else {
        console.error("Signup failed", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Handle successful Google Sign-up
  const handleGoogleSignUp = async (response) => {
    const { credential: idToken } = response;
  
    try {
        const res = await fetch('/patients/google-signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              idToken,
              phoneNumber: 'N/A',
              password: 'N/A'
             })
        });
        
        const data = await res.json();
        if (res.ok) {
            console.log("Google signup successful:", data);
            navigate('/login');
        } else {
            console.error("Google signup failed:", data.error);
        }
    } catch (error) {
        console.error("Error during Google signup:", error);
    }
  
  };

  
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Navigation Bar */}
      <nav className="bg-light-blue-300 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="logo-uniCare mr-2"></div> {/* UniCare Logo */}
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
            <div className="lOGO-bsu"></div> {/* BSU Logo */}
            <div className="logo-unicare"></div> {/* UniCare Logo */}
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
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-start p-8 bg-[#003366]">
          <div className="w-full max-w-md p-8">
            <div className="mb-8 text-center">
              <h4 className="text-2xl text-white mb-2">Sign Up</h4>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-blue-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder-blue-800"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Sign Up
                </button>
              </div>
              <div className="text-center my-4 text-white">OR</div>
              <GoogleLogin
                onSuccess={handleGoogleSignUp}
                onError={() => console.log("Google sign up failed")}
                useOneTap={false}
            />
            </form>

            {/* Improved Already have an account section */}
            <div className="flex flex-col text-sm items-center mt-4">
              <span className="text-white">Already have an account?</span>
              <Link to="/login" className="text-white text-center font-semibold mt-1 w-full bg-blue-600 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;
