import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faBell,
    faThLarge,
    faClipboardList,
    faComments,
    faCog,
    faCalendarAlt,
    faTooth,
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';

const AdminCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    const nextMonth = () => {
        setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
        if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
    };

    const previousMonth = () => {
        setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
        if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
    };

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = new Date(currentYear, currentMonth, 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="flex h-screen w-screen">
            {/* Sidebar */}
            <div className="bg-[#003367] text-white w-1/4 p-6 hidden lg:block">
                <div className="mb-4">
                    <Link to="/admin-profile" className="flex items-center">
                        <img src="/src/assets/profile.jpg" alt="Profile" className="w-10 h-10 rounded-full mr-2" />
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold">Admin Name</span>
                        </div>
                    </Link>
                </div>

                <div className="mb-8 bg-white p-4 rounded-lg text-center shadow-lg text-gray-900">
                    <h1 className="text-3xl font-bold">
                        <FontAwesomeIcon icon={faTooth} className="mr-3" /> BukSU Dental Clinic
                    </h1>
                </div>

                <nav>
                    <ul className="space-y-4">
                        {['Dashboard', 'View Appointment', 'Calendar'].map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                                    className="flex items-center text-lg rounded p-2 hover:bg-blue-500"
                                >
                                    <FontAwesomeIcon icon={[faThLarge, faClipboardList, faCalendarAlt][index]} className="mr-3" />
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <ul className="space-y-4 mt-8">
                        {['Inventory', 'View Feedback', 'Settings'].map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                                    className="flex items-center text-lg rounded p-2 hover:bg-blue-500"
                                >
                                    <FontAwesomeIcon icon={[faClipboardList, faComments, faCog][index]} className="mr-3" />
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white p-6">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md text-gray-900">
                    <div className="flex items-center">
                        <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                        <span className="ml-2 text-2xl font-bold">Calendar</span>
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1 bg-white">
                        <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="border-none focus:outline-none ml-2 text-gray-700"
                        />
                    </div>
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600">
                        <FontAwesomeIcon icon={faBell} className="text-xl" />
                    </button>
                </div>

                {/* Calendar Navigation */}
                <div className="mt-8 flex items-center justify-center">
                    <button onClick={previousMonth} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <h2 className="text-3xl font-bold mx-4 text-blue-700">{monthNames[currentMonth]} {currentYear}</h2>
                    <button onClick={nextMonth} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>

                {/* Calendar Area */}
                <div className="mt-4 grid grid-cols-7 gap-4">
                    {/* Day Labels */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-xl font-semibold text-center text-blue-700">{day}</div>
                    ))}

                    {/* Empty boxes for alignment */}
                    {Array.from({ length: startDay }).map((_, index) => (
                        <div key={index}></div>
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, day) => (
                        <div
                            key={day + 1}
                            className="bg-blue-50 border border-gray-300 p-4 rounded-lg text-center text-xl text-blue-700 hover:bg-blue-100 transition duration-200 shadow-sm"
                        >
                            <span>{day + 1}</span>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                    <Link to="/admin-view-appointment">
                        <button className="text-xl bg-[#003367] text-white px-4 py-2 rounded hover:bg-blue-600">
                            Back
                        </button>
                    </Link>
                    <Link to="/admin-inventory">
                        <button className="text-xl bg-[#003367] text-white px-4 py-2 rounded hover:bg-blue-600">
                            Next
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminCalendar;
