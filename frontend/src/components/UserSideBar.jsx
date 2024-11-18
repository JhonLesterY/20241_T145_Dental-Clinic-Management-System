import React, { useState, useEffect } from "react";
import axios from "axios"; // For making API requests
import Logo from "/src/images/Dental_logo.png";
import { useNavigate } from "react-router-dom";

// Icons
import { MdMenuOpen } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { FaProductHunt } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { CiSettings } from "react-icons/ci";
import { MdOutlineDashboard } from "react-icons/md";

// Menu Items
const menuItems = [
  { icons: <IoHomeOutline size={24} />, label: "Dashboard", path: "/dashboard" },
  { icons: <FaProductHunt size={24} />, label: "Appointment", path: "/appointment" },
  { icons: <MdOutlineDashboard size={24} />, label: "Feedback", path: "/feedback" },
  { icons: <CiSettings size={24} />, label: "Upload Requirements", path: "/upload-requirements" },
  { icons: <CiSettings size={24} />, label: "User Management", path: "/user-management" },
  { icons: <IoLogoBuffer size={24} />, label: "Log Out", path: "/login" },
  { icons: <TbReportSearch size={24} />, label: "Reports", path: "/reports" },
];

export default function Sidebar({ open, setOpen }) {
  const [adminData, setAdminData] = useState({ email: "Loading..." });
  const navigate = useNavigate();

  // Fetch admin details from the backend
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get("/adminRoute/adminServices/getAdmin", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Authentication token
          },
        });
        setAdminData(response.data); // Set admin data from response
      } catch (error) {
        console.error("Error fetching admin data:", error);
        setAdminData({ email: "Error: Unable to fetch data" });
      }
    };

    fetchAdminData();
  }, []);

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
        <MdMenuOpen
          size={28}
          className="cursor-pointer hover:text-gray-200"
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Menu Items */}
      <ul className={`flex-1 px-3 mt-4 ${open ? 'space-y-2' : 'space-y-4'}`}>
        {menuItems.map((item, index) => (
          <li
            key={index}
            onClick={() => navigate(item.path)}
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#2a3a63] transition duration-300 cursor-pointer group"
          >
            <div>{item.icons}</div>
            <p
              className={`text-base transition-all duration-500 ${
                !open && "opacity-0 translate-x-10"
              }`}
            >
              {item.label}
            </p>
            {!open && (
              <span
                className="absolute left-16 bg-white text-[#003367] px-2 py-1 rounded-md shadow-lg 
                opacity-0 group-hover:opacity-100 pointer-events-none"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1e2a4a]">
        <FaUserCircle size={30} />
        <div
          className={`text-sm transition-all duration-500 ${
            !open && "opacity-0 translate-x-10"
          }`}
        >
          <p className="font-semibold">{adminData.email || "N/A"}</p>
          <p className="text-gray-300 text-xs">User</p>
        </div>
      </div>
    </nav>
  );
}
