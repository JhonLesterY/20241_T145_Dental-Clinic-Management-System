import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';
import SideNavBar from '../components/SideNavBar'; // Ensure SideNavBar is imported

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
        { name: 'Mouth Props', image: '/src/assets/silicon-mouth-props.jpg' },
        { name: 'Scaler', image: '/src/assets/scaler.jpg' },
        { name: 'Fluoride Varnish', image: '/src/assets/flouride-varnish.jpg' },
    ];

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
                        {/* Logo and Appointment Link */}
                        <div className="flex items-center space-x-4">
                            <img className="w-11 cursor-pointer" src={Logo} alt="Dental Logo" />
                            <Link to="/admin-inventory" className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition">
                                Inventory
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

                {/* Divider */}
                <div className='w-[95rem] mx-auto my-4'></div>

                 {/* Clinic Inventory Section */}
                 <div className="space-y-4 mt-5 mx-auto w-full max-w-5xl px-4">
                    <h2 className="text-3xl font-semibold text-[#003367] mb-6 text-center tracking-tight">
                        Clinic Inventory
                    </h2>

                    {/* Inventory Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-6 px-4">
                        {inventoryItems.map((item) => (
                            <div key={item.name} className="bg-gray-50 border shadow-lg border-gray-300 p-6 rounded-lg transform transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-2xl">
                                <img src={item.image} alt={item.name} className="h-24 mx-auto mb-4 object-cover rounded-lg" />
                                <h4 className="text-lg text-[#003367]">{item.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInventory;
