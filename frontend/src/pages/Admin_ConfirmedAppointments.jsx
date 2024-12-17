// src/pages/Admin_ConfirmedAppointments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSideBar from '../components/AdminSideBar';
import AdminHeader from '../components/AdminHeader';
import { useTheme } from '../context/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const Admin_ConfirmedAppointments = () => {
  const { isDarkMode } = useTheme();
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dentists, setDentists] = useState([]);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConfirmedAppointments();
    fetchDentists();
  }, []);

  useEffect(() => {
    // Filter appointments based on search query
    const filtered = confirmedAppointments.filter(appointment => 
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.appointmentId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAppointments(filtered);
  }, [searchQuery, confirmedAppointments]);

  const fetchConfirmedAppointments = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/admin/appointments/confirmed', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      setConfirmedAppointments(data);
      setFilteredAppointments(data);
    } catch (error) {
      console.error('Full error in fetchConfirmedAppointments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDentists = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/dentists', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch dentists. Response:', errorText);
        throw new Error('Failed to fetch dentists');
      }

      const data = await response.json();
      setDentists(data);
    } catch (error) {
      console.error('Error fetching dentists:', error);
    }
  };


  const handleAssignDentist = async (appointmentId, dentistId) => {
    try {
      // Ensure dentistId is a string
      const dentistIdString = String(dentistId);

      console.log('Assigning dentist:', { 
        appointmentId, 
        dentistId: dentistIdString, 
        appointmentIdType: typeof appointmentId,
        dentistIdType: typeof dentistIdString
      });

      const response = await fetch('http://localhost:5000/admin/appointments/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          appointmentId, 
          dentistId: dentistIdString 
        })
      });
  
      // Detailed error handling
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Full error response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
  
      const data = await response.json();
      console.log('Assign dentist response:', data);
      
      alert('Dentist assigned successfully');
      
      // Refresh the appointments list after successful assignment
      fetchConfirmedAppointments();
    } catch (error) {
      console.error('Error assigning dentist:', error);
      alert(error.message);
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <AdminSideBar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-20'} flex flex-col`}>
        <AdminHeader 
          title="Confirmed Appointments" 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
        />
        
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              
            </h1>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search appointments..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`
                  pl-10 pr-4 py-2 rounded-lg border 
                  ${isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-black'}
                `}
              />
              <FontAwesomeIcon 
                icon={faSearch} 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} 
              />
            </div>
          </div>

          {loading ? (
            <div className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-500'}`}>Loading...</div>
          ) : error ? (
            <div className="text-red-500 p-4">Error: {error}</div>
          ) : filteredAppointments.length === 0 ? (
            <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No confirmed appointments
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    {['Appointment ID', 'Patient Name', 'Date', 'Time', 'Assign Dentist'].map((header, index) => (
                      <th 
                        key={index} 
                        className={`
                          px-6 py-3 text-left text-xs font-medium uppercase tracking-wider
                          ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}
                        `}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredAppointments.map((appointment, index) => (
                    <tr 
                      key={appointment._id || `appointment-${index}`}
                      className={`
                        ${isDarkMode 
                          ? 'hover:bg-gray-700 bg-gray-800' 
                          : 'hover:bg-gray-100 bg-white'}
                      `}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select 
                          onChange={(e) => handleAssignDentist(appointment.appointmentId, e.target.value)}
                          className={`
                            w-full rounded-md p-2
                            ${isDarkMode 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-white text-black border-gray-300'}
                          `}
                        >
                          <option value="">Select Dentist</option>
                          {dentists.map((dentist, dentistIndex) => (
                            <option 
                              key={`dentist-${dentist.dentist_id || dentistIndex}-${appointment.appointmentId}`} 
                              value={dentist.dentist_id}
                            >
                              {dentist.name || `Dentist ${dentistIndex + 1}`}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin_ConfirmedAppointments;