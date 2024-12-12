import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png";

const Header = ({ title }) => {
  const navigate = useNavigate();
  const [userProfilePic, setUserProfilePic] = useState(userIcon);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const patientId = sessionStorage.getItem('patient_id');
      const token = sessionStorage.getItem('token');

      if (!token || !patientId) return;

      const response = await fetch(`http://localhost:5000/patients/numeric/${patientId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) return;

      const data = await response.json();
      
      if (data.profilePicture) {
        setUserProfilePic(data.profilePicture);
      }

      const fullName = [data.firstName, data.middleName, data.lastName]
        .filter(Boolean)
        .join(' ');
      setUserName(fullName);
      setUserEmail(data.email);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-2xl font-semibold text-[#003367]">{title}</h1>
        <div className="flex items-center space-x-4">
          <img src={bell} alt="Notifications" className="h-6 w-6 cursor-pointer" />
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            <div className="text-right">
              <h2 className="text-sm font-semibold text-gray-800">{userName}</h2>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <img 
              src={userProfilePic} 
              alt="Profile" 
              className="h-10 w-10 rounded-full object-cover border-2 border-gray-100 shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = userIcon;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;