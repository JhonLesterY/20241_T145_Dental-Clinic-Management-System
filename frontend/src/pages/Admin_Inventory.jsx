import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserCircle,
    faTooth,
    faThLarge,
    faClipboardList,
    faComments,
    faCog,
    faBell,
    faSearch,
    faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';

const AdminInventory = () => {
    // Inventory items and their corresponding images
    const inventoryItems = [
        { name: 'Gloves', image: '/src/assets/gloves.jpg' },
        { name: 'Handpieces', image: '/src/assets/handpieces.jpg' },
        { name: 'Mask', image: '/src/assets/mask.jpg' },
        { name: 'Needles', image: '/src/assets/needles.jpg' },
        { name: 'Sterilizer', image: '/src/assets/sterlizer.jpg' },
        { name: 'Syringes', image: '/src/assets/syringes.jpg' },
        { name: 'Composite Resins', image: '/src/assets/composite-resins.jpg' },
        { name: 'Denture Cleaner', image: '/src/assets/denture-cleaner.jpg' },
        { name: 'Electric Micro Motor', image: '/src/assets/electric-micro-motor.jpg' },
        { name: 'Silicon Mouth Props', image: '/src/assets/silicon-mouth-props.jpg' },
        { name: 'Scaler', image: '/src/assets/scaler.jpg' },
        { name: 'Fluoride Varnish', image: '/src/assets/flouride-varnish.jpg' },
        { name: 'Syringes', image: '/src/assets/syringe.jpg' },
        { name: 'Trays', image: '/src/assets/trays.jpg' },
        { name: 'Lentulo Spiral', image: '/src/assets/lentulo-spiral.jpg' },
    ];

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
                <div className="flex items-center justify-between bg-white p-2 shadow-md">
                    <div className="flex items-center">
                        <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                        <span className="ml-2 text-2xl font-bold text-gray-800">Stocks</span>
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
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300" aria-label="Notifications">
                        <FontAwesomeIcon icon={faBell} className="text-xl text-gray-600" />
                    </button>
                </div>

                {/* Clinic Inventory Title */}
                <div className="p-8">
                <div className="bg-blue-200 p-4 rounded-lg mb-6 text-center shadow-md">
            <h2 className="text-3xl font-bold">Clinic Inventory</h2>
          </div>

                {/* Inventory Grid */}
                <div className= "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {inventoryItems.map((item) => (
                        <div key={item.name} className="bg-white border border-gray-300 p-4 rounded-lg shadow-md text-center">
                            <img src={item.image} alt={item.name} className="h-20 mx-auto mb-2" />
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                        </div>
                    ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6 px-4">
                    <Link to="/admin-calendar">
                        <button className="text-1xl bg-gray-800 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Back
                        </button>
                    </Link>
                    <Link to="/admin-settings">
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

export default AdminInventory;
