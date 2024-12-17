import { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import User_Profile from "/src/images/user.png";
import DentistSideBar from "../components/DentistSidebar";
import { useDentistTheme } from '../context/DentistThemeContext';

const DentistProfile = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDentistTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState({
    fullname: "",
    username: "",
    email: sessionStorage.getItem('email') || "",
    phoneNumber: "",
    sex: "",
    birthday: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(User_Profile);
  const fileInputRef = useRef(null);

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
      
      // Fetch profile picture from session storage first
      const storedProfilePicture = sessionStorage.getItem('profilePicture');
      if (storedProfilePicture) {
          setPreviewUrl(storedProfilePicture);
      }
      
      if (!dentistId) {
          throw new Error('Dentist ID not found in session');
      }

      const response = await fetch(`http://localhost:5000/dentists/${dentistId}/profile`, {
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dentist profile');
      }

      const data = await response.json();
      
      // Update user data
      setUserData({
          fullname: data.fullname,
          email: data.email,
          phoneNumber: data.phoneNumber || '',
          sex: data.sex || '',
          birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : ''
      });

      // If profile picture not in session storage but available in response, update it
      if (!storedProfilePicture && data.profilePicture) {
          setPreviewUrl(data.profilePicture);
          sessionStorage.setItem('profilePicture', data.profilePicture);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dentist profile:', error);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dentistId = sessionStorage.getItem('dentist_id');
      const token = sessionStorage.getItem('token');
      
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
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
      }

      const data = await response.json();
      setUserData(data);
      
      alert('Profile updated successfully');
      
      // Reload the page or redirect to dashboard
      window.location.href = '/dentist-dashboard';
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message);
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
          <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Profile Settings
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div 
                  onClick={() => fileInputRef.current.click()} 
                  className="cursor-pointer relative"
                >
                  <img 
                    src={previewUrl} 
                    alt="Profile" 
                    className={`w-32 h-32 rounded-full object-cover border-4 ${
                      isDarkMode 
                        ? 'border-gray-700 hover:border-gray-600' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`} 
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm">Change</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow space-y-4">
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    value={userData.fullname} 
                    onChange={(e) => setUserData({...userData, fullname: e.target.value})}
                    className={`w-full p-3 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`} 
                  />
                </div>
                
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    value={userData.email} 
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className={`w-full p-3 rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white border-gray-600' 
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`} 
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  value={userData.phoneNumber} 
                  onChange={(e) => setUserData({...userData, phoneNumber: e.target.value})}
                  className={`w-full p-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`} 
                />
              </div>
              
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sex
                </label>
                <select 
                  value={userData.sex} 
                  onChange={(e) => setUserData({...userData, sex: e.target.value})}
                  className={`w-full p-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-100 text-gray-800 border-gray-300'
                  }`}
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Birthday
              </label>
              <input 
                type="date" 
                value={userData.birthday} 
                onChange={(e) => setUserData({...userData, birthday: e.target.value})}
                className={`w-full p-3 rounded-lg ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }`} 
              />
            </div>
            
            <div className="flex justify-end">
              <button 
                type="submit" 
                className={`px-6 py-3 rounded-lg transition-colors duration-300 ${
                  isDarkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DentistProfile;