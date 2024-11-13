import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Ensure Link is imported for navigation
import SideNavBar from "../components/SideNavBar";
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <SideNavBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center">
        {/* Header */}
        <header className="w-full shadow-md">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and Inventory Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="Dental Logo" />
              <Link to="/admin-inventory" className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition">
                View Appointment
              </Link>
            </div>

            {/* Search Box */}
            <div className='flex bg-white gap-1 border rounded-xl justify-self-center px-3 py-0.5'>
              <div className='my-auto'>
                <img className='w-5' src={magnify} alt="Search Icon" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange} // Handle search input
                placeholder='Search' 
                className='p-0.5 outline-none' 
              />
            </div>

            {/* Bell Icon */}
            <div className="flex items-center">
              <button className="bg-gray-100 border-0 p-3 rounded-full hover:bg-gray-200">
                <img className="w-6" src={bell} alt="Notifications" />
              </button>
            </div>
          </div>
        </header>

        {/* Divider */}
        <div className='w-[95rem] mx-auto my-4'></div>

        {/* Main Content Area */}
        <div className="space-y-4 mt-5 mx-auto w-full max-w-4xl px-4">
          <div className="flex flex-col items-center mb-4">
            <div className="flex gap-2 items-center">
              <div className="border rounded-md px-2 py-1 bg-gray-200 text-gray-700">
                Today: October 2024
              </div>
            </div>
          </div>

          {/* Appointment Box */}
          <div className="space-y-4 mt-10 mx-auto w-full max-w-5xl px-4">
            <div className="border shadow-md p-5 rounded-xl mb-1.5 text-black">
              <div className="flex justify-between items-center">
                <span>01</span>
                <span>2201103921</span>
                <span>8:00 - 10:00 AM</span>
              

              <div className="flex justify-center space-x-5 mt-5">
                <button className="bg-green-200 p-2 w-20 rounded-lg transform hover:scale-105 transition-transform duration-200 ease-in-out">✔️</button>
                <button className="bg-red-200 p-2 w-20 rounded-lg transform hover:scale-105 transition-transform duration-200 ease-in-out">❌</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminDashboard;
