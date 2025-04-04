import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import AdminHeader from '../components/AdminHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faFileAlt, faCalendarAlt, faClipboardList, faComments, faCog, faBell, faTooth, faSearch, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [adminData, setAdminData] = useState({
        fullname: '',
        profilePicture: ''
    });
    const [dashboardMetrics, setDashboardMetrics] = useState({
        totalPatients: 0,
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        cancelledAppointments: 0
    });
    const [error, setError] = useState(null);
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const [adminResponse, metricsResponse] = await Promise.all([
                    fetch('http://localhost:5000/admin/current', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetch('http://localhost:5000/admin/dashboard-metrics', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    })
                ]);

                const adminData = await adminResponse.json();
                const metricsData = await metricsResponse.json();

                setAdminData(adminData);
                setDashboardMetrics(metricsData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard metrics');
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    const appointmentChartData = {
        labels: ['Total', 'Completed', 'Pending', 'Cancelled'],
        datasets: [{
            label: 'Appointments',
            data: [
                dashboardMetrics.totalAppointments || 0, 
                dashboardMetrics.completedAppointments || 0, 
                dashboardMetrics.pendingAppointments || 0, 
                dashboardMetrics.cancelledAppointments || 0
            ],
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)', 
                'rgba(75, 192, 192, 0.6)', 
                'rgba(255, 206, 86, 0.6)', 
                'rgba(255, 99, 132, 0.6)'
            ]
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { 
                display: true, 
                text: 'Appointment Overview' 
            }
        }
    };

    if (loading) {
        return (
            <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-[#f0f4f8]'}`}>
                <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
                
                <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"} relative`}>
                    {/* Blurred overlay */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-10">
                        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading Dashboard Data...</h2>
                        </div>
                    </div>
                    
                    {/* Placeholder header */}
                    <div className="p-4">
                        <div className="flex items-center">
                            <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                            <span className={`ml-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Admin Dashboard</span>
                        </div>
                    </div>
                    
                    {/* Placeholder main content */}
                    <div className="flex-1 p-6"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex h-screen w-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                <div className="flex items-center justify-center w-full">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex h-screen w-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-6`}>
                <AdminHeader 
                    title="Admin Dashboard" 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { icon: faUsers, label: 'Total Patients', value: dashboardMetrics.totalPatients },
                        { icon: faCalendarAlt, label: 'Total Appointments', value: dashboardMetrics.totalAppointments },
                        { icon: faTooth, label: 'Completed Appointments', value: dashboardMetrics.completedAppointments },
                        { icon: faFileAlt, label: 'Pending Appointments', value: dashboardMetrics.pendingAppointments }
                    ].map((metric, index) => (
                        <div 
                            key={index} 
                            className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} 
                            rounded-lg shadow-md p-4 flex items-center justify-between hover:shadow-lg transition`}
                        >
                            <div>
                                <FontAwesomeIcon icon={metric.icon} className="text-2xl mr-4 text-blue-500" />
                                <span className="text-sm font-medium">{metric.label}</span>
                            </div>
                            <span className="text-2xl font-bold">{metric.value || 0}</span>
                        </div>
                    ))}
                </div>

                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-6 shadow-md h-96`}>
                    <Bar data={appointmentChartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;