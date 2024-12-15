import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSideBar from '../components/AdminSideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faFileAlt, faCalendarAlt, faClipboardList, faComments, faCog, faBell, faTooth, faSearch, faUsers, faUserPlus, faUserMd } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const AdminUserManagement = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);   
    const { isDarkMode } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAdminData, setNewAdminData] = useState({ 
     fullname: '', 
      email: '', 
      permissionLevel: 'STANDARD',
      permissions: {
          manageUsers: false,
          manageAppointments: false,
          viewReports: false,
          managePermissions: false,
          manageInventory: false,
          manageCalendar: false
      }
    });
    const [patients, setPatients] = useState([]);
    const [showDentistModal, setShowDentistModal] = useState(false);
    const [dentists, setDentists] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [dentistFormData, setDentistFormData] = useState({
      name: '',
      email: '',
      phoneNumber: ''
    });
      const [error, setError] = useState(null);
      const [isLocked, setIsLocked] = useState(false);
      const [lockMessage, setLockMessage] = useState('');
      const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
      const [selectedAdmin, setSelectedAdmin] = useState(null);
      const [permissions, setPermissions] = useState({
          manageUsers: false,
          manageAppointments: false,
          viewReports: false,
          managePermissions: false,
          manageInventory: false,
          manageCalendar: false
      });
      const [currentAdmin, setCurrentAdmin] = useState(null);
      const [selectedTable, setSelectedTable] = useState('patients');

      

    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value.toLowerCase());
    };

    // Add these filter functions
    const filterPatients = (patients) => {
      if (!Array.isArray(patients)) return [];
      
      console.log('Search Query:', searchQuery); // Debug log
      console.log('Patients:', patients); // Debug log
      
      return patients.filter(patient => {
          const searchIn = searchQuery.toLowerCase();
          const patientIdMatch = patient?.patient_id?.toString().toLowerCase().includes(searchIn);
          const nameMatch = patient?.fullname?.toLowerCase().includes(searchIn);
          const emailMatch = patient?.email?.toLowerCase().includes(searchIn);
          
          console.log('Patient:', patient.fullname, 'Matches:', { patientIdMatch, nameMatch, emailMatch }); // Debug log
          
          return patientIdMatch || nameMatch || emailMatch;
      });
    };

    const filterDentists = (dentists) => {
      if (!Array.isArray(dentists)) return [];
      return dentists.filter(dentist => 
          dentist?.dentist_id?.toString().toLowerCase().includes(searchQuery) ||
          dentist?.name?.toLowerCase().includes(searchQuery) ||
          dentist?.email?.toLowerCase().includes(searchQuery)
      );
    };

    const filterAdmins = (admins) => {
      if (!Array.isArray(admins)) return [];
      return admins.filter(admin => 
          admin?.admin_id?.toString().toLowerCase().includes(searchQuery) ||
          admin?.fullname?.toLowerCase().includes(searchQuery) ||
          admin?.email?.toLowerCase().includes(searchQuery)
      );
    };

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewAdminData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handlePermissionCheckbox = (e) => {
      const { name, checked } = e.target;
      setNewAdminData(prev => ({
          ...prev,
          permissions: {
              ...prev.permissions,
              [name]: checked
          }
      }));
    };

    const checkLock = async () => {
      try {
          const token = sessionStorage.getItem('token');
          const response = await fetch('http://localhost:5000/admin/check-user-lock', {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          
          const data = await response.json();
          
          if (data.locked) {
              const message = data.holder === data.currentUserId
                  ? `You already have a lock on this resource. It will expire in ${data.remainingTime} seconds.`
                  : `Another admin is currently adding a user. Please wait for ${data.remainingTime} seconds or wait for them to finish.`;
              
              alert(message);
              return true;
          }
          
          return false;
      } catch (error) {
          console.error('Error checking lock:', error);
          alert('Failed to check resource lock');
          return true;
      }
  };

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // If the admin is HIGH level, set all permissions to true
      const permissions = newAdminData.permissionLevel === 'HIGH' ? {
          manageUsers: true,
          manageAppointments: true,
          viewReports: true,
          managePermissions: true,
          manageInventory: true,
          manageCalendar: true
      } : newAdminData.permissions;

      const adminData = {
          ...newAdminData,
          permissions
      };

      try {
        const token = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:5000/admin/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(adminData)
        });

        if (response.ok) {
            setIsModalOpen(false);
            fetchAdmins();
            setNewAdminData({
                fullname: '',
                email: '',
                permissionLevel: 'STANDARD',
                permissions: {
                    manageUsers: false,
                    manageAppointments: false,
                    viewReports: false,
                    managePermissions: false,
                    manageInventory: false,
                    manageCalendar: false
                }
            });
        } else {
            const data = await response.json();
            throw new Error(data.message || 'Failed to create admin');
        }
      } catch (error) {
        console.error('Error creating admin:', error);
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
                  'Authorization': `Bearer ${sessionStorage.getItem('token')
}`              }
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
                  'Authorization': `Bearer ${sessionStorage.getItem('token')
}`              }
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
          const token = sessionStorage.getItem('token');
          if (!token) {
              throw new Error('No authentication token found');
          }

          const response = await fetch('http://localhost:5000/admin/patients', {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });

          if (!response.ok) {
              throw new Error('Failed to fetch patients');
          }

          const data = await response.json();
          console.log('Fetched patients:', data); // Debug log
          setPatients(data);
      } catch (error) {
          console.error('Error fetching patients:', error);
          setError(error.message);
      }
  };

  const handleCreateDentist = async (e) => {
    e.preventDefault();
    
    // Check lock first
    const isCurrentlyLocked = await checkLock();
    if (isCurrentlyLocked) {
        return;
    }

    try {
        const requestData = {
            name: dentistFormData.name,
            email: dentistFormData.email,
            phoneNumber: dentistFormData.phoneNumber
        };

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
            phoneNumber: ''
        });
        fetchDentists();
        alert('Dentist created successfully! Verification email has been sent.');
    } catch (error) {
        console.error('Error creating dentist:', error);
        setError(error.message || 'Failed to create dentist');
    } finally {
        // Release the lock
        try {
            const token = sessionStorage.getItem('token');
            await fetch('http://localhost:5000/admin/release-user-lock', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error releasing lock:', error);
        }
    }
  };

  const handleDeleteDentist = async (dentistId) => {
      if (!window.confirm('Are you sure you want to delete this dentist? This action cannot be undone.')) {
          return;
      }

      try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/admin/dentists/${dentistId}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (response.status === 423) {
              const data = await response.json();
              alert(data.message);
              return;
          }

          if (response.ok) {
              fetchDentists();
          } else {
              const data = await response.json();
              throw new Error(data.message || 'Failed to delete dentist');
          }
      } catch (error) {
          console.error('Error deleting dentist:', error);
          alert(error.message);
      }
  };

  const handleDeletePatient = async (patientId) => {
      if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
          return;
      }

      try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/admin/patients/${patientId}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (response.ok) {
              fetchAllPatients();
          } else {
              const data = await response.json();
              throw new Error(data.message || 'Failed to delete patient');
          }
      } catch (error) {
          console.error('Error deleting patient:', error);
          alert(error.message);
      }
  };

  const handleDeleteAdmin = async (adminId) => {
      if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
          return;
      }

      try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/admin/admins/${adminId}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (response.ok) {
              fetchAdmins();
          } else {
              const data = await response.json();
              throw new Error(data.message || 'Failed to delete admin');
          }
      } catch (error) {
          console.error('Error deleting admin:', error);
          alert(error.message);
      }
  };

  const handlePermissionChange = (permission) => {
      setPermissions(prev => ({
          ...prev,
          [permission]: !prev[permission]
      }));
  };

  const openPermissionModal = (admin) => {
      console.log('Opening modal for admin:', admin); // Debug log
      setSelectedAdmin(admin);
      setPermissions({
          manageUsers: admin.permissions?.manageUsers || false,
          manageAppointments: admin.permissions?.manageAppointments || false,
          viewReports: admin.permissions?.viewReports || false,
          managePermissions: admin.permissions?.managePermissions || false,
          manageInventory: admin.permissions?.manageInventory || false,
          manageCalendar: admin.permissions?.manageCalendar || false
      });
      setIsPermissionModalOpen(true);
  };

  const handleUpdatePermissions = async () => {
      try {
          const token = sessionStorage.getItem('token');
          console.log('Selected Admin:', selectedAdmin); // Debug log
          
          const response = await fetch(`http://localhost:5000/admin/admin-permissions/${selectedAdmin._id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ permissions })
          });

          const data = await response.json();
          
          if (!response.ok) {
              throw new Error(data.message || 'Failed to update permissions');
          }

          alert('Permissions updated successfully');
          setIsPermissionModalOpen(false);
          fetchAdmins(); // Refresh the admin list
      } catch (error) {
          console.error('Error updating permissions:', error);
          alert('Failed to update permissions: ' + error.message);
      }
  };

  useEffect(() => {
    fetchAllPatients();
  }, []);
  useEffect(() => {
    fetchDentists();
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
      const fetchCurrentAdmin = async () => {
          try {
              const token = sessionStorage.getItem('token');
              const response = await fetch(`http://localhost:5000/admin/current`, {
                  headers: {
                      'Authorization': `Bearer ${token}`
                  }
              });
              const data = await response.json();
              setCurrentAdmin(data);
          } catch (error) {
              console.error('Error fetching current admin:', error);
          }
      };
      fetchCurrentAdmin();
  }, []);

  // Add this function to check permissions
  const hasPermission = (permission) => {
      return currentAdmin?.permissionLevel === 'HIGH' || 
             currentAdmin?.permissions[permission];
  };

  const handlePromoteAdmin = async (adminId) => {
      if (!window.confirm('Are you sure you want to promote this admin to HIGH level?')) {
          return;
      }

      try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/admin/promote/${adminId}`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.message || 'Failed to promote admin');
          }

          alert('Admin promoted successfully');
          fetchAdmins(); // Refresh the admin list
      } catch (error) {
          console.error('Error promoting admin:', error);
          alert(error.message);
      }
  };

  const handleDemoteAdmin = async (adminId) => {
      if (!window.confirm('Are you sure you want to demote this admin from HIGH level? This will remove all their permissions.')) {
          return;
      }

      try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/admin/demote/${adminId}`, {
              method: 'POST',
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          const data = await response.json();
          if (!response.ok) {
              throw new Error(data.message || 'Failed to demote admin');
          }

          alert('Admin demoted successfully');
          fetchAdmins(); // Refresh the admin list
      } catch (error) {
          console.error('Error demoting admin:', error);
          alert(error.message);
      }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
        // Open a modal to select dentist
        const selectedDentist = await showDentistSelectionModal();
        if (!selectedDentist) return;

        const response = await fetch('http://localhost:5000/admin/appointments/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                appointmentId,
                dentistId: selectedDentist.dentist_id
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        // Refresh appointments list
        fetchAppointments();
        alert('Appointment confirmed and assigned to dentist successfully!');
    } catch (error) {
        console.error('Error confirming appointment:', error);
        alert(error.message);
    }
};

  return (
    <div className={`flex h-screen w-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className={`flex-1 flex flex-col transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
            <div className={`w-full flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 shadow-md`}>
                <div className="flex items-center">
                    <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                    <span className={`ml-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        User Management
                    </span>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className={`flex items-center border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-1 ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <FontAwesomeIcon icon={faSearch} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or email..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isDarkMode 
                                ? 'bg-gray-700 text-gray-200 placeholder-gray-400' 
                                : 'bg-white text-gray-900 placeholder-gray-500'
                            }`}
                        />
                    </div>
                    
                    {/* Add Admin and Dentist Buttons */}
                    <button
                        onClick={toggleModal}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                        Add Admin
                    </button>
                    <button
                        onClick={() => setShowDentistModal(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                        <FontAwesomeIcon icon={faUserMd} className="mr-2" />
                        Add Dentist
                    </button>
                    
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
                        <FontAwesomeIcon icon={faBell} className="text-xl text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Add buttons to select table */}
            <div className="flex space-x-4 mb-4 mt-4">
                <button onClick={() => setSelectedTable('patients')} className="bg-blue-600 text-white px-4 py-2 rounded transition duration-200">
                    Patients
                </button>
                <button onClick={() => setSelectedTable('dentists')} className="bg-green-600 text-white px-4 py-2 rounded transition duration-200">
                    Dentists
                </button>
                <button onClick={() => setSelectedTable('admins')} className="bg-purple-600 text-white px-4 py-2 rounded transition duration-200">
                    Admins
                </button>
            </div>

            {/* Conditional rendering of tables based on selected option */}
            <div className={`p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-md`}>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                {selectedTable === 'patients' && (
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
                        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Patient List</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Patient ID
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Name
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Email
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                    {Array.isArray(patients) && patients.length > 0 ? (
                                        filterPatients(patients).map((patient) => {
                                            const patientId = patient?.patient_id || patient?._id;
                                            
                                            if (!patientId) {
                                                console.error('Patient without ID:', patient);
                                                return null;
                                            }

                                            return (
                                                <tr key={patientId} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {patientId}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {patient?.fullname || patient?.name || 'No Name'}
                                                    </td>
                                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                        {patient?.email || 'No Email'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleDeletePatient(patientId)}
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
                                            <td colSpan="4" className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {filterPatients(patients).length === 0 ? 'No matching patients found' : 'Loading patients...'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTable === 'dentists' && (
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden mt-6`}>
                        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dentist List</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Dentist ID
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Name
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Email
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                    {Array.isArray(dentists) && dentists.length > 0 ? (
                                        filterDentists(dentists).map((dentist) => (
                                            <tr key={dentist._id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    {dentist.dentist_id}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    {dentist.name}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
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
                                            <td colSpan="4" className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {filterDentists(dentists).length === 0 ? 'No matching dentists found' : 'Loading dentists...'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTable === 'admins' && (
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden mt-6`}>
                        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin List</h3>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Admin ID
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Name
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Email
                                        </th>
                                        <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                    {Array.isArray(admins) && admins.length > 0 ? (
                                        filterAdmins(admins).map((admin) => (
                                            <tr key={admin._id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    {admin.admin_id}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    {admin.fullname}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                                                    {admin.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    {hasPermission('managePermissions') && (
                                                        <>
                                                            <button
                                                                onClick={() => openPermissionModal(admin)}
                                                                className="bg-blue-100 text-blue-600 hover:text-blue-900 px-4 py-2 rounded mr-2"
                                                            >
                                                                Manage Permissions
                                                            </button>
                                                            {admin.permissionLevel !== 'HIGH' && (
                                                                <button
                                                                    onClick={() => handlePromoteAdmin(admin._id)}
                                                                    className="bg-purple-100 text-purple-600 hover:text-purple-900 px-4 py-2 rounded mr-2"
                                                                >
                                                                    Promote to HIGH
                                                                </button>
                                                            )}
                                                            {admin.permissionLevel === 'HIGH' && currentAdmin?.permissionLevel === 'HIGH' && (
                                                                <button
                                                                    onClick={() => handleDemoteAdmin(admin._id)}
                                                                    className="bg-yellow-100 text-yellow-600 hover:text-yellow-900 px-4 py-2 rounded mr-2"
                                                                >
                                                                    Demote from HIGH
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteAdmin(admin._id)}
                                                        className="bg-red-100 text-red-600 hover:text-red-900 px-4 py-2 rounded"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {filterAdmins(admins).length === 0 ? 'No matching admins found' : 'Loading admins...'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
                        {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-2xl font-bold mb-4 text-black">Add New Admin</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <input
                                    type="text"
                                    name="fullname"
                                    placeholder="Full Name"
                                    value={newAdminData.fullname}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md bg-white"
                                />
                            </div>
                            <div className="mb-4">
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={newAdminData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md bg-white"
                                />
                                <p className="text-sm text-gray-600 mt-2">
                                    Note: Admin will receive verification email to login with Google account
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-black mb-2">Permission Level</label>
                                <select
                                    name="permissionLevel"
                                    value={newAdminData.permissionLevel}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border rounded-md bg-white text-black"
                                >
                                    <option value="STANDARD">Standard</option>
                                    <option value="HIGH">High Level</option>
                                </select>
                            </div>

                            {/* Keep existing permission checkboxes for STANDARD level */}
                            {newAdminData.permissionLevel === 'STANDARD' && (
                                <div className="mb-4">
                                    <label className="block text-black mb-2">Permissions</label>
                                    {Object.keys(newAdminData.permissions).map(permission => (
                                        <div key={permission} className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                name={permission}
                                                checked={newAdminData.permissions[permission]}
                                                onChange={handlePermissionCheckbox}
                                                className="mr-2"
                                            />
                                            <label className="text-black capitalize">
                                                {permission.replace(/([A-Z])/g, ' $1').trim()}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-end space-x-2">
                                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded transition duration-200">
                                    Add Admin
                                </button>
                                <button 
                                    type="button" 
                                    onClick={toggleModal} 
                                    className="bg-gray-300 py-2 px-4 rounded transition duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
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
                        <p className="text-sm text-gray-500 mb-4">
                        The dentist will receive an email to verify their account and set up Google login.
                        </p>
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
                        <div className="flex justify-end space-x-3">
                            <button
                            type="button"
                            onClick={() => setShowDentistModal(false)}
                            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md transition duration-200"
                            >
                            Cancel
                            </button>
                            <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
                            >
                            Create
                            </button>
                        </div>
                        </form>
                    </div>
                    </div>
                </div>
                )}
                {isPermissionModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-2xl font-bold mb-4 text-black">
                            Manage Permissions for {selectedAdmin?.fullname}
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(permissions).map(([key, value]) => (
                                <div key={key} className="flex items-center text-black">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={() => handlePermissionChange(key)}
                                        className="mr-2"
                                    />
                                    <label className="capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                </div>
                            ))}
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    onClick={() => setIsPermissionModalOpen(false)}
                                    className="bg-gray-300 text-black py-2 px-4 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdatePermissions}
                                    className="bg-blue-500 text-white py-2 px-4 rounded"
                                >
                                    Update Permissions
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default AdminUserManagement;