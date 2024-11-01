import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faThLarge, 
  faFileAlt, 
  faCalendarAlt, 
  faClipboardList, 
  faComments, 
  faCog, 
  faBell, 
  faTooth, 
  faChartLine,  
  faClipboardCheck, 
  faSearch 
} from '@fortawesome/free-solid-svg-icons';

import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Example patient data for demonstration
  const patientData = [
    { id: 1, name: 'John Doe', appointment: '2024-10-30', status: 'Completed' },
    { id: 2, name: 'Jane Smith', appointment: '2024-10-31', status: 'Pending' },
    { id: 3, name: 'Emily Johnson', appointment: '2024-11-01', status: 'Completed' },
  ];

  // Filtered patient data based on search query
  const filteredPatients = patientData.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
            <span className="ml-2 text-2xl font-bold text-gray-800">Dashboard</span>
          </div>

          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1">
            <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="border-none focus:outline-none ml-2"
            />
          </div>

          {/* Notification Button */}
          <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <FontAwesomeIcon icon={faBell} className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <FontAwesomeIcon icon={faChartLine} className="text-3xl mr-4 text-gray-700" />
              <h2 className="text-3xl font-bold mb-4">Generate Report</h2>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <FontAwesomeIcon icon={faClipboardCheck} className="text-3xl mr-4 text-gray-700" />
              <h2 className="text-3xl font-bold mb-4">Accomplishment Report</h2>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 col-span-2">
            <h2 className="text-3xl font-bold mb-4">Patient History Information</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="text-2xl px-4 py-2 text-left">ID</th>
                    <th className="text-2xl px-4 py-2 text-left">Name</th>
                    <th className="text-2xl px-4 py-2 text-left">Appointment</th>
                    <th className="text-2xl px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-100">
                        <td className="px-4 py-2">{patient.id}</td>
                        <td className="px-4 py-2">{patient.name}</td>
                        <td className="px-4 py-2">{patient.appointment}</td>
                        <td className="px-4 py-2">{patient.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4">No patients found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
