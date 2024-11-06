import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faFileAlt, faCalendarAlt, faClipboardList, faComments, faCog, faBell, faTooth, faChartLine, faClipboardCheck, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ fullname: '', email: '', password: '' });

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
  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Toggle the modal visibility
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Handle form inputs for new admin
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdminData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Submit the form to add a new admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdminData),
      });
      if (response.ok) {
        alert('Admin added successfully');
        toggleModal(); // Close modal on success
      } else {
        console.error('Failed to add admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
    }
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

        {/* Add Admin Button */}
        <button onClick={toggleModal} className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Admin
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        {/* Main Navbar */}
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
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

          <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
            <FontAwesomeIcon icon={faBell} className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Add Admin Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-2xl font-bold mb-4">Add New Admin</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Full Name"
                  onChange={handleInputChange}
                  value={newAdminData.fullname}
                  required
                  className="w-full p-2 mb-2 border border-white-300 rounded bg-white "
                />
                <input
                  type="email"
                  name="email"  
                  placeholder="Email"
                  onChange={handleInputChange}
                  value={newAdminData.email}
                  required
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleInputChange}
                  value={newAdminData.password}
                  required
                  className="w-full p-2 mb-2 border border-gray-300 rounded"
                />
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded mt-4">Add Admin</button>
                <button type="button" onClick={toggleModal} className="ml-2 bg-gray-300 py-2 px-4 rounded mt-4">Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
