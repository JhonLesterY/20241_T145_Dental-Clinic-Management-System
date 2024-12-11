import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import Logo from "/src/images/Dental_logo.png";
import { FaCheck, FaTimes, FaEye, FaFileAlt } from 'react-icons/fa'; // For confirm/decline icons
import { useTheme } from '../context/ThemeContext';

const Admin_ViewAppointment = () => {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState({ loading: false, error: null });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

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

    const documents = [
      { type: 'School ID', data: appointment.requirements?.schoolId },
      { type: 'Registration Certificate', data: appointment.requirements?.registrationCert },
      { type: 'Vaccination Card', data: appointment.requirements?.vaccinationCard }
    ];

    const handleViewFile = async (fileId) => {
      try {
        setLoading(true);
        console.log('Fetching file:', fileId);
        
        // Create URL for the file
        const fileUrl = `http://localhost:5000/upload/file/${fileId}`;
        
        // Set up headers
        const headers = {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        };

        // First check if file exists and get content type
        const headResponse = await fetch(fileUrl, {
          method: 'HEAD',
          headers
        });

        if (!headResponse.ok) throw new Error('Failed to fetch file');

        const contentType = headResponse.headers.get('content-type');
        console.log('Content Type:', contentType);
        setFileType(contentType);

        // For all files, get the blob and create URL
        const response = await fetch(fileUrl, { headers });
        if (!response.ok) throw new Error('Failed to fetch file content');
        
        const blob = await response.blob();
        console.log('Blob size:', blob.size, 'Blob type:', blob.type);
        
        const url = URL.createObjectURL(blob);
        console.log('Created URL:', url);
        setFileContent(url);
        setSelectedFile(fileId);
      } catch (error) {
        console.error('Error viewing file:', error);
        alert('Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    const renderFilePreview = () => {
      console.log('Rendering preview with:', { fileType, fileContent });
      if (!selectedFile || !fileContent) return null;

      if (fileType && fileType.startsWith('image/')) {
        console.log('Rendering as image');
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="relative max-w-full max-h-[60vh]">
              <img 
                src={fileContent} 
                alt="Document Preview" 
                className="object-contain w-full h-full"
                onError={(e) => {
                  console.error('Image load error:', e);
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'text-red-500';
                  errorDiv.textContent = 'Failed to load image';
                  e.target.parentElement.appendChild(errorDiv);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        );
      } else if (fileType === 'application/pdf') {
        console.log('Rendering as PDF');
        return (
          <div className="w-full h-full">
            <object
              data={fileContent}
              type="application/pdf"
              className="w-full h-full"
            >
              <p>Unable to display PDF. <a href={fileContent} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Download PDF</a></p>
            </object>
          </div>
        );
      } else {
        console.log('Rendering as other file type');
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
    };

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

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>
                View Appointments
              </h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Appointment ID
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Patient Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Date
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Time
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'bg-gray-800 divide-gray-700 text-gray-300' : 'bg-white divide-gray-200'}`}>
  {appointments.map((appointment) => (
    <tr key={appointment.appointmentId} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
        {appointment.appointmentId}
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
        {appointment.patientName}
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
        {new Date(appointment.appointmentDate).toLocaleDateString()}
      </td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
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