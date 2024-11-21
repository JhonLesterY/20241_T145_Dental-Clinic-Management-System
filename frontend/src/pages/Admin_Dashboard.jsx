import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faFileAlt, faCalendarAlt, faClipboardList, faComments, faCog, faBell, faTooth, faSearch, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  
  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white w-1/4 lg:w-1/5 p-6 flex flex-col">
        {/* Profile Section */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/admin-profile" className="flex items-center">
            <img src="/src/assets/profile.jpg" alt="Profile" className="w-10 h-10 rounded-full mr-2" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Admin Name</span>
            </div>
          </Link>
        </div>

        <div className="mb-8 bg-blue-300 p-4 rounded-lg text-center shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900">
            <FontAwesomeIcon icon={faTooth} className="mr-3" /> BukSU Dental Clinic
          </h1>
        </div>

        <nav className="flex-1">
              {/* First group of navigation items */}
              <ul className="space-y-4">
                {['Dashboard', 'View Appointment', 'Calendar'].map((item, index) => (
                  <li key={index}>
                    <Link
                      to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                      className="flex items-center text-white text-lg transition duration-200 rounded p-2 hover:bg-blue-600"
                    >
                      <FontAwesomeIcon icon={[faThLarge, faFileAlt, faCalendarAlt][index]} className="mr-3" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Second group of navigation items */}
              <ul className="space-y-4 mt-8">
                {['Inventory', 'View Feedback', 'Settings'].map((item, index) => (
                  <li key={index}>
                    <Link
                      to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                      className="flex items-center text-white text-lg transition duration-200 rounded p-2 hover:bg-blue-600"
                    >
                      <FontAwesomeIcon icon={[faClipboardList, faComments, faCog][index]} className="mr-3" />
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* User Management link - separate from other groups */}
              <ul className="space-y-4 mt-8">
                <li>
                  <Link
                    to="/admin-userManagement"
                    className="flex items-center text-white text-lg transition duration-200 rounded p-2 hover:bg-blue-600"
                  >
                    <FontAwesomeIcon icon={faUsers} className="mr-3" />
                    User Management
                  </Link>
                </li>
              </ul>
            </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
          <div className="flex items-center">
            <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
            <span className="ml-2 text-2xl font-bold text-gray-800">Dashboard</span>
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
          </div>
          <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <FontAwesomeIcon icon={faBell} className="text-xl text-gray-600" />
          </button>
        </div>

      

      </div>
    </div>
  );
};

export default AdminDashboard;