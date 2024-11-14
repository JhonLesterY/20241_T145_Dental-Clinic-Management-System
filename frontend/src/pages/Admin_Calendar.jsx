import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import SideNavBar from "../components/SideNavBar";
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';

const AdminCalendar = () => {
    const [month, setMonth] = useState("October 2024");
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
                <SideNavBar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center">
                {/* Header */}
                <header className="w-full shadow-lg">
                    <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
                        {/* Logo and Calendar Link */}
                        <div className="flex items-center space-x-4">
                            <img className="w-11 cursor-pointer" src={Logo} alt="Dental Logo" />
                            <Link to="/admin-calendar" className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition">
                                Calendar
                            </Link>
                        </div>

                        {/* Search Bar */}
                        <div className="flex items-center bg-white border rounded-xl px-3 py-1">
                            <img className="w-5" src={magnify} alt="Search icon" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="ml-2 p-1 outline-none w-full"
                                aria-label="Search for appointments"
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

                <div className='w-[95rem] mx-auto my-4'></div>

                {/* Month Selector moved here directly under header */}
                <div className="flex flex-col items-center my-4 space-x-4">
                    <div className="flex items-center mb-4 space-x-4">
                        <button className="text-2xl font-bold text-gray-700" onClick={() => alert("Previous month")}>
                            &lt;
                        </button>
                        <button className="text-2xl text-gray-700 border px-4 py-2 rounded-lg shadow-md bg-gray-50 transition duration-200">
                            {month}
                        </button>
                        <button className="text-2xl font-bold text-gray-700" onClick={() => alert("Next month")}>
                            &gt;
                        </button>
                    </div>

                    {/* Divider */}
                    <div className='w-[95%] mx-auto my-4'></div>

                    {/* Appointment Content */}
                    <div className="space-y-8 mt-1 mx-auto w-full max-w-4xl px-4">
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-4">
                            {/* Day Labels */}
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-xl text-center">{day}</div>
                            ))}

                            {/* Empty boxes for alignment */}
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-16"></div>
                            ))}

                            {/* Days of the month */}
                            {daysInMonth.map((day) => (
                                <div 
                                    key={day} 
                                    className="bg-gray-50 text-black border shadow-lg border-gray-300 p-3 text-2xl font-semibold text-center rounded-lg transition duration-200 hover:bg-blue-600 w-16"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCalendar;
