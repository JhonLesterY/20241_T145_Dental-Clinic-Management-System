import React, { useState, useEffect } from "react";
import axios from "axios"; // For making API requests
import Logo from "/src/images/Dental_logo.png";

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
  { icons: <IoHomeOutline size={24} />, label: "Home" },
  { icons: <FaProductHunt size={24} />, label: "Products" },
  { icons: <MdOutlineDashboard size={24} />, label: "Dashboard" },
  { icons: <CiSettings size={24} />, label: "Settings" },
  { icons: <IoLogoBuffer size={24} />, label: "Log" },
  { icons: <TbReportSearch size={24} />, label: "Reports" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [adminData, setAdminData] = useState({ email: "Loading..." });

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
      className={`fixed top-0 left-0 shadow-lg h-screen flex flex-col transition-all duration-500 bg-[#003367] text-white ${
        open ? "w-64" : "w-16"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0055A4]">
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
      <ul className="flex-1 overflow-y-auto space-y-2 px-3 mt-4">
        {menuItems.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#0055A4] transition duration-300 cursor-pointer group"
          >
            <div>{item.icons}</div>
            <p
              className={`text-base transition-all duration-500 ${
                !open && "opacity-0 translate-x-10"
              }`}
            >
              {item.label}
            </p>
            <span
              className={`absolute left-16 bg-white text-[#003367] px-2 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-hover:left-12 transition-all duration-300 ${
                open && "hidden"
              }`}
            >
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#0055A4]">
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
