import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThLarge, faFileAlt, faCalendarAlt, faClipboardList, faComments, faCog, faBell, faTooth, faSearch, faUsers } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [adminData, setAdminData] = useState({
        fullname: '',
        profilePicture: ''
    });
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await fetch('http://localhost:5000/admin/current', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setAdminData(data);
            } catch (error) {
                console.error('Error fetching admin data:', error);
            }
        };

        fetchAdminData();
    }, []);

    return (
        <div className={`flex h-screen w-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

            {/* Main Content */}
            <div className={`flex-1 p-8 ${sidebarOpen ? 'ml-64' : 'ml-16'} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                {/* Add your dashboard content here */}
            </div>
        </div>
    );
};

export default AdminDashboard;