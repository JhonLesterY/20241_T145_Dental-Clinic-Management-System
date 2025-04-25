import { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import User_Profile from "/src/images/user.png";
import DentistSideBar from "../components/DentistSidebar";
import { useDentistTheme } from '../context/DentistThemeContext';
import LoadingOverlay from "../components/LoadingOverlay";
import CustomModal from "../components/CustomModal";
import Toast from "../components/Toast";

const DentistProfile = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDentistTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    sex: "",
    birthday: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(User_Profile);
  const fileInputRef = useRef(null);
  const isGoogleUser = sessionStorage.getItem('isGoogleUser') === 'true';
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success');

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showModal = (title, message, type = 'success') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalOpen(true);
  };

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    fetchDentistProfile();    
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5000000) { // 5MB limit
            showToast('File size must be less than 5MB', 'error');
            return;
        }
       
        if (!file.type.startsWith('image/')) {
            showToast('File must be an image', 'error');
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

  // Helper function to format date for the date input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toISOString().split('T')[0];
    } catch (err) {
      console.error('Error formatting date:', err);
      return '';
    }
  };

  const fetchDentistProfile = async () => {
    try {
      const dentistId = sessionStorage.getItem('dentist_id');
      const token = sessionStorage.getItem('token');
      
      if (!dentistId || !token) {
        throw new Error('Authentication credentials missing');
      }

      console.log('Fetching dentist profile:', dentistId);
      
      const response = await fetch(`http://localhost:5000/dentists/${dentistId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch profile: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched profile data:', data);
      
      // Check the format of birthday data
      console.log('Raw birthday from API:', data.birthday);
      
      // Format the birthday properly for date input
      const formattedBirthday = formatDateForInput(data.birthday);
      console.log('Formatted birthday for input:', formattedBirthday);
      
      // Update user data with properly formatted date
      const updatedUserData = {
        fullname: data.fullname || data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        sex: data.sex || '',
        birthday: formattedBirthday
      };
      
      console.log('Setting user data:', updatedUserData);
      setUserData(updatedUserData);

      // Update profile picture
      if (data.profilePicture) {
        setPreviewUrl(data.profilePicture);
        sessionStorage.setItem('profilePicture', data.profilePicture);
      }

      // Update session storage
      sessionStorage.setItem('name', data.fullname || data.name || '');
      sessionStorage.setItem('fullname', data.fullname || data.name || '');
      sessionStorage.setItem('email', data.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const dentistId = sessionStorage.getItem('dentist_id');
      const token = sessionStorage.getItem('token');
      
      if (!dentistId || !token) {
        throw new Error('Authentication credentials missing');
      }

      // Prepare the profile data
      const profileData = new FormData();
      profileData.append('fullname', userData.fullname.trim());
      profileData.append('email', userData.email);
      profileData.append('phoneNumber', userData.phoneNumber.trim());
      
      // Log the sex and birthday values being submitted
      console.log('Submitting sex:', userData.sex);
      console.log('Submitting birthday:', userData.birthday);
      
      profileData.append('sex', userData.sex);
      profileData.append('birthday', userData.birthday);

      // Add profile picture if it exists
      if (profilePicture) {
        profileData.append('profilePicture', profilePicture);
      }

      console.log('Updating profile for dentist:', dentistId);
      console.log('Profile data:', Object.fromEntries(profileData));

      const response = await fetch(`http://localhost:5000/dentists/${dentistId}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: profileData
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Update failed:', responseData);
        throw new Error(responseData.message || `Failed to update profile: ${response.status}`);
      }

      console.log('Profile update response:', responseData);
      console.log('Response birthday:', responseData.birthday);
      console.log('Response sex:', responseData.sex);

      // Format the birthday properly for date input
      const formattedBirthday = formatDateForInput(responseData.birthday);
      
      // Update local state with response data and formatted birthday
      setUserData(prevData => ({
        ...prevData,
        fullname: responseData.fullname || responseData.name || prevData.fullname,
        email: responseData.email || prevData.email,
        phoneNumber: responseData.phoneNumber || prevData.phoneNumber,
        sex: responseData.sex || prevData.sex,
        birthday: formattedBirthday
      }));

      // Update session storage
      sessionStorage.setItem('name', responseData.fullname || responseData.name || userData.fullname.trim());
      sessionStorage.setItem('fullname', responseData.fullname || responseData.name || userData.fullname.trim());
      sessionStorage.setItem('email', responseData.email || userData.email);

      if (responseData.profilePicture) {
        sessionStorage.setItem('profilePicture', responseData.profilePicture);
        setPreviewUrl(responseData.profilePicture);
      }

      // Show success toast
      showToast('Profile updated successfully!');
      
      // Test fetch profile again to see if it has the updated values
      await fetchDentistProfile();
      
      // Navigate to dashboard after a delay
      setTimeout(() => {
        navigate('/dentist-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast(error.message || 'Failed to update profile. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSuccess = (data) => {
    // Update session storage
    sessionStorage.setItem('name', data.fullname || data.name);
    sessionStorage.setItem('fullname', data.fullname || data.name);
    sessionStorage.setItem('email', data.email);
    
    if (data.profilePicture) {
      sessionStorage.setItem('profilePicture', data.profilePicture);
      setPreviewUrl(data.profilePicture);
    }
    
    // Update local state with formatted birthday
    setUserData(prevData => ({
      ...prevData,
      fullname: data.fullname || data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      sex: data.sex,
      birthday: formatDateForInput(data.birthday)
    }));
    
    alert('Profile updated successfully');
    navigate('/dentist-dashboard');
  };

  const validateForm = () => {
    // Validate required fields
    if (!userData.fullname?.trim()) {
      showToast('Full name is required', 'error');
      return false;
    }

    if (!userData.phoneNumber?.trim()) {
      showToast('Contact number is required', 'error');
      return false;
    }

    // Validate phone number format
    if (!/^09\d{9}$/.test(userData.phoneNumber)) {
      showToast('Contact number must be 11 digits starting with 09', 'error');
      return false;
    }

    if (!userData.sex) {
      showToast('Sex at birth is required', 'error');
      return false;
    }

    if (!userData.birthday) {
      showToast('Birthday is required', 'error');
      return false;
    }

    // Validate birthday
    try {
      const birthDate = new Date(userData.birthday);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        showToast('Invalid birth date', 'error');
        return false;
      }
      
      if (birthDate > today) {
        showToast('Birthday cannot be in the future', 'error');
        return false;
      }
      
      const year = birthDate.getFullYear();
      if (year < 1900 || year > today.getFullYear()) {
        showToast('Invalid birth year', 'error');
        return false;
      }
    } catch (err) {
      showToast('Invalid date format', 'error');
      return false;
    }

    return true;
  };

  const handleLogout = () => {
    sessionStorage.clear();
    showToast('Logged out successfully!');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className={`flex h-screen w-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`}>
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex-1 flex items-center justify-center p-8">
          {isLoading && (
            <div className="absolute inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
              <div className="bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
                <h2 className="text-xl font-semibold text-white">Loading Profile...</h2>
              </div>
            </div>
          )}

          <div className={`w-full max-w-2xl p-8 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-gray-800'} rounded-lg shadow-lg`}>
            {/* Profile Picture Section - Keep Admin's styling */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <img
                  className="h-24 w-24 rounded-full border-4 shadow-lg object-cover"
                  src={previewUrl}
                  alt="Profile"
                  onError={(e) => {
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
              <div className="text-center mt-4">
                <h2 className="text-2xl font-semibold text-blue-900">{userData.fullname}</h2>
                <p className={`block ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>{userData.email}</p>
              </div>
            </div>

            {/* Form Section - Align with Admin's structure */}
            <form onSubmit={handleSubmit} className="space-y-5 mt-8">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={`block ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Full Name*</label>
                  <input
                    type="text"
                    value={userData.fullname}
                    onChange={(e) => setUserData({ ...userData, fullname: e.target.value })}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-600' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-gray-800'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-600' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-gray-800'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
              </div>

              {/* Keep Admin-style dropdown and date picker */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={`block ${isDarkMode ? 'text-gray-200' : 'text-gray-600'}`}>Sex at Birth*</label>
                  <select 
                    value={userData.sex}
                    onChange={(e) => {
                      console.log('Sex changed to:', e.target.value);
                      setUserData({ ...userData, sex: e.target.value });
                    }}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-600' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-gray-800'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    onChange={(e) => {
                      console.log('Birthday changed to:', e.target.value);
                      setUserData({ ...userData, birthday: e.target.value });
                    }}
                    className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-600' : 'bg-white'} ${isDarkMode ? 'text-white' : 'text-gray-800'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                  />
                </div>
              </div>

              {/* Debug Info (optional) */}
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-4 p-2 bg-gray-800 text-xs text-gray-300 rounded">
                  <p>Current sex: {userData.sex || 'none'}</p>
                  <p>Current birthday: {userData.birthday || 'none'}</p>
                </div>
              )}

              {/* Buttons Section */}
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

          {/* Add the Toast component */}
          <Toast
            message={toastMessage}
            type={toastType}
            isVisible={toastVisible}
            onClose={() => setToastVisible(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default DentistProfile;