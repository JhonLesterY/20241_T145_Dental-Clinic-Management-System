import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png";
import logo from "/src/images/Dental_logo.png";
import { useTheme } from '../context/ThemeContext';

const DentistHeader = ({ title, customButtons = [] }) => {
  const navigate = useNavigate();
  const [userProfilePic, setUserProfilePic] = useState(userIcon);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchDentistProfile();
  }, []);

  const fetchDentistProfile = async () => {
    try {
      const dentistId = sessionStorage.getItem('dentist_id');
      const token = sessionStorage.getItem('token');
      const email = sessionStorage.getItem('email');

      if (!token || !dentistId) return;

      const response = await fetch(`http://localhost:5000/dentists/${dentistId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        // If profile fetch fails, use fallback data from session storage
        setUserName(dentistId || 'Dentist');
        setUserEmail(email || 'dentist@clinic.com');
        return;
      }

      const data = await response.json();
      
      // Use fullname if available, otherwise use username or fallback
      const displayName = data.fullname || data.username || dentistId || 'Dentist';
      
      if (data.profilePicture) {
        setUserProfilePic(data.profilePicture);
      }

      setUserName(displayName);
      setUserEmail(data.email || email || 'dentist@clinic.com');
    } catch (error) {
      console.error('Error fetching dentist profile:', error);
      // Fallback to session storage values
      setUserName(sessionStorage.getItem('dentist_id') || 'Dentist');
      setUserEmail(sessionStorage.getItem('email') || 'dentist@clinic.com');
    }
  };

  const handleProfileClick = () => {
    navigate('/dentist-profile');
  };

  return (
    <header 
      className={`flex items-center justify-between p-4 shadow-md transition-colors duration-300 
        ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}
    >
      <div className="flex items-center">
        <img 
          src={logo} 
          alt="Dental Clinic Logo" 
          className="h-10 w-auto object-contain"
        />
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {title}
        </h1>
        
        {customButtons.map((button, index) => (
          <button
            key={index}
            className={`ml-4 px-4 py-2 rounded ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } ${button.className}`}
            onClick={button.onClick}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <img 
          src={bell} 
          alt="Notifications" 
          className={`w-6 h-6 cursor-pointer ${isDarkMode ? 'filter brightness-75' : ''}`} 
        />
        
        <div 
          onClick={handleProfileClick} 
          className="cursor-pointer flex items-center space-x-3"
        >
          <div className="text-right">
            <h2 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {userName || 'Dentist'}
            </h2>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {userEmail || 'dentist@example.com'}
            </p>
          </div>

          <img 
            src={userProfilePic} 
            alt="Profile" 
            className={`w-10 h-10 rounded-full border-2 ${
              isDarkMode 
                ? 'border-gray-700 hover:border-gray-600' 
                : 'border-gray-300 hover:border-gray-400'
            }`} 
          />
        </div>
      </div>
    </header>
  );
};

export default DentistHeader;