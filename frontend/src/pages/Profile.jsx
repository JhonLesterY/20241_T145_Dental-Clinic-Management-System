import { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import UserSideBar from "../components/UserSideBar";
import User_Profile from "/src/images/user.png";
import { useUserTheme } from '../context/UserThemeContext';

const Profile = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useUserTheme();
  const [userData, setUserData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "None",
    phoneNumber: "",
    email: sessionStorage.getItem('email') || "",
    sex: "Male",
    birthday: "",
    isProfileComplete: false,
    hasChangedPassword: false,
    isGoogleUser: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(User_Profile);
  const fileInputRef = useRef(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const patientId = sessionStorage.getItem('patient_id');
      const token = sessionStorage.getItem('token');

      if (!token || !patientId) {
        console.log('Missing credentials - Token:', !!token, 'PatientId:', !!patientId);
        navigate('/login');
        return;
      }

      console.log('Attempting to fetch profile with patient ID:', patientId);

      // Use numeric patient_id endpoint
      const response = await fetch(`http://localhost:5000/patients/numeric/${patientId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Profile fetch response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('Unauthorized access - clearing session');
          sessionStorage.clear();
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || 'Failed to fetch profile');
      }

      const data = await response.json();
      console.log('Profile data received:', data);

      // Split the full name for Google users
      let firstName = "", middleName = "", lastName = "";
      if (data.isGoogleUser && data.name) {
        const nameParts = data.name.split(' ');
        if (nameParts.length === 3) {
          [firstName, middleName, lastName] = nameParts;
        } else if (nameParts.length === 2) {
          [firstName, lastName] = nameParts;
        } else {
          firstName = data.name;
        }
      }

      setUserData({
        firstName: data.firstName || firstName,
        middleName: data.middleName || middleName,
        lastName: data.lastName || lastName,
        suffix: data.suffix || "None",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        sex: data.sex || "Male",
        birthday: data.birthday ? new   
        Date(data.birthday).toISOString().split('T')[0] : "",
        isProfileComplete: data.isProfileComplete || false,
        hasChangedPassword: data.hasChangedPassword || false,
        isGoogleUser: data.isGoogleUser || false

      });

      const needsPasswordChange = !data.isGoogleUser && !data.hasChangedPassword;
      console.log('Needs password change:', needsPasswordChange); // Debug log
      console.log('Is Google user:', data.isGoogleUser);
      console.log('Has changed password:', data.hasChangedPassword);

      setRequiresPasswordChange(needsPasswordChange);
      setShowPasswordModal(needsPasswordChange);


      // Set profile picture with debug logs
      console.log('Profile picture URL:', data.profilePicture); // Debug log
      if (data.profilePicture) {
        setPreviewUrl(data.profilePicture);
        console.log('Setting preview URL to:', data.profilePicture); // Debug log
      } else {
        console.log('No profile picture found, using default'); // Debug log
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
      if (err.message.includes('Invalid patient ID')) {
        sessionStorage.clear();
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('patient_id');
    sessionStorage.removeItem('role');
    navigate('/login');
  };

  const validatePhoneNumber = (number) => {
    if (!number) return "Phone number is required";
    if (!/^[0-9]+$/.test(number)) return "Only numbers are allowed";
    if (!number.startsWith('09')) return "Phone number must start with 09";
    if (number.length !== 11) return "Phone number must be exactly 11 digits";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number before submission
    const phoneError = validatePhoneNumber(userData.phoneNumber);
    if (phoneError) {
      setPhoneError(phoneError);
      return;
    }

    if (requiresPasswordChange && !userData.hasChangedPassword) {
      alert('Please change your temporary password before updating your profile.');
      setShowPasswordModal(true);
      return;
    }

    try {
      const formData = new FormData();
      
      // Only append non-null and non-undefined values
      Object.entries(userData).forEach(([key, value]) => {
        if (value != null) {
          formData.append(key, value);
        }
      });

      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const patientId = sessionStorage.getItem('patient_id');
      const token = sessionStorage.getItem('token');

      if (!patientId || !token) {
        throw new Error('Missing authentication credentials');
      }

      const response = await fetch(`http://localhost:5000/patients/${patientId}/profile`, {
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
      console.log('Profile updated:', data);

      if (data.profilePicture) {
        setPreviewUrl(data.profilePicture.startsWith('http') 
          ? data.profilePicture 
          : `http://localhost:5000${data.profilePicture}`
        );
      }

      alert('Profile updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
      if (err.message.includes('authentication')) {
        sessionStorage.clear();
        navigate('/login');
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Prevent Google users from changing password
    if (userData.isGoogleUser) {
        alert("Google users cannot change password. Please use Google authentication.");
        return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
        alert("New passwords don't match!");
        return;
    }

    try {
        const patientId = sessionStorage.getItem('patient_id');
        const token = sessionStorage.getItem('token');

        const response = await fetch(`http://localhost:5000/patients/${patientId}/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to change password');
        }

        // Update local state with the response data
        setUserData(prev => ({
            ...prev,
            hasChangedPassword: data.hasChangedPassword,
            hasLocalPassword: data.hasLocalPassword
        }));

        setRequiresPasswordChange(false);
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        
        alert('Password changed successfully!');
    } catch (err) {
        alert(err.message);
        console.error('Error changing password:', err);
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-blue-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`}>
      <UserSideBar />
      <div className={`flex-1 flex flex-col items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-8`}>
        {!userData.isProfileComplete && (
          <div className="w-full max-w-2xl mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            ⚠️ Please complete your profile to access all features
          </div>
        )}

        <div className={`w-full max-w-2xl p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-white text-gray-800'}`}>
        <div className="flex justify-center mb-6">
    <div className="relative group">
        <img
            className="h-24 w-24 rounded-full border-4 shadow-lg object-cover"
            src={previewUrl}
            alt="Profile"
            onError={(e) => {
                console.error('Error loading image:', e);
                e.target.src = User_Profile; // Fallback to default image
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
</div>
          <div className={`text-center text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-blue-900'}`}>
            {`${userData.firstName} ${userData.lastName}`}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>First Name*</label>
                <input
                  type="text"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  }`}
                  required
                />
              </div>
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Middle Name</label>
                <input
                  type="text"
                  value={userData.middleName}
                  onChange={(e) => setUserData({ ...userData, middleName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Last Name*</label>
                <input
                  type="text"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  }`}
                  required
                />
              </div>
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Suffix</label>
                <select 
                  value={userData.suffix}
                  onChange={(e) => setUserData({ ...userData, suffix: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  }`}
                >
                  <option value="None">None</option>
                  <option value="Jr.">Jr.</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Contact Number*</label>
                <input
                  type="tel"
                  value={userData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numeric values and proper length
                    if (/^[0-9]*$/.test(value) && value.length <= 11) {
                      setUserData({ ...userData, phoneNumber: value });
                      setPhoneError(validatePhoneNumber(value));
                    }
                  }}
                  onKeyPress={(e) => {
                    const value = e.target.value;
                    // Prevent non-numeric input and enforce 09 prefix
                    if (
                      !/[0-9]/.test(e.key) || 
                      value.length >= 11 ||
                      (value.length === 0 && e.key !== '0') ||
                      (value.length === 1 && value === '0' && e.key !== '9')
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData('text');
                    if (/^09[0-9]{9}$/.test(pastedText)) {
                      setUserData({ ...userData, phoneNumber: pastedText });
                      setPhoneError("");
                    } else {
                      setPhoneError("Invalid phone number format");
                    }
                  }}
                  maxLength={11}
                  placeholder="09123456789"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  } ${phoneError ? 'border-red-500' : ''}`}
                  required
                />
                {phoneError && (
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {phoneError}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Email</label>
                <input
                  type="email"
                  value={userData.email}
                  className={`w-full px-4 py-3 border rounded-lg cursor-not-allowed ${
                    isDarkMode ? 'bg-gray-600 text-white border-gray-600' : 'bg-gray-100 text-gray-500 border-gray-300'
                  }`}
                  required
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Sex at Birth*</label>
                <select 
                  value={userData.sex}
                  onChange={(e) => setUserData({ ...userData, sex: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'
                  }`}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex-1">
                <label className={`block ${isDarkMode ? 'text-white' : 'text-gray-600'}`}>Birthday*</label>
                <input
                  type="date"
                  value={userData.birthday}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    if (date instanceof Date && !isNaN(date)) {
                      setUserData({ ...userData, birthday: e.target.value });
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-gray-700 text-white border-gray-600 [color-scheme:dark]' : 'bg-white text-gray-900 border-gray-300'
                  }`}
                  required
                />
              </div>
            </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {userData.isProfileComplete ? 'Update Profile' : 'Complete Profile'}
          </button>
            {!userData.isGoogleUser && (
                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Change Password
                </button>
            )}
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
       

        {/* Add this modal at the end of your return statement, before the closing div */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">
                {requiresPasswordChange ? 'Change Default Password' : 'Change Password'}
            </h2>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-gray-600">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2 border rounded bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-4 py-2 border rounded bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2 border rounded bg-white "
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg- 
                     blue-700"
                  >
                    Change Password
                  </button>
                  {!requiresPasswordChange && (
                <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded 
                     hover:bg-gray-400"
                >
                    Cancel
                </button>
            )}

                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;