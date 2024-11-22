import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faFileAlt, faCalendarAlt, faClipboardList, faComments, faCog, faBell, faTooth, faSearch, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({ fullname: '', email: '', password: '' });
  const [patients, setPatients] = useState([]);
  const [showDentistModal, setShowDentistModal] = useState(false);
  const [dentists, setDentists] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [dentistFormData, setDentistFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    dentist_id: '' // Add this field
  });
    const [error, setError] = useState(null);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAdminData((prevData) => ({ ...prevData, [name]: value }));
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullname: newAdminData.fullname,
          email: newAdminData.email
        }),
      });

      if (response.ok) {
        alert('Admin added successfully. Login credentials have been sent to their email.');
        toggleModal();
        // Reset form
        setNewAdminData({ fullname: '', email: '', password: '' });
        // Refresh admin list
        fetchAdmins();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      alert(error.message);
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

  const fetchDentists = async () => {
    try {
        const response = await fetch('http://localhost:5000/admin/dentists', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch dentists');
        }
        const data = await response.json();
        setDentists(data);
    } catch (error) {
        console.error('Error fetching dentists:', error);
        setError(error.message);
    }
};

const fetchAdmins = async () => {
    try {
        const response = await fetch('http://localhost:5000/admin/admins', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch admins');
        }
        const data = await response.json();
        setAdmins(data);
    } catch (error) {
        console.error('Error fetching admins:', error);
        setError(error.message);
    }
};

const fetchAllPatients = async () => {
    try {
        const response = await fetch('http://localhost:5000/admin/patients', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch patients');
        }
        const data = await response.json();
        setPatients(data);
    } catch (error) {
        console.error('Error fetching patients:', error);
        setError(error.message);
    }
};

const handleCreateDentist = async (e) => {
  e.preventDefault();
  try {
    const requestData = {
      name: dentistFormData.name,
      email: dentistFormData.email,
      password: dentistFormData.password,
      phoneNumber: dentistFormData.phoneNumber
    };

    console.log('Sending request with data:', requestData);

    const createResponse = await fetch('http://localhost:5000/admin/add-dentist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify(requestData)
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || 'Failed to create dentist');
    }

    const data = await createResponse.json();
    setShowDentistModal(false);
    setDentistFormData({
      name: '',
      email: '',
      password: '',
      phoneNumber: ''
    });
    fetchDentists();
    alert('Dentist created successfully!');
  } catch (error) {
    console.error('Error creating dentist:', error);
    setError(error.message || 'Failed to create dentist');
  }
};

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


const handleDeleteDentist = async (dentistId) => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Attempting to delete dentist with ID:', dentistId);

    const response = await fetch(`http://localhost:5000/admin/dentists/${dentistId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete dentist');
    }

    // Success - refresh the dentist list
    await fetchDentists();
    alert('Dentist deleted successfully');
  } catch (error) {
    console.error('Error deleting dentist:', error);
    setError('Failed to delete dentist: ' + error.message);
  }
};

const handleDeleteAdmin = async (adminId) => {
  try {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`http://localhost:5000/admin/admins/${adminId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete admin');
    }

    // Success - refresh the admin list
    await fetchAdmins();
    alert('Admin deleted successfully');
  } catch (error) {
    console.error('Error deleting admin:', error);
    setError('Failed to delete admin: ' + error.message);
  }
};



useEffect(() => {
  fetchDentists();
}, []);

useEffect(() => {
  fetchAdmins();
}, []);

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
              {/* First group of navigation items */}
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

              {/* Second group of navigation items */}
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

              {/* User Management link - separate from other groups */}
              <ul className="space-y-4 mt-8">
                <li>
                  <Link
                    to="/admin-userManagement"
                    className="flex items-center text-white text-lg transition duration-200 rounded p-2 hover:bg-blue-600"
                  >
                    <FontAwesomeIcon icon={faUsers} className="mr-3" />
                    User Management
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Add Admin and Logout Buttons */}
            <button 
              onClick={toggleModal} 
              className="mt-4 mb-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Admin
            </button>
            <button
              onClick={() => setShowDentistModal(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Dentist
            </button>
            <button 
              onClick={handleLogout} 
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
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
              className="border-none focus:outline-none ml-2 bg-white"
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
        {/* Dentist List Section */}
<div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
    <div className="p-4 border-b">
        <h3 className="text-2xl font-bold">Dentist List</h3>
    </div>
    
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dentist ID
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
                {dentists.length > 0 ? (
                    dentists.map((dentist) => (
                        <tr key={dentist._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {dentist.dentist_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {dentist.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {dentist.email}
                            </td>
                            
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleDeleteDentist(dentist.dentist_id)}
                                    className="bg-red-100 text-red-600 hover:text-red-900 px-4 py-2 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            No dentists found
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</div>
</div>  
<div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
    <div className="p-4 border-b">
        <h3 className="text-2xl font-bold">Admin List</h3>
    </div>
    
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin ID
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
                {admins.length > 0 ? (
                    admins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {admin.admin_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {admin.fullname}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {admin.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                    onClick={() => handleDeleteAdmin(admin.admin_id)}
                                    className="bg-red-100 text-red-600 hover:text-red-900 px-4 py-2 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            No admins found
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
      <h2 className="text-2xl font-bold mb-4 text-black">Add New Admin</h2>
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
          className="w-full p-2 mb-2 border border-gray-300 rounded bg-white"
        />
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded mt-4">Add Admin</button>
        <button type="button" onClick={toggleModal} className="ml-2 bg-gray-300 py-2 px-4 rounded mt-4">Cancel</button>
      </form>
    </div>
  </div>
)}
         {/* Create Dentist Modal */}
    {showDentistModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Add Dentist</h3>
            <form onSubmit={handleCreateDentist}>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  value={dentistFormData.name}
                  onChange={(e) => setDentistFormData({
                    ...dentistFormData,
                    name: e.target.value
                  })}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  value={dentistFormData.email}
                  onChange={(e) => setDentistFormData({
                    ...dentistFormData,
                    email: e.target.value
                  })}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  value={dentistFormData.password}
                  onChange={(e) => setDentistFormData({
                    ...dentistFormData,
                    password: e.target.value
                  })}
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-3 py-2 border rounded-md bg-white"
                  value={dentistFormData.phoneNumber}
                  onChange={(e) => setDentistFormData({
                    ...dentistFormData,
                    phoneNumber: e.target.value
                  })}
                  required
                />
              </div>
              {error && (
                <div className="mb-4 text-red-500 text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDentistModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

      </div>
    </div>
  );
};

export default AdminDashboard;