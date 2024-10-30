import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const PatientSignup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Signup attempted with:', { name, email, password, confirmPassword });
    // Add your signup logic, like API calls
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
