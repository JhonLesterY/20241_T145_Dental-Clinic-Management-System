import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import Logo from "/src/images/Dental_logo.png";
import { FaCheck, FaTimes, FaEye, FaFileAlt } from 'react-icons/fa'; // For confirm/decline icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const Admin_ViewAppointment = () => {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
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
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const documents = [
      { type: 'School ID', data: appointment.requirements?.schoolId },
      { type: 'Registration Certificate', data: appointment.requirements?.registrationCert },
      { type: 'Vaccination Card', data: appointment.requirements?.vaccinationCard }
    ];

    const handleViewFile = async (fileId) => {
      setError(null);
      try {
        setLoading(true);
        console.log('Fetching file:', fileId);
        
        const fileUrl = `http://localhost:5000/upload/file/${fileId}`;
        const response = await fetch(fileUrl, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }

        const contentType = response.headers.get('content-type');
        setFileType(contentType);

        const blob = await response.blob();
        
        // Clean up previous URL if it exists
        if (fileContent) {
          URL.revokeObjectURL(fileContent);
        }
        
        const url = URL.createObjectURL(blob);
        setFileContent(url);
        setSelectedFile(fileId);
      } catch (error) {
        console.error('Error viewing file:', error);
        setError(error.message || 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    const renderFilePreview = () => {
      if (!selectedFile || !fileContent) return null;
      if (error) return <div className="text-red-500">{error}</div>;

      try {
        if (fileType?.startsWith('image/')) {
          return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="relative max-w-full max-h-[60vh]">
                {error ? (
                  <div className="text-red-500 p-4">{error}</div>
                ) : (
                  <img 
                    src={fileContent} 
                    alt="Document Preview" 
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      console.error('Image load error');
                      setError('Failed to load image');
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => setError(null)}
                  />
                )}
              </div>
            </div>
          );
        } else if (fileType === 'application/pdf') {
          return (
            <div className="w-full h-[60vh]">
              <object
                data={fileContent}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="p-4 text-center">
                  <p>Unable to display PDF directly.</p>
                  <a 
                    href={fileContent} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Open PDF in new tab
                  </a>
                </div>
              </object>
            </div>
          );
        } else {
          return (
            <div className="flex items-center justify-center h-full">
              <a 
                href={fileContent} 
                download 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Download File
              </a>
            </div>
          );
        }
      } catch (err) {
        console.error('Preview error:', err);
        return <div className="text-red-500">Error displaying preview</div>;
      }
    };

    useEffect(() => {
      return () => {
        // Cleanup function to revoke object URL when component unmounts
        if (fileContent) {
          URL.revokeObjectURL(fileContent);
        }
      };
    }, [fileContent]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Required Documents</h2>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileContent(null);
                onClose();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex h-full">
            {/* Document List */}
            <div className="w-1/3 border-r pr-4 overflow-y-auto">
              {documents.map((doc, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
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

            {/* File Preview */}
            <div className="w-2/3 pl-4 flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : selectedFile ? (
                <div className="flex-1 flex items-center justify-center">
                  {renderFilePreview()}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a file to preview
                </div>
              )}
            </div>
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
      <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div className={`flex-1 p-8 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
          <div className="flex items-center">
            <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
            <span className="ml-2 text-2xl font-bold text-gray-800">View Appointments</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1">
              <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.appointmentId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.patientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.appointmentTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          appointment.status === 'declined' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
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
                          ${appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {appointments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No appointments found
              </div>
            )}
          </div>
        )}
      </div>
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