import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate

const PatientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempted with:', { email, password });
    // Add your login logic, like API calls here

    // After successful login, navigate to AppointmentRequirements
    navigate('/appointment-requirements');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Navigation Bar */}
      <nav className="bg-light-blue-300 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center"> {/* Link to Landing Page */}
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
                {/* Horizontal line and "or" text */}
                <div className="flex items-center mb-4">
                  <hr className="flex-grow border-t border-white" />
                  <hr className="flex-grow border-t border-white" />
                </div>

                {/* Links Container */}
                <div className="flex justify-between w-full">
                  {/* Forgot Password Link */}
                  <div className="flex flex-col items-center">
                    <a href="#" className="text-white text-center">Forgot Password?</a>
                    <hr className="border-t border-white w-full mt-1" />
                  </div>
                  <span className="mx-2 text-white">or</span>
                  {/* Create Account Link */}
                  <div className="flex flex-col items-center">
                    <Link to="/signup" className="text-white text-center">Create Account</Link> {/* Link to Signup */}
                    <hr className="border-t border-white w-full mt-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 bg-white py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <a
                    href="https://accounts.google.com/signin"
                    className="flex items-center w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                  </a>
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

export default PatientLogin;
