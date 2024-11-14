import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SideNavBar from "../components/SideNavBar";
import Logo from "/src/images/Dental_logo.png";  // Add the correct path to your logo

const Admin_Settings = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  };

  return (
    <div className={`flex min-h-screen ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <SideNavBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Header */}
        <header className="w-full shadow-lg">
          <div className="flex items-center justify-between p-5 max-w-5xl mx-auto">
            {/* Logo and Settings Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="dental-logo" />
              <Link
                to="/admin-settings"
                className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition"
              >
                Settings
              </Link>
            </div>
            {/* Add more header elements here as needed */}
          </div>
        </header>
         
         {/* Divider */}
        <div className='border w-[95rem] mx-auto'></div>

        {/* Settings Content */}
        <div className="space-y-4 mt-10 mx-auto w-full max-w-4xl px-4">
          {/* Switch Theme */}
          <div className="border shadow-lg p-5 rounded-xl mb-1.5 text-black transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center">
              <span>Switch Theme</span>
              <button className="px-4 py-2 rounded-full bg-[#003367] text-white">Dark Mode</button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="border shadow-lg p-5 rounded-xl mb-1.5 text-black transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center">
              <span>Notification Settings</span>
              <button className="bg-[#003367] text-white">Edit</button>
            </div>
          </div>

          {/* Help */}
          <div className="border shadow-lg p-5 rounded-xl mb-1.5 text-black transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center">
              <span>Help</span>
              <button className="bg-[#003367] text-white">View</button>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="border shadow-lg p-5 rounded-xl mb-1.5 text-black transform hover:scale-105 transition-transform duration-200 ease-in-out">
            <div className="flex justify-between items-center">
              <span>Privacy Policy</span>
              <button className="bg-[#003367] text-white">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_Settings;
