import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faFileAlt, faCalendarAlt, faClipboardList, faComments, faCog, faBell, faTooth, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ fullname: '', email: '', password: '' });
  const [deleteUserData, setDeleteUserData] = useState({ email: '' });
  const [patients, setPatients] = useState([]);
    const [error, setError] = useState(null);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleDeleteModal = () => setIsDeleteModalOpen(!isDeleteModalOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdminData((prevData) => ({ ...prevData, [name]: value }));
  };
  
  const handleDeleteInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteUserData((prevData) => ({ ...prevData, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem('token');
    console.log('Token:', token); 

    if (!token) {
      console.error('No token found, user not authorized.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAdminData),
      });
      if (response.ok) {
        alert('Admin added successfully');
        toggleModal();
      } else {
        console.error('Failed to add admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };
  const handleDeleteUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/admin/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deleteUserData),
      });
      if (response.ok) {
        alert('User deleted successfully');
        toggleDeleteModal();
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };


  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message = "Are you sure you want to leave? You will be logged out.";
      event.returnValue = message;
      return message;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);


  const handleDeletePatient = async (patientId) => {
    try {
        const token = sessionStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log('Deleting patient with ID:', patientId);

        const response = await fetch(`http://localhost:5000/admin/patients/${patientId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Add this line
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete patient');
        }

        // Success
        alert('Patient deleted successfully');
        fetchAllPatients(); // Refresh the list
    } catch (error) {
        console.error('Delete error:', error);
        alert(error.message);
    }
};

const fetchAllPatients = async () => {
  try {
      const token = sessionStorage.getItem('token');
      console.log('Fetching patients...');

      const response = await fetch('http://localhost:5000/admin/patients', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
          },
          credentials: 'include'
      });

      if (response.ok) {
          const data = await response.json();
          console.log('Raw patients data:', JSON.stringify(data, null, 2)); // Log the full data structure
          setPatients(data);
      } else {
          const errorData = await response.json();
          console.error('Error fetching patients:', errorData);
          setError(errorData.message || 'Failed to fetch patients');
      }
  } catch (error) {
      console.error('Fetch error:', error);
      setError('Error fetching patients');
  }
};

useEffect(() => {
  fetchAllPatients();
}, []);


  return (
    <div className="flex h-screen w-screen">
      {/* Sidebar */}
      <div className="bg-gray-800 text-white w-1/4 lg:w-1/5 p-6 flex flex-col">
        {/* Profile Section */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/admin-profile" className="flex items-center">
            <img src="/src/assets/profile.jpg" alt="Profile" className="w-10 h-10 rounded-full mr-2" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold">Admin Name</span>
            </div>
          </Link>
        </div>

        <div className="mb-8 bg-blue-300 p-4 rounded-lg text-center shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900">
            <FontAwesomeIcon icon={faTooth} className="mr-3" /> BukSU Dental Clinic
          </h1>
        </div>

        <nav className="flex-1">
          <ul className="space-y-4">
            {['Dashboard', 'View Appointment', 'Calendar'].map((item, index) => (
              <li key={index}>
                <Link
                  to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                  className="flex items-center text-white text-lg transition duration-200 rounded p-2 hover:bg-blue-600"
                >
                  <FontAwesomeIcon icon={[faThLarge, faFileAlt, faCalendarAlt][index]} className="mr-3" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-4 mt-8">
            {['Inventory', 'View Feedback', 'Settings'].map((item, index) => (
              <li key={index}>
                <Link
                  to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                  className="flex items-center text-white text-lg transition duration-200 rounded p-2 hover:bg-blue-600"
                >
                  <FontAwesomeIcon icon={[faClipboardList, faComments, faCog][index]} className="mr-3" />
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Add Admin and Logout Button */}
        <button onClick={toggleModal} className="mt-4 mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Admin
        </button>
        <button onClick={toggleDeleteModal} className="mt-4 w-full bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded">
          Delete User
        </button>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100">
        <div className="flex items-center justify-between bg-white p-4 shadow-md">
          <div className="flex items-center">
            <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
            <span className="ml-2 text-2xl font-bold text-gray-800">Dashboard</span>
          </div>
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

        {/* Add this new section for patients list */}
        <div className="p-6">
    {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
        </div>
    )}
    
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
            <h3 className="text-2xl font-bold">Patient List</h3>
        </div>
        
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients && patients.length > 0 ? (
                      patients.map((patient) => {
                          // Log the patient object to see its structure
                          console.log('Current patient object:', patient);
                          
                          // Safely get the patient ID
                          const patientId = patient?.patient_id || patient?._id;
                          
                          if (!patientId) {
                              console.error('Patient without ID:', patient);
                              return null; // Skip rendering this row
                          }

                          return (
                              <tr key={patientId} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-white">
                                      {patientId}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-white">
                                      {patient?.fullname || patient?.name || 'No Name'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-white">
                                      {patient?.email || 'No Email'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium bg-white">
                                      <button
                                          onClick={() => {
                                              console.log('Delete clicked for patient:', patientId);
                                              handleDeletePatient(patientId);
                                          }}
                                          className="bg-red-100 text-red-600 hover:text-red-900 px-4 py-2 rounded"
                                      >
                                          Delete
                                      </button>
                                  </td>
                              </tr>
                          );
                      })
                  ) : (
                      <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                              {Array.isArray(patients) ? 'No patients found' : 'Loading patients...'}
                          </td>
                      </tr>
                  )}
              </tbody>
            </table>
        </div>
    </div>  
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
                  className="w-full p-2 mb-2 border border-gray-300 rounded bg-white"
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

         {/* Delete User Modal */}
         {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Delete User</h2>
              <form onSubmit={handleDeleteUser}>
                <input
                  type="email"
                  name="email"
                  placeholder="User Email"
                  onChange={handleDeleteInputChange}
                  value={deleteUserData.email}
                  required
                  className="w-full p-2 mb-4 border border-gray-300 rounded"
                />
                <div className="flex justify-end space-x-2">
                  <button type="submit" className="bg-red-500 text-white py-2 px-4 rounded">Delete User</button>
                  <button type="button" onClick={toggleDeleteModal} className="bg-gray-300 py-2 px-4 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;