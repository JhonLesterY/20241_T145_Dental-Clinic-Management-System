import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faBell,
    faUserCircle,
    faThLarge,
    faClipboardList,
    faComments,
    faCog,
    faCalendarAlt,
    faTooth,
} from '@fortawesome/free-solid-svg-icons';

const AdminCalendar = () => {
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

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
                        <span className="ml-2 text-2xl font-bold text-gray-800">Calendar</span>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1">
                        <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
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

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-4">
                        {/* Day Labels */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-2xl font-bold text-center">{day}</div>
                        ))}

                        {/* Empty boxes for alignment */}
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-16"></div>
                        ))}

                        {/* Days of the month */}
                        {daysInMonth.map((day) => (
                            <div key={day} className="bg-white border border-gray-300 p-4 text-center rounded-lg transition duration-200 hover:bg-blue-100">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        <Link to="/admin-view-appointment">
                            <button className="text-1xl bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-600">
                                Back
                            </button>
                        </Link>
                        <Link to="/admin-inventory">
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

export default AdminCalendar;
