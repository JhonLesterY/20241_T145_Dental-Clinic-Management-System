import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import { FaCheck, FaTimes, FaEye, FaFileAlt } from 'react-icons/fa'; // For confirm/decline icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Admin_ViewAppointment = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate(); // Initialize useNavigate
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAppointments();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchAppointments();
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Add useEffect for filtering appointments based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = appointments.filter(appointment => 
      appointment.appointmentId?.toLowerCase().includes(query) ||
      appointment.patientName?.toLowerCase().includes(query) ||
      new Date(appointment.appointmentDate).toLocaleDateString().toLowerCase().includes(query) ||
      appointment.appointmentTime?.toLowerCase().includes(query) ||
      appointment.status?.toLowerCase().includes(query)
    );
    setFilteredAppointments(filtered);
  }, [searchQuery, appointments]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/appointments', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      console.log('Fetched appointments:', data);
      setAppointments(data);
      setFilteredAppointments(data); // Initialize filtered appointments with all appointments
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setUpdateStatus({ loading: true, error: null });
      
      console.log('Updating status for appointment:', appointmentId); // Debug log
      
      const response = await fetch(`http://localhost:5000/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update appointment status');
      }
  
      const updatedAppointment = await response.json();
      console.log('Updated appointment:', updatedAppointment); // Debug log
  
      // Update local state
      setAppointments(prevAppointments => 
        prevAppointments.map(appointment => 
          appointment.appointmentId === appointmentId 
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
  
      alert(`Appointment ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert(error.message || 'Failed to update appointment status');
    } finally {
      setUpdateStatus({ loading: false, error: null });
    }
  };

  const confirmStatusUpdate = (appointmentId, newStatus) => {
    const action = newStatus === 'confirmed' ? 'confirm' : 'decline';
    if (window.confirm(`Are you sure you want to ${action} this appointment?`)) {
      handleStatusUpdate(appointmentId, newStatus);
    }
  };

  const handleViewDocuments = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDocumentModal(true);
  };

  const DocumentModal = ({ appointment, onClose }) => {
    const documents = [
      { type: 'School ID', data: appointment.requirements?.schoolId },
      { type: 'Registration Certificate', data: appointment.requirements?.registrationCert },
      { type: 'Vaccination Card', data: appointment.requirements?.vaccinationCard }
    ];

    const handleViewFile = async (fileId) => {
      try {
        const response = await fetch(`http://localhost:5000/upload/file/${fileId}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (data.viewLink) {
          window.open(data.viewLink, '_blank');
        }
      } catch (error) {
        console.error('Error viewing file:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Required Documents</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaFileAlt className="text-blue-500" />
                    <span className="font-medium">{doc.type}</span>
                  </div>
                  {doc.data ? (
                    <button
                      onClick={() => handleViewFile(doc.data.fileId)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <FaEye className="mr-2" />
                      View File
                    </button>
                  ) : (
                    <span className="text-red-500 text-sm">Not uploaded</span>
                  )}
                </div>
                {doc.data && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Filename: {doc.data.fileName}</p>
                    <p>Uploaded: {new Date(doc.data.uploadedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
};

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className={`flex h-screen w-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {isLoading ? (
        <>
          <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
          
          <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"} relative`}>
            {/* Blurred overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-10">
              <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading Appointments...</h2>
              </div>
            </div>
            
            {/* Placeholder header */}
            <div className={`flex items-center justify-between p-4 shadow-md rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center">
                <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                <span className={`ml-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>View Appointments</span>
              </div>
            </div>
            
            {/* Placeholder main content */}
            <div className="flex-1 p-6"></div>
          </div>
        </>
      ) : (
        <>
          <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
          
          {/* Main Content */}
          <div className={`flex-1 p-8 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
            <div className={`flex items-center justify-between p-4 shadow-md rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center">
                <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                <span className={`ml-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>View Appointments</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin-confirmedAppointments')} // Correctly call navigate
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Confirmed Appointments
                </button>
                <div className={`flex items-center border rounded-lg px-3 py-1 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                  <FontAwesomeIcon icon={faSearch} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Search by name, ID, or email..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className={`ml-2 outline-none ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
                  />
                </div>
              </div>
            </div>
            
            <div className={`rounded-lg shadow-md overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Appointment ID
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Patient Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Date
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Time
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.appointmentId} className={`${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {appointment.appointmentId}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {appointment.patientName}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {appointment.appointmentTime}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            appointment.status === 'declined' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {appointment.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDocuments(appointment)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <FaEye className="mr-2" />
                              View Files
                            </button>
                            <button
                              onClick={() => confirmStatusUpdate(appointment.appointmentId, 'confirmed')}
                              disabled={updateStatus.loading}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              <FaCheck className="mr-2" />
                              Accept
                            </button>
                            <button
                              onClick={() => confirmStatusUpdate(appointment.appointmentId, 'declined')}
                              disabled={updateStatus.loading}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                              <FaTimes className="mr-2" />
                              Decline
                            </button>
                          </div>
                        )}
                        {appointment.status !== 'pending' && (
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredAppointments.length === 0 && (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No appointments found
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {showDocumentModal && (
        <DocumentModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDocumentModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
};

export default Admin_ViewAppointment;