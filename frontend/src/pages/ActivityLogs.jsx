import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import { format } from 'date-fns';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // Filter state: 'all', 'admin', 'dentist', 'patient'
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

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
            'updatePatient': 'Updated Patient Details',
            'updateInventory': 'Updated Inventory',
            'deleteInventoryItem': 'Deleted Inventory Item',
            'addInventoryItem': 'Added Inventory Item',
            'updateAppointment': 'Updated Appointment',
            'deleteAppointment': 'Deleted Appointment',
            'createAppointment': 'Created New Appointment',
            'login': 'User Login',
            'logout': 'User Logout',
            'changePassword': 'Changed Password',
            'updateProfile': 'Updated Profile'
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
        
        if (details.name) {
            formattedDetails.push(`Name: ${details.name}`);
        }
        
        if (details.admin_id) {
            formattedDetails.push(`Admin ID: ${details.admin_id}`);
        }
        
        if (details.dentist_id) {
            formattedDetails.push(`Dentist ID: ${details.dentist_id}`);
        }
        
        if (details.patient_id) {
            formattedDetails.push(`Patient ID: ${details.patient_id}`);
        }

        if (details.status) {
            formattedDetails.push(`Status: ${details.status}`);
        }

        return formattedDetails.map((detail, index) => (
            <div key={index} className="text-sm">
                {detail}
            </div>
        ));
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div className="flex">
            <AdminSideBar />
            <div className="flex-1 p-8 ml-64">
                <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>

                {/* Filters and Search */}
                <div className="mb-6 flex gap-4 flex-wrap">
                    <select 
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="p-2 border rounded"
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
                        className="p-2 border rounded"
                    />

                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="p-2 border rounded"
                    />

                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="p-2 border rounded"
                    />
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredLogs.map((log, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDetails(log.details)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs; 