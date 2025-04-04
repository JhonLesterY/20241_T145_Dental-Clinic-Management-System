import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const ActivityLogs = () => {
    const { isDarkMode } = useTheme();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // Filter state: 'all', 'admin', 'dentist', 'patient'
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await fetch('http://localhost:5000/admin/activity-logs', {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch activity logs');
            }

            const data = await response.json();
            setLogs(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching logs:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'all' || log.userRole === filter;
        const matchesSearch = 
            log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDate = (!dateRange.start || new Date(log.timestamp) >= new Date(dateRange.start)) &&
                           (!dateRange.end || new Date(log.timestamp) <= new Date(dateRange.end));
        
        return matchesFilter && matchesSearch && matchesDate;
    });

    const getActionDisplay = (action) => {
        const actionMap = {
            'createAdmin': 'Created New Admin',
            'deleteAdmin': 'Deleted Admin',
            'updateAdmin': 'Updated Admin Details',
            'addDentist': 'Added New Dentist',
            'deleteDentist': 'Deleted Dentist',
            'updateDentist': 'Updated Dentist Details',
            'deletePatient': 'Deleted Patient',
            'updateProfile': 'Updated Patient Details',
            'updateInventory': 'Updated Inventory',
            'deleteInventoryItem': 'Deleted Inventory Item',
            'addInventoryItem': 'Added Inventory Item',
            'updateAppointment': 'Updated Appointment',
            'deleteAppointment': 'Deleted Appointment',
            'createAppointment': 'Created New Appointment',
            'login': 'User Login',
            'logout': 'User Logout',
            'changePassword': 'Changed Password',
            'updateSettings': 'Updated System Settings'
        };
        return actionMap[action] || action;
    };

    const getActionColor = (action) => {
        const actionColors = {
            'create': 'text-green-600',
            'add': 'text-green-600',
            'delete': 'text-red-600',
            'update': 'text-blue-600',
            'login': 'text-purple-600',
            'logout': 'text-orange-600',
            'change': 'text-yellow-600'
        };

        for (const [key, color] of Object.entries(actionColors)) {
            if (action.toLowerCase().includes(key)) {
                return color;
            }
        }
        return 'text-gray-600';
    };

    const formatDetails = (details) => {
        const formattedDetails = [];
        
        // Add performer details if available
        if (details.performer) {
            formattedDetails.push(
                <div key="performer" className="mb-2">
                    <span className="font-medium text-gray-700">Performed by: </span>
                    <span className="text-gray-600">
                        {details.performer.name} ({details.performer.id})
                    </span>
                </div>
            );
        }

        // Add target details if available
        if (details.targetName) {
            formattedDetails.push(
                <div key="target" className="mb-2">
                    <span className="font-medium text-gray-700">Target: </span>
                    <span className="text-gray-600">
                        {details.targetName} ({details.targetId})
                    </span>
                </div>
            );
        }

        // Format specific details based on action type
        Object.entries(details).forEach(([key, value]) => {
            if (!['performer', 'targetName', 'targetId', 'status'].includes(key)) {
                let formattedKey = key.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                
                let formattedValue = value;
                if (key === 'count') {
                    formattedValue = `${value} appointments viewed`;
                } else if (typeof value === 'object' && value !== null) {
                    formattedValue = JSON.stringify(value, null, 2);
                }

                formattedDetails.push(
                    <div key={key} className="text-sm">
                        <span className="font-medium text-gray-700">
                            {formattedKey}: 
                        </span>
                        <span className="text-gray-600 ml-2">
                            {formattedValue}
                        </span>
                    </div>
                );
            }
        });

        return formattedDetails;
    };

    const handleLogClick = (log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const LogDetailsModal = ({ log, onClose }) => {
        if (!log) return null;

        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Activity Log Details</h3>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                    
                    <div className="space-y-6">
                        {/* Timestamp Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">Timestamp</p>
                            <p className="text-gray-900 mt-1">
                                {format(new Date(log.timestamp), 'MMMM d, yyyy HH:mm:ss')}
                            </p>
                        </div>

                        {/* User Info Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">User Information</p>
                            <div className="mt-2">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${log.userRole === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                      log.userRole === 'dentist' ? 'bg-blue-100 text-blue-800' : 
                                      'bg-green-100 text-green-800'}`}>
                                    {log.userRole.toUpperCase()}
                                </span>
                                {log.details.performer && (
                                    <p className="mt-2 text-gray-700">
                                        <span className="font-medium">User: </span>
                                        {log.details.performer.name} ({log.details.performer.email})
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500">Action</p>
                            <p className={`${getActionColor(log.action)} mt-1 font-medium`}>
                                {getActionDisplay(log.action)}
                            </p>
                        </div>

                        {/* Additional Details Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-500 mb-2">Additional Details</p>
                            <div className="space-y-2">
                                {formatDetails(log.details)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading Activity Logs...</h2>
                        </div>
                    </div>
                    
                    {/* Placeholder header to maintain structure */}
                    <div className={`flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 shadow-lg rounded-lg`}>
                        <div className="flex items-center">
                            <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                            <span className={`ml-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Activity Logs</span>
                        </div>
                    </div>
                    
                    {/* Placeholder main content */}
                    <div className="flex-1 p-6"></div>
                </div>
            </div>
        );
    }

    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="flex h-full">
                <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

                {/* Main Content */}
                <div className={`flex-1 p-8 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300 overflow-auto`}>
                    {/* Header Section */}
                    <div className={`flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 shadow-lg rounded-lg mb-6`}>
                        <div className="flex items-center">
                            <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                            <span className={`ml-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Activity Logs</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select 
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-blue-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-300`}
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="dentist">Dentist</option>
                                <option value="patient">Patient</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-blue-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-300`}
                            />

                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-blue-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-300`}
                            />

                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className={`p-2 border rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-blue-50 text-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-300`}
                            />
                        </div>
                    </div>

                    {/* Loading and Error Handling */}
                    {loading && <div className="flex justify-center items-center h-full">Loading...</div>}
                    {error && <div className="text-red-500 font-semibold">Error: {error}</div>}

                    {/* Logs Table */}
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg-md overflow-hidden`}>
                        <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-blue-200'}`}>
                                <tr>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                                        Timestamp
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                                        User Role
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                                        Action
                                    </th>
                                    <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
                                {filteredLogs.map((log, index) => (
                                    <tr key={index} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50 transition duration-200'}`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${log.userRole === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                                  log.userRole === 'dentist' ? 'bg-blue-100 text-blue-800' : 
                                                  'bg-green-100 text-green-800'}`}>
                                                {log.userRole}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getActionColor(log.action)}`}>
                                            {getActionDisplay(log.action)}
                                        </td>
                                        <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {formatDetails(log.details)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs; 