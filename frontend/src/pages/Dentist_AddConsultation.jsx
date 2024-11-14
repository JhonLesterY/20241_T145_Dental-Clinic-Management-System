import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Home from "../components/Home";
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import magnify from '/src/images/magnifying-glass.png';

const Dentist_AddConsultation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    schoolId: '',
    scheduleTime: '',
    consultationContent: '',
    contactNumber: '',
    sexAtBirth: 'male', // default value
  });

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle form data change
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-[#003367] text-white">
        <Home />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center bg-gray-50 border">
        {/* Header */}
        <header className="w-full shadow-lg">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and Add Consultation Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="Dental Logo" />
              <Link to="/dentist-addConsultation" className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition">
                Add Consultation
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
        <div className=" w-[95rem] mx-auto my-4"></div>

        {/* Main Content Area */}
        <div className="space-y-4 mt-5 mx-auto w-full max-w-4xl px-4">
          {/* Title */}
          <div className="text-3xl font-semibold text-[#003367] mb-6 text-center">Add New Record of Consultation</div>

          {/* Consultation Form */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* ID Field */}
            <div className="border shadow-md p-4 rounded-xl bg-white border">
              <label className="block mb-2 font-semibold">ID</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
                placeholder="Enter ID"
              />
            </div>

            {/* School ID Field */}
            <div className="border shadow-md p-4 rounded-xl bg-white border">
              <label className="block mb-2 font-semibold">School ID</label>
              <input
                type="text"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
                placeholder="Enter School ID"
              />
            </div>

            {/* Schedule Time Field */}
            <div className="border shadow-md p-4 rounded-xl bg-white border">
              <label className="block mb-2 font-semibold">Schedule Time</label>
              <input
                type="text"
                name="scheduleTime"
                value={formData.scheduleTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
                placeholder="Enter Schedule Time"
              />
            </div>

            {/* Consultation Content Field */}
            <div className="border shadow-md p-4 rounded-xl bg-white">
              <label className="block mb-2 font-semibold">Consultation Content</label>
              <input
                type="text"
                name="consultationContent"
                value={formData.consultationContent}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
                placeholder="Enter Consultation Content"
              />
            </div>

            {/* Contact Number Field */}
            <div className="border shadow-md p-4 rounded-xl bg-white">
              <label className="block mb-2 font-semibold">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
                placeholder="Enter Contact Number"
              />
            </div>

            {/* Sex at Birth Field */}
            <div className="border shadow-md p-4 rounded-xl bg-white border">
              <label className="block mb-2 font-semibold">Sex at Birth</label>
              <select
                name="sexAtBirth"
                value={formData.sexAtBirth}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Back and Submit Buttons */}
          <div className="flex justify-between w-full max-w-4xl mx-auto">
            <NavLink
              to="/dentist-viewConsultation"
              className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-5 py-2 bg-[#003367] text-white transform hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              Back
            </NavLink>
            <NavLink
              to="/appointment-confirmation"
              className="cursor-pointer shadow-sm hover:shadow-lg rounded-xl px-5 py-2 bg-[#003367] text-white transform hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              Submit
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dentist_AddConsultation;
