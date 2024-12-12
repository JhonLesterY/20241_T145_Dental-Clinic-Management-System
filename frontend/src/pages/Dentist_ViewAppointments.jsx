import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DentistSideBar from '../components/DentistSidebar';
import Logo from '/src/images/Dental_logo.png';

const Dentist_ViewAppointments = () => {
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
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
            
            <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
                <header className="bg-white shadow-md">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
                            <h1 className="text-2xl font-semibold text-[#003367]">
                                View Appointments
                            </h1>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-center">{error}</div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
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
                                            Requirements
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.map((appointment) => (
                                        <tr key={appointment.appointmentId}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {appointment.patientName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {appointment.appointmentTime}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {appointment.requirements || 'None'}
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

export default Dentist_ViewAppointments; 