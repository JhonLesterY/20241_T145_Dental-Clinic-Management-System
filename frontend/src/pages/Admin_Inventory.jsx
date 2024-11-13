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
        { name: 'Silicon Mouth Props', image: '/src/assets/silicon-mouth-props.jpg' },
        { name: 'Scaler', image: '/src/assets/scaler.jpg' },
        { name: 'Fluoride Varnish', image: '/src/assets/flouride-varnish.jpg' },
        { name: 'Syringes', image: '/src/assets/syringe.jpg' },
        { name: 'Trays', image: '/src/assets/trays.jpg' },
        { name: 'Lentulo Spiral', image: '/src/assets/lentulo-spiral.jpg' },
    ];

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
                            <Link to="/admin-inventory" className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition">
                                Inventory
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
                <div className='w-[95rem] mx-auto my-4'></div>

                {/* Clinic Inventory Section */}
                <div className="flex flex-col items-center mt-5 mx-auto max-w-5xl">
                    <h2 className="text-3xl font-semibold text-[#003367] mb-6 text-center">
                        Clinic Inventory
                    </h2>

                    {/* Inventory Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {inventoryItems.map((item) => (
                            <div key={item.name} className="bg-white border border-gray-300 p-4 rounded-lg shadow-md text-center hover:scale-105 transform transition-all duration-200 ease-in-out">
                                <img src={item.image} alt={item.name} className="h-20 mx-auto mb-2 object-cover" />
                                <h3 className="text-lg font-semibold">{item.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminInventory;
