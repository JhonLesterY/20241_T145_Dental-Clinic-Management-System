import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faThLarge, 
  faFileAlt, 
  faCalendarAlt, 
  faClipboardList, 
  faComments, 
  faCog, 
  faBell, 
  faUserCircle, 
  faTooth, 
  faSearch 
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white w-65 p-6 flex flex-col">
        {/* Sidebar Navbar */}
        <div className="flex items-center justify-between mb-4">
          {/* Profile Section */}
          <div className="flex items-center">
            <Link to="/admin-profile">
            <img src="/src/assets/profile.jpg" alt="Profile" className="w-10 h-10 rounded-full mr-2" />
            </Link>
            <div className="flex flex-col">
              <Link to="/admin-profile" className="text-lg font-semibold hover:underline">Admin Name</Link>
            </div>
          </div>
        </div>

        <div className="mb-8 bg-blue-300 p-6 rounded-lg text-center shadow-lg">
          <h1 className="text-3xl font-bold flex items-center justify-center text-gray-900">
            <FontAwesomeIcon icon={faTooth} className="mr-3" />
            BukSU Dental Clinic
          </h1>
        </div>

        <nav>
          <ul className="space-y-4">
            {['Dashboard', 'View Appointment', 'Calendar'].map((item, index) => (
              <li key={index}>
                <Link
                  to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                  className="flex items-center text-white text-2xl transition duration-200 rounded p-2 hover:bg-blue-600"
                >
                  <FontAwesomeIcon 
                    icon={[faThLarge, faFileAlt, faCalendarAlt][index]} 
                    className="mr-3" 
                  />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-4 mt-2 pt-80">
            {['Inventory', 'View Feedback', 'Settings'].map((item, index) => (
              <li key={index}>
                <Link
                  to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                  className="flex items-center text-white text-2xl transition duration-200 rounded p-2 hover:bg-blue-600"
                >
                  <FontAwesomeIcon 
                    icon={[faClipboardList, faComments, faCog][index]} 
                    className="mr-3" 
                  />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        {/* Main Navbar */}
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
          {/* UniCare Logo */}
          <div className="flex items-center">
            <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
            <span className="ml-2 text-2xl font-bold text-gray-800">Appointments</span>
          </div>

          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="border-none focus:outline-none ml-2"
            />
          </div>

          {/* Notification Button */}
          <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <FontAwesomeIcon icon={faBell} className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-8">
          <div className="bg-blue-200 p-4 rounded-lg mb-6 text-center shadow-md">
            <h2 className="text-3xl font-bold">Today: October 2024</h2>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">01</div>
              <div className="text-2xl">2201103921</div>
              <div className="text-2xl">8:00 - 10:00 AM</div>
              <div className="flex items-center space-x-4">
                <button className="bg-green-200 p-2 rounded">✔️</button>
                <button className="bg-red-200 p-2 rounded">❌</button>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Link to="/admin-dashboard">
              <button className="text-1xl bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-600">
                Back
              </button>
            </Link>
            <Link to="/admin-calendar">
              <button className="text-1xl bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-600">
                Next
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
