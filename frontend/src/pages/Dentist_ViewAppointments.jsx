import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DentistSideBar from '../components/DentistSidebar';
import Logo from '/src/images/Dental_logo.png';
import { useDentistTheme } from '../context/DentistThemeContext';

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
            setLoading(false);
        }
    };

    return (
        <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
            
            <div className={`flex-1 flex flex-col transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
                <header className={`${isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white'} shadow-md`}>
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
                            <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>
                                View Appointments
                            </h1>
                        </div>
                    </div>
                </header>

                <div className="w-[78rem] mx-auto my-4"></div>

                {/* Date Section */}
                <div className="flex flex-col items-center mb-4">
                    <div className="flex gap-2 items-center">
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-md w-full max-w-md">
                            Today: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="flex flex-col items-center mt-6 mx-auto w-full max-w-7xl">
                    <div className={`w-full border rounded-xl shadow-lg max-w-6xl mx-auto p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : error ? (
                            <div className={`text-red-500 text-center ${isDarkMode ? 'bg-gray-800 p-4 rounded' : ''}`}>{error}</div>
                        ) : (
                            <table className="w-full">
                                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <tr>
                                        {['Patient Name', 'Date', 'Time', 'Requirements'].map((header, index) => (
                                            <th className={`py-3 px-4 text-left text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.id} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                            <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {appointment.patientName}
                                            </td>
                                            <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {appointment.date}
                                            </td>
                                            <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {appointment.time}
                                            </td>
                                            <td className={`py-3 px-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                {appointment.requirements}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dentist_ViewAppointments;