import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSearch } from '@fortawesome/free-solid-svg-icons';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [activityLogs, setActivityLogs] = useState([]);
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [userType, setUserType] = useState('');
    const [permissions, setPermissions] = useState({
        admin: {
            manage_admins: false,
            manage_dentists: false,
            manage_patients: false,
            view_appointments: false,
            manage_calendar: false,
            view_reports: false,
            send_notifications: false
        },
        dentist: {
            manage_appointments: false,
            view_patients: false,
            manage_schedule: false,
            view_medical_records: false
        }
    });

    const [newUserData, setNewUserData] = useState({
        fullname: '',
        email: '',
        password: '',
        role: '',
        permissions: {}
    });

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/login');
    };

    const fetchActivityLogs = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch('http://localhost:5000/superadmin/activity-logs', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setActivityLogs(data);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/superadmin/add-${userType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newUserData,
                    permissions: permissions[userType]
                })
            });

            if (response.ok) {
                setShowAddUserModal(false);
                // Reset form
                setNewUserData({
                    fullname: '',
                    email: '',
                    password: '',
                    role: '',
                    permissions: {}
                });
            }
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    useEffect(() => {
        fetchActivityLogs();
    }, []);

    return (
        <div className="flex h-screen w-screen">
            {/* Sidebar */}
            <div className="bg-gray-800 text-white w-1/4 lg:w-1/5 p-6 flex flex-col">
                <div className="flex items-center mb-8">
                    <img src="/src/assets/unicare.png" alt="Logo" className="h-12 w-12 rounded-full" />
                    <span className="ml-2 text-xl font-bold">SuperAdmin</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1">
                    <button 
                        onClick={() => {
                            setUserType('admin');
                            setShowAddUserModal(true);
                        }}
                        className="w-full mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Add Admin
                    </button>
                    <button 
                        onClick={() => {
                            setUserType('dentist');
                            setShowAddUserModal(true);
                        }}
                        className="w-full mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Add Dentist
                    </button>
                </nav>

                <button 
                    onClick={handleLogout}
                    className="mt-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-gray-100">
                <div className="bg-white p-6 shadow-md">
                    <h1 className="text-2xl font-bold">Activity Logs</h1>
                </div>

                {/* Activity Logs Table */}
                <div className="p-6">
                    <table className="min-w-full bg-white rounded-lg shadow-md">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b">Timestamp</th>
                                <th className="px-6 py-3 border-b">User Role</th>
                                <th className="px-6 py-3 border-b">Action</th>
                                <th className="px-6 py-3 border-b">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activityLogs.map((log, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 border-b">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 border-b">{log.userRole}</td>
                                    <td className="px-6 py-4 border-b">{log.action}</td>
                                    <td className="px-6 py-4 border-b">
                                        {JSON.stringify(log.details)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg w-1/2">
                        <h2 className="text-2xl font-bold mb-4 text-black">Add {userType}</h2>
                        <form onSubmit={handleAddUser}>
                            <input
                                type="text"
                                placeholder="Full Name"
                                className="w-full mb-4 p-2 border rounded bg-white"
                                value={newUserData.fullname}
                                onChange={(e) => setNewUserData({...newUserData, fullname: e.target.value})}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full mb-4 p-2 border rounded bg-white"
                                value={newUserData.email}
                                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                            />
                            
                            <h3 className="font-bold mb-2 text-black">Permissions</h3>
                            {Object.entries(permissions[userType]).map(([key, value]) => (
                                <div key={key} className="mb-2 text-black">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => setPermissions({
                                                ...permissions,
                                                [userType]: {
                                                    ...permissions[userType],
                                                    [key]: e.target.checked
                                                }
                                            })}
                                            className="mr-2"
                                        />
                                        {key.split('_').join(' ')}
                                    </label>
                                </div>
                            ))}

                            <div className="flex justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    className="mr-2 px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Add {userType}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard; 