import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png";
import AdminSideBar from "../components/AdminSideBar";

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

const Admin_Inventory = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
                {/* Header */}
                <header className="bg-white shadow-md">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
                            <h1 className="text-2xl font-semibold text-[#003367]">Inventory</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {/* Search Icon */}
                                <svg
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-4.35-4.35M16 10a6 6 0 1112 0 6 6 0 01-12 0z"
                                    />
                                </svg>
                            </div>

                            <button className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Notifications">
                                <img className="w-6 h-6" src={bell} alt="Notifications" />
                            </button>
                        </div>
                    </div>
                </header>
                <div className="w-[78rem] mx-auto my-4"></div>

                {/* Clinic Inventory Section */}
                <div className="space-y-4 mt-8 mx-auto w-full max-w-9xl px-4">

                    {/* Inventory Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-8 px-4">
                        {inventoryItems.map((item) => (
                            <div key={item.name} className="bg-white border rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl p-6">
                                <img src={item.image} alt={item.name} className="h-32 mx-auto mb-4 object-cover rounded-lg" />
                                <h4 className="text-lg font-semibold text-[#003367] text-center">{item.name}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin_Inventory;
