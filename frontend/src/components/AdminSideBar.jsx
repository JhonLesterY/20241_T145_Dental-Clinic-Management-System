import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTooth,
  faThLarge,
  faFileAlt,
  faCalendarAlt,
  faClipboardList,
  faComments,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import { MdMenuOpen } from "react-icons/md";

export default function Sidebar({ toggleModal, setShowDentistModal, handleLogout }) {
  const [open, setOpen] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkProfileStatus();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
        checkProfileStatus();
    };
    
    window.addEventListener('profileUpdate', handleProfileUpdate);
    
    return () => {
        window.removeEventListener('profileUpdate', handleProfileUpdate);
    };
}, []);

const checkProfileStatus = async () => {
  try {
      const adminId = sessionStorage.getItem('admin_id');
      const token = sessionStorage.getItem('token');
      const isComplete = sessionStorage.getItem('isProfileComplete');
      
      console.log('Checking profile status:', { adminId, token, isComplete });
      
      if (!adminId || !token) {
          navigate('/login');
          return;
      }

      const response = await fetch(`http://localhost:5000/admin/${adminId}/profile`, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      
      if (!response.ok) {
          throw new Error('Failed to fetch profile status');
      }

      const data = await response.json();
      console.log('Profile status response:', data);
      
      setIsProfileComplete(data.isProfileComplete);
      sessionStorage.setItem('isProfileComplete', data.isProfileComplete);
  } catch (error) {
      console.error('Error checking profile status:', error);
  }
};
  const menuItems = [
    { 
      label: "Dashboard", 
      icon: faThLarge, 
      link: "/admin-dashboard",
      requiresProfile: false 
    },
    { 
      label: "View Appointment", 
      icon: faFileAlt, 
      link: "/admin-view-appointment",
      requiresProfile: true 
    },
    { 
      label: "Calendar", 
      icon: faCalendarAlt, 
      link: "/admin-calendar",
      requiresProfile: true 
    },
    { 
      label: "Inventory", 
      icon: faClipboardList, 
      link: "/admin-inventory",
      requiresProfile: true 
    },
    { 
      label: "View Feedback", 
      icon: faComments, 
      link: "/admin-view-feedback",
      requiresProfile: true 
    },
    { 
      label: "Settings", 
      icon: faCog, 
      link: "/admin-settings",
      requiresProfile: false 
    }
  ];

  const handleNavigation = (item, e) => {
    if (item.requiresProfile && !isProfileComplete) {
        e.preventDefault();
        e.stopPropagation(); // Add this to stop event propagation
        alert('Please complete your profile first');
        navigate('/admin-profile'); // Navigate to settings
        return false; // Add this to ensure the navigation is stopped
    }
};
  

  return (
    <nav
      className={`fixed top-0 left-0 shadow-lg h-screen flex flex-col transition-all duration-500 bg-[#003367] text-white ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0055A4]">
        <div className={`transition-all duration-500 flex items-center ${!open && "hidden"}`}>
          <FontAwesomeIcon icon={faTooth} size="2x" className="text-white mr-2" />
          <h1 className="text-xl font-bold">BukSU Dental Clinic</h1>
        </div>
        <MdMenuOpen
          size={28}
          className="cursor-pointer hover:text-gray-200"
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Menu Items */}
      <ul className="flex-1 overflow-y-auto space-y-2 px-3 mt-4">
        {menuItems.map((item, index) => (
          <li
          key={index}
          className={`flex items-center gap-3 px-4 py-2 rounded-md transition duration-300 ${
              item.requiresProfile && !isProfileComplete 
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-[#0055A4] cursor-pointer'
          }`}
                > {item.requiresProfile && !isProfileComplete ? (
                  // For incomplete profile, render a div instead of Link
                  <div className="flex items-center w-full" onClick={(e) => handleNavigation(item, e)}>
                      <FontAwesomeIcon 
                          icon={item.icon} 
                          size="lg" 
                          className="opacity-50"
                      />
                      <p className={`ml-3 text-base transition-all duration-500 ${
                          !open && "opacity-0 translate-x-10"
                      }`}>
                          {item.label}
                      </p>
                  </div>
              ) : (
                  // For complete profile or non-restricted items, render Link
                  <Link 
                      to={item.link} 
                      className="flex items-center w-full"
                  >
                      <FontAwesomeIcon icon={item.icon} size="lg" />
                      <p className={`ml-3 text-base transition-all duration-500 ${
                          !open && "opacity-0 translate-x-10"
                      }`}>
                          {item.label}
                      </p>
                  </Link>
              )}
            {!open && (
              <span className="absolute left-16 bg-white text-[#003367] px-2 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:left-12 transition-all duration-300">
                {item.label}
                {item.requiresProfile && !isProfileComplete && " (Complete profile first)"}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Footer Buttons */}
      <div className="px-4 py-3 space-y-2">
        <button
          onClick={toggleModal}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Add Admin
        </button>
        <button
          onClick={() => setShowDentistModal(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Add Dentist
        </button>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
