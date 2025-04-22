import { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import User_Profile from "/src/images/user.png";
import DentistSideBar from "../components/DentistSidebar";
import { useDentistTheme } from '../context/DentistThemeContext';
import LoadingOverlay from "../components/LoadingOverlay";

const DentistProfile = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDentistTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState({
    fullname: sessionStorage.getItem('fullname') || sessionStorage.getItem('name') || "",
    email: sessionStorage.getItem('email') || "",
    phoneNumber: "",
    sex: "",
    birthday: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(sessionStorage.getItem('profilePicture') || User_Profile);
  const fileInputRef = useRef(null);
  const isGoogleUser = sessionStorage.getItem('isGoogleUser') === 'true';

  useEffect(() => {
    fetchDentistProfile();    
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5000000) { // 5MB limit
            alert('File size must be less than 5MB');
            return;
        }
       
        if (!file.type.startsWith('image/')) {
            alert('File must be an image');
            return;
        }

        setProfilePicture(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    }
  };

  const fetchDentistProfile = async () => {
    try {
      const dentistId = sessionStorage.getItem('dentist_id');
      const token = sessionStorage.getItem('token');
      
      setIsLoading(true);
      
      // Use Google profile data if available
      if (isGoogleUser) {
        console.log('Using Google profile data');
        // Already loaded from sessionStorage in the initial state
        setIsLoading(false);
        return;
      }
      
      if (!dentistId) {
          throw new Error('Dentist ID not found in session');
      }

      console.log('Fetching dentist profile from API:', dentistId);
      const response = await fetch(`http://localhost:5000/dentists/${dentistId}/profile`, {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch dentist profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dentist profile data:', data);
      
      // Update user data
      setUserData({
          fullname: data.fullname || data.name || userData.fullname,
          email: data.email || userData.email,
          phoneNumber: data.phoneNumber || '',
          sex: data.sex || '',
          birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : ''
      });

      // If profile picture is available in response, update it
      if (data.profilePicture) {
          setPreviewUrl(data.profilePicture);
          sessionStorage.setItem('profilePicture', data.profilePicture);
      }
    } catch (error) {
      console.error('Error fetching dentist profile:', error);
      setError(error.message);
      
      // Fall back to session storage data
      console.log('Using fallback data from session storage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const dentistId = sessionStorage.getItem('dentist_id');
      const token = sessionStorage.getItem('token');
      
      if (!dentistId) {
        throw new Error('Dentist ID not found');
      }
      
      const formData = new FormData();
      formData.append('fullname', userData.fullname);
      formData.append('email', userData.email);
      formData.append('phoneNumber', userData.phoneNumber);
      formData.append('sex', userData.sex);
      formData.append('birthday', userData.birthday);  
      
      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      console.log('Submitting profile data:', Object.fromEntries(formData));

      const response = await fetch(`http://localhost:5000/dentists/${dentistId}/profile`, {
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${token}`
          },
          body: formData
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update session storage with new data
      sessionStorage.setItem('name', userData.fullname);
      sessionStorage.setItem('fullname', userData.fullname);
      sessionStorage.setItem('email', userData.email);
      
      setUserData({
        ...userData,
        ...data
      });
      
      alert('Profile updated successfully');
      
      // Redirect to dashboard
      navigate('/dentist-dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('dentist_id');
    sessionStorage.removeItem('role');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-8 relative`}>
        {isLoading && (
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-10">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading Profile...</h2>
            </div>
          </div>
        )}
        
        {error && (
          <div className="w-full max-w-2xl mb-4 p-4 bg-red-100 text-red-800 rounded-lg z-20">
            ⚠️ {error}
          </div>
        )}

        <div className={`w-full max-w-2xl p-8 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-gray-800'} rounded-lg shadow-lg`}>
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <img
                className="h-24 w-24 rounded-full border-4 shadow-lg object-cover"
                src={previewUrl}
                alt="Profile"
                onError={(e) => {
                  console.error('Error loading image:', e);
                  e.target.src = User_Profile;
                }}
              />
              <div 
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="text-white text-sm">Change Photo</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            {/* Display fullname under profile picture */}
            <div className="text-center mt-4">
              <h2 className="text-2xl font-semibold text-blue-900">{userData.fullname}</h2>
              <p className={`block ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>{userData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Full Name*</label>
                <input
                  type="text"
                  value={userData.fullname}
                  onChange={(e) => setUserData({ ...userData, fullname: e.target.value })}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Contact Number*</label>
                <input
                  type="tel"
                  value={userData.phoneNumber}
                  onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  maxLength={11}
                  pattern="[0-9]*"
                  placeholder="09123456789"
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Sex at Birth*</label>
                <select 
                  value={userData.sex}
                  onChange={(e) => setUserData({ ...userData, sex: e.target.value })}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Birthday*</label>
                <input
                  type="date"
                  value={userData.birthday}
                  onChange={(e) => setUserData({ ...userData, birthday: e.target.value })}
                  className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Update Profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DentistProfile;