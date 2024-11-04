import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTooth,
  faThLarge,
  faFileAlt,
  faCalendarAlt,
  faClipboardList,
  faComments,
  faCog,
  faBell,
} from '@fortawesome/free-solid-svg-icons';

const Admin_Profile = () => {
  const [profileImage, setProfileImage] = useState('/src/assets/default-profile.jpg');
  const [formData, setFormData] = useState({
    FirstName: '',
    MiddleName: '',
    LastName: '',
    SuffixName: '',
    ContactNumber: '',
    Email: '',
    SexAtBirth: '',
    Birthday: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogout = () => {
    console.log("User logged out");
    // Add logout functionality here, like clearing tokens or redirecting to login
  };

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
                    icon={[faThLarge, faFileAlt, faCalendarAlt][index]} 
                    className="mr-3" 
                  />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-4 mt-80">
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
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
          {/* UniCare Logo */}
          <div className="flex items-center">
            <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
            <span className="ml-2 text-2xl font-bold text-gray-800">Profile</span>
          </div>

          {/* Notification Button */}
          <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <FontAwesomeIcon icon={faBell} className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 flex flex-col items-center">
          {/* Profile Image Upload */}
          <div className="mb-6 text-center relative">
            <img src={profileImage} alt="Profile" className="w-36 h-36 rounded-full border-6 border-white shadow-md" />
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full shadow-lg cursor-pointer">
              <input type="file" onChange={handleImageChange} className="hidden" />
              <span className="material-icons">camera_alt</span>
            </label>
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-6xl bg-gray-50 p-9 rounded-lg shadow-inner">
            {Object.keys(formData).map((field, idx) => (
              <div key={idx} className="flex flex-col mb-4">
                <label className="text-md font-semibold text-gray-700">
                  {field === 'SexAtBirth' ? 'Sex at Birth' : field === 'SuffixName' ? 'Suffix Name' : field.replace(/([A-Z])/g, ' $1')}
                </label>
                {field === 'SexAtBirth' ? (
                  <select
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : field === 'SuffixName' ? (
                  <select
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="">Select Suffix</option>
                    <option value="Jr">Jr</option>
                    <option value="Sr">Sr</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                ) : (
                  <input
                    type={field === 'Email' ? 'email' : field === 'Birthday' ? 'date' : 'text'}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className="mt-1 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                    placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1')}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="mt-6 px-6 py-3 bg-red-500 text-white font-semibold rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 transition duration-150 ease-in-out"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin_Profile;
