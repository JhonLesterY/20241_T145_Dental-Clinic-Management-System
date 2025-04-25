import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DentistSideBar from '../components/DentistSidebar';
import DentistHeader from '../components/DentistHeader';
import { useDentistTheme } from '../context/DentistThemeContext';
import LoadingOverlay from '../components/LoadingOverlay';

const Dentist_ViewAppointments = () => {
    const { isDarkMode } = useDentistTheme();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAppointments();
    }, []);
    
    useEffect(() => {
        console.log('Current Appointments State:', appointments);
        if (appointments.length === 0) {
            console.warn('No appointments found. Check if fetchAppointments is working correctly.');
        }
    }, [appointments]);

    const fetchAppointments = async () => {
        try {
            const dentistId = sessionStorage.getItem('dentist_id');
            const token = sessionStorage.getItem('token');

            if (!token || !dentistId) {
                navigate('/login');
                return;
            }

            const response = await fetch(`http://localhost:5000/dentists/${dentistId}/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch appointments');
            }

            const data = await response.json();
            setAppointments(data);
            console.log('Appointment Data Structure:', data);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            // Add a slight delay to ensure smooth loading transition
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        }
    };

    return (
        <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
            
            <div className={`flex-1 flex flex-col transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"} relative`}>
                <DentistHeader title="View Appointments" />
                
                <div className="flex-1 relative">
                    {loading ? (
                        <LoadingOverlay 
                            message="Loading Appointments..." 
                            isDarkMode={isDarkMode} 
                            isTransparent={true}
                            fullScreen={false}
                        />
                    ) : (
                        <div className="p-6 h-full overflow-y-auto">
                            {error ? (
                                <div className={`text-red-500 text-center p-4 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    {error}
                                </div>
                            ) : (
                                <div className={`rounded-lg shadow overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <table className="min-w-full">
                                        <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <tr>
                                                {['Patient Name', 'Date', 'Time', 'Requirements'].map((header, index) => (
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
                                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                                            {appointments.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className={`px-6 py-4 text-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        No appointments found
                                                    </td>
                                                </tr>
                                            ) : (
                                                appointments.map((appointment) => (
                                                    <tr 
                                                        key={appointment.appointmentId}
                                                        className={`
                                                            ${isDarkMode 
                                                                ? 'hover:bg-gray-700' 
                                                                : 'hover:bg-gray-100'}
                                                        `}
                                                    >
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                            {appointment.patientName || 'Unknown Patient'}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                            {appointment.appointmentDate 
                                                                ? new Date(appointment.appointmentDate).toLocaleDateString() 
                                                                : 'No Date'}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                            {appointment.appointmentTime || 'No Time'}
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                                                            {(() => {
                                                                // If requirements is an object with schoolId
                                                                if (appointment.requirements && typeof appointment.requirements === 'object') {
                                                                    if (appointment.requirements.schoolId) {
                                                                        const schoolId = appointment.requirements.schoolId;
                                                                        return (
                                                                            <div>
                                                                                <p>File: {schoolId.fileName || 'Unnamed File'}</p>
                                                                                {schoolId.webViewLink && (
                                                                                    <a 
                                                                                        href={schoolId.webViewLink} 
                                                                                        target="_blank" 
                                                                                        rel="noopener noreferrer"
                                                                                        className={`
                                                                                            ${isDarkMode 
                                                                                                ? 'text-blue-400 hover:text-blue-300' 
                                                                                                : 'text-blue-600 hover:text-blue-800'}
                                                                                            hover:underline
                                                                                        `}
                                                                                    >
                                                                                        View File
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    }
                                                                    // If requirements is an object but not in expected format
                                                                    return JSON.stringify(appointment.requirements);
                                                                }
                                                                // If requirements is a simple string or undefined
                                                                return appointment.requirements || 'None';
                                                            })()}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dentist_ViewAppointments; 