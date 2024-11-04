import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faBell, faQuestionCircle, faLock, faTooth, faThLarge, faClipboardList, faCalendarAlt, faComments, faCog, faSearch } from '@fortawesome/free-solid-svg-icons';

const Admin_Settings = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
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
                                        icon={[faThLarge, faClipboardList, faCalendarAlt][index]} 
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
                    <div className="flex items-center">
                        <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                        <span className="ml-2 text-2xl font-bold text-gray-800">Settings</span>
                    </div>

                    {/* Notification Button */}
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                        <FontAwesomeIcon icon={faBell} className="text-xl text-gray-600" />
                    </button>
                </div>

        {/* Settings Content */}
        <div className="p-8">
                <div className="bg-blue-200 p-4 rounded-lg mb-6 text-center shadow-md">
            <h2 className="text-3xl font-bold">General Settings</h2>
          </div>
            {/* Switch Theme */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <FontAwesomeIcon icon={isDarkTheme ? faMoon : faSun} className="mr-3 text-xl" />
                <span className="text-lg">Switch Theme</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-full transition duration-200 ${isDarkTheme ? 'bg-gray-600' : 'bg-yellow-400'}`}
              >
                {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>

            {/* Notification Settings */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faBell} className="mr-3 text-xl" />
                <span className="text-lg">Notification Settings</span>
              </div>
              <button className="text-blue-500">Edit</button>
            </div>

            {/* Help */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faQuestionCircle} className="mr-3 text-xl" />
                <span className="text-lg">Help</span>
              </div>
              <button className="text-blue-500">View</button>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faLock} className="mr-3 text-xl" />
                <span className="text-lg">Privacy Policy</span>
              </div>
              <button className="text-blue-500">View</button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Admin_Settings;
