import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Home from "../components/Home";
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';

const Dentist_ViewConsultation = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Home />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center bg-white-gray border">
        {/* Header */}
        <header className="w-full shadow-md">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and View Consultation Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="Dental Logo" />
              <Link to="/dentist-viewConsultation" className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition">
                View Feedback
              </Link>
            </div>

            {/* Search Box */}
            <div className="flex bg-white gap-1 border rounded-xl px-3 py-0.5">
              <div className="my-auto">
                <img className="w-5" src={magnify} alt="search icon" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search"
                className="p-0.5 outline-none"
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
        <div className=" w-[95rem] mx-auto my-4"></div>

        {/* Main Content Area */}
        <div className="space-y-4 mt-5 mx-auto w-full max-w-4xl px-4">
          {/* Date Display */}
          <div className="flex justify-center mb-4">
            <div className="border rounded-md px-4 py-2 bg-white-gray border shadow-md text-gray-700">
              Today: October 2024
            </div>
          </div>

          {/* Appointment Box */}
          <div className="space-y-4 mt-10 mx-auto w-full max-w-5xl px-4">
            <div className="border shadow-md p-5 rounded-xl bg-white-gray text-black">
              <div className="flex justify-between items-center">
                <span className="font-semibold">01</span>
                <span className="font-semibold">2201103921</span>
                <span className="font-semibold">8:00 - 10:00 AM</span>

                {/* View Button aligned with Appointment Details */}
                <button className=" cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-5 py-2 bg-[#003367] text-white transform hover:scale-105 transition-transform duration-200 ease-in-out">
                  View
                </button>
              </div>
              </div>
            </div>
            {/* Add Button */}
            <div className="flex justify-end p-7 mt-8">
            <NavLink
              to="/dentist-addConsultation"
              className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-5 py-2 bg-[#003367] text-white transform hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              Add
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dentist_ViewConsultation;
