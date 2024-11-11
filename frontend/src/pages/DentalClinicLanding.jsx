import React from 'react';
import { useNavigate } from 'react-router-dom';

const DentalClinicLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Navigation Bar */}
      <nav className="bg-blue-300 p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-4">
          {/* UniCare Logo */}
          <div className="logo-unicare w-10 h-10 bg-cover bg-center"></div>
          <span className="text-black font-bold text-lg">UniCare</span>

        </div>
        <div className="flex items-center space-x-4">
          {/* Google Maps Button */}
          <button
            className="map-container w-10 h-10 bg-cover bg-center"
            onClick={() => window.open('https://www.google.com/maps', '_blank')}
            title="View on Google Maps"
          ></button>
          {/* Login Button */}
          <button
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section with Background */}
      <div className="bg-hero relative flex-grow bg-cover bg-center">
        <div className="absolute inset-0 bg-black opacity-40"></div> {/* Dark overlay for text readability */}
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 space-y-6">
          <div className="text-white text-center max-w-lg">
            <h1 className="text-5xl font-bold mb-2 leading-snug">
              Welcome to<br />
              BukSU Dental <br />
              Clinic!
            </h1>
            <p className="text-xl">
              We Provide the Best Dental Care Service
            </p>
          </div>
          {/* Dental Clinic Logo */}
          <div className="logo-Unicare w-32 h-32 bg-cover bg-center"></div>
        </div>

        {/* BSU Logo as Faded Background */}
        <div className="logo-bsu absolute inset-0 flex items-center justify-center">
          <div className="w-72 h-72 bg-cover bg-center opacity-10"></div>
        </div>
      </div>

      {/* Stay Connected Header */}
      <header className="bg-gradient-to-b from-gray-600 to-gray-700 text-white text-center py-4 shadow-inner">
        <h2 className="text-lg font-semibold">Stay Connected With BukSU Clinic</h2>
      </header>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 shadow-md">
        <div className="container mx-auto flex justify-center gap-8 flex-wrap">
          {/* Facebook Link */}
          <div className="flex items-center space-x-2">
            <button
              className="fb-icon w-6 h-6 bg-cover bg-center"
              onClick={() => window.open('https://www.facebook.com/BukidnonStateUniversity', '_blank')}
            ></button>
            <span className="text-gray-800">Bukidnon State University</span>
          </div>
          {/* Phone Number */}
          <div className="flex items-center space-x-2">
            <span>📞</span>
            <span className="text-gray-800">0922 3456 789</span>
          </div>
          {/* Email Link */}
          <div className="flex items-center space-x-2">
            <span>✉️</span>
            <a href="mailto:info@buksu.edu.ph" className="text-blue-600 hover:underline">
              info@buksu.edu.ph
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DentalClinicLanding;
