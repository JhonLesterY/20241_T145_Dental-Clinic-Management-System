import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../App.css";


const DentalClinicLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Navigation Bar */}
      <nav className="bg-light-blue-300 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="logo-uniCare mr-2"></div> {/* UniCare Logo */}
          <span className="text-black font-bold">UniCare</span>
          <div className="h-6 border-l-2 border-black ml-4"></div>
        </div>
        <div className="flex items-center">
        <button 
            className="map-container w-10 h-10 bg-contain bg-center bg-no-repeat"
            onClick={() => window.open('https://www.google.com/maps', '_blank')}
            title="View on Google Maps"
          ></button>
          <button 
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-2 px-4 rounded shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
            onClick={() => navigate('/login')} // Navigates to the login page
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section with Background */}
      <div className="bg-hero flex-grow relative flex items-start w-full items-center ">
      <div className="relative z-10 p-6 flex flex-row items-center space-x-20"> {/* Adjusted spacing here */}
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl mb-2 text-left leading-snug text-white">
              Welcome to<br />
              BukSU Dental <br />
              Clinic!
            </h1>
          </div>
          <div className="h-32 border-l-4 border-white mx-4"></div> {/* Changed from border-l-2 to border-l-4 for boldness */}
          <div className="p-4 flex items-start justify-start text-left text-white">
            <p className="text-xl">
              We <br />
              Provide<br />
              Best Dental Care Service
            </p>
          </div>
          <div className="ml-8"> 
            <div className="logo-Unicare w-44 h-44"></div> {/* Increased size for Dental Logo */}
          </div>
        </div>
        {/* BSU Logo Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="logo-bsu w-96 h-96"></div> {/* Increased size for BSU Logo */}
        </div>
      </div>

      {/* Header */}
      <header className="header bg-gradient-to-b from-gray-600 to-gray-700 text-white text-center p-1">
        <h1 className="header-title text-lg font-normal mb-2 text-white">Stay Connected With BukSU Clinic</h1>
      </header>

      {/* Footer */}
      <div className="bg-gray-100 p-2">
        <div className="container mx-auto">
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <button className="fb-icon" onClick={() => window.open('https://www.facebook.com/BukidnonStateUniversity', '_blank')}>
                {/* Facebook Icon */}
              </button>
              <span>Bukidnon State University</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>0922 3456 789</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✉️</span>
              <a href="mailto:info@buksu.edu.ph" className="text-blue-600 hover:underline">
                info@buksu.edu.ph
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalClinicLanding;