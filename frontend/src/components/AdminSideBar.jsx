import React, { useState, useEffect } from "react";
import axios from "axios"; // For making API requests
import Logo from "/src/images/Dental_logo.png";
import { useNavigate } from "react-router-dom";

// Icons
import { MdMenuOpen, MdOutlineDashboard, MdCalendarToday, MdLogout } from "react-icons/md"; // Added MdLogout
import { IoHomeOutline, IoLogoBuffer } from "react-icons/io5";
import { FaUserCircle, FaEye, FaPlusCircle, FaBoxes } from "react-icons/fa"; // Updated Icons
import { TbReportSearch } from "react-icons/tb";
import { CiSettings } from "react-icons/ci";
import { VscOutput } from "react-icons/vsc"; // Add this import for the activity log icon

// Menu Items
const menuItems = [
  { 
    icons: <IoHomeOutline size={24} />, 
    label: "Dashboard", 
    path: "/admin-dashboard",
    permission: "viewReports"
  },
  { 
    icons: <FaUserCircle size={24} />, 
    label: "User Management", 
    path: "/admin-userManagement",
    permission: "manageUsers"
  },
  { 
    icons: <FaEye size={24} />, 
    label: "View Appointment", 
    path: "/admin-viewAppointment",
    permission: "manageAppointments"
  },
  { 
    icons: <MdCalendarToday size={24} />, 
    label: "Calendar", 
    path: "/admin-calendar",
    permission: "manageCalendar"
  },
  { 
    icons: <FaBoxes size={24} />, 
    label: "Inventory", 
    path: "/admin-inventory",
    permission: "manageInventory"
  },
  { 
    icons: <MdOutlineDashboard size={24} />, 
    label: "View Feedback", 
    path: "/admin-viewFeedback",
    permission: "viewReports"
  },
  { 
    icons: <VscOutput size={24} />, 
    label: "Activity Logs", 
    path: "/activity-logs",
    permission: "viewReports"
  },
  { 
    icons: <CiSettings size={24} />, 
    label: "Settings", 
    path: "/admin-settings",
    permission: null
  },
  { 
    icons: <TbReportSearch size={24} />, 
    label: "Reports", 
    path: "/admin-report",
    permission: "viewReports"
  },
];

export default function Sidebar({ open = true, setOpen }) {
  const [adminData, setAdminData] = useState({ 
    email: "Loading...",
    permissions: {},
    permissionLevel: ''
  });
  const navigate = useNavigate();

  // Add permission check function
  const hasPermission = (permission) => {
    return permission === null || 
           adminData.permissionLevel === 'HIGH' || 
           adminData.permissions[permission];
  };

  // Add this effect to open the sidebar on mount
  useEffect(() => {
    if (setOpen && typeof setOpen === 'function') {
      setOpen(true);
    }
  }, [setOpen]);

  // Fetch admin details from the backend
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:5000/admin/current', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setAdminData(data);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setAdminData({ 
          email: "Error: Unable to fetch data",
          permissions: {},
          permissionLevel: ''
        });
      }
    };

    fetchAdminData();
  }, []);

  // Logout function to clear token and navigate to login page
  const handleLogout = () => {
    // Clear all storage
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin_id");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("name");
    sessionStorage.removeItem("profilePicture");
    
    navigate("/login");
  };

  return (
    <nav
      className={`fixed top-0 left-0 shadow-lg h-screen flex flex-col transition-all duration-500 bg-[#1e2a4a] text-white ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1e2a4a]">
        <img
          src={Logo}
          alt="Logo"
          className={`transition-all duration-500 rounded-md ${
            open ? "w-12" : "w-0"
          }`}
        />
        {setOpen && typeof setOpen === 'function' && (
          <MdMenuOpen
            size={28}
            className="cursor-pointer hover:text-gray-200"
            onClick={() => setOpen(!open)}
          />
        )}
      </div>

      {/* Menu Items - Updated to use filtered items */}
      <ul className={`flex-1 px-3 mt-4 ${open ? "space-y-2" : "space-y-4"}`}>
        {menuItems.map((item, index) => {
          const isAuthorized = hasPermission(item.permission);
          
          return (
            <li
              key={index}
              onClick={() => isAuthorized && navigate(item.path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-md 
                ${isAuthorized 
                  ? 'hover:bg-[#2a3a63] cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'} 
                transition duration-300 group`}
            >
              <div className={!isAuthorized ? 'text-gray-500' : ''}>{item.icons}</div>
              <p className={`text-base transition-all duration-500 
                ${!open && "opacity-0 translate-x-10"}
                ${!isAuthorized ? 'text-gray-500' : ''}`}
              >
                {item.label}
                {!isAuthorized && ' (No Access)'}
              </p>
              {!open && (
                <span className="absolute left-16 bg-white text-[#003367] px-2 py-1 rounded-md shadow-lg 
                  opacity-0 group-hover:opacity-100 pointer-events-none">
                  {item.label}
                  {!isAuthorized && ' (No Access)'}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-[#1e2a4a] cursor-pointer hover:bg-[#2a3a63] transition duration-300"
        onClick={handleLogout} // Handle Logout
      >
        <MdLogout size={30} />
        <div
          className={`text-sm transition-all duration-500 ${
            !open && "opacity-0 translate-x-10"
          }`}
        >
          <p className="font-semibold">{adminData.email || "Sign Out"}</p>
        </div>
      </div>
    </nav>
  );
}
