import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import SideNavBar from "../components/SideNavBar";
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';

const AdminCalendar = () => {
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

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
                        {/* Logo and Appointment Link */}
                        <div className="flex items-center space-x-4">
                            <img className="w-11 cursor-pointer" src={Logo} alt="Dental Logo" />
                            <Link to="/admin-calendar" className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition">
                                Calendar
                            </Link>
                        </div>

                        {/* Search Box */}
                        <div className='flex bg-white gap-1 border rounded-xl justify-self-center px-3 py-0.5'>
                            <div className='my-auto'>
                                <img className='w-5' src={magnify} alt="Search Icon" />
                            </div>
                            <input 
                                type="text" 
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
                <div className=' w-[95rem] mx-auto my-4'></div>

                {/* Appointment Content */}
                <div className="flex flex-col items-center mt-5 mx-auto max-w-5xl">
                    <h2 className="text-3xl font-semibold text-[#003367] mb-6 text-center">
                        Book Your Appointment
                    </h2>

                    {/* Main Content Area */}
                    <div className="flex flex-col items-center mb-4">
                        <div className="flex gap-2 items-center">
                            <div className="border rounded-md px-2 py-1 bg-white-gray border shadow-md text-gray-700">
                                Today: October 2024
                            </div>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-4">
                        {/* Day Labels */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="text-xl font-bold text-center">{day}</div>
                        ))}

                        {/* Empty boxes for alignment */}
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="h-16"></div>
                        ))}

                        {/* Days of the month */}
                        {daysInMonth.map((day) => (
                            <div key={day} className="bg-white-gray border shadow-lg border-gray-300 p-3 text-2xl font-semibold text-center rounded-lg transition duration-200 hover:bg-blue-100 w-16">
                                {day}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCalendar;
