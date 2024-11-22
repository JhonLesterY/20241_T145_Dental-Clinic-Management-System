import { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import User_Profile from "/src/images/user.png";
import AdminSideBar from "../components/AdminSideBar";

const AdminProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    fullname: "",
    email: sessionStorage.getItem('email') || "",
    phoneNumber: "",
    sex: "",
    birthday: "",
    isProfileComplete: false
});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(User_Profile);
  const fileInputRef = useRef(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(
    sessionStorage.getItem('hasChangedPassword') !== 'true'
  );
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!sessionStorage.getItem('hasChangedPassword')) {
      setShowPasswordModal(true);
      setRequiresPasswordChange(true);
    }
    fetchAdminProfile();    
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


const fetchAdminProfile = async () => {
  try {
      const adminId = sessionStorage.getItem('admin_id');
      const token = sessionStorage.getItem('token');
      
      if (!adminId) {
          throw new Error('Admin ID not found in session');
      }

      const response = await fetch(`http://localhost:5000/admin/${adminId}/profile`, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      if (!response.ok) {
          throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      // Format the date to YYYY-MM-DD for the input field
      const formattedBirthday = data.birthday ? 
          new Date(data.birthday).toISOString().split('T')[0] : '';

      setUserData({
          ...data,
          birthday: formattedBirthday
      });

      setIsLoading(false);
  } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
      setIsLoading(false);
  }
};
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
      const adminId = sessionStorage.getItem('admin_id');
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

      const response = await fetch(`http://localhost:5000/admin/${adminId}/profile`, {
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
      
      // Update session storage with profile completion status
      sessionStorage.setItem('isProfileComplete', 'true');
      
      // Force reload sidebar state
      window.dispatchEvent(new Event('profileUpdate'));
      
      alert('Profile updated successfully');
      
      // Reload the page or redirect to dashboard
      window.location.href = '/admin-dashboard';
  } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message);
  }
};
// Update password change handler
const handlePasswordChange = async (currentPassword, newPassword) => {
  try {
      const adminId = sessionStorage.getItem('admin_id');
      const token = sessionStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/admin/${adminId}/change-password`, {
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || 'Failed to change password');
      }

      // Update session storage and state
      sessionStorage.setItem('hasChangedPassword', 'true');
      setHasChangedPassword(true);
      setShowPasswordModal(false);
      
      alert('Password changed successfully');
      
      // Refresh the page to update all states
      window.location.reload();
  } catch (error) {
      console.error('Error changing password:', error);
      alert(error.message);
  }
};
    

const handleLogout = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('admin_id');
  sessionStorage.removeItem('role');
  sessionStorage.clear();
  navigate('/login');
};

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-blue-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      <AdminSideBar />
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 text-white p-8">
        {!userData.isProfileComplete && (
          <div className="w-full max-w-2xl mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            ⚠️ Please complete your profile to access all features
          </div>
        )}

        <div className="w-full max-w-2xl p-8 bg-white text-gray-800 rounded-lg shadow-lg">
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
          <div className="text-center text-2xl font-semibold text-blue-900">
            {`${userData.firstName} ${userData.lastName}`}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-600">First Name*</label>
                <input
                  type="text"
                  value={userData.firstName}
                  onChange={(e) => setUserData({ ...userData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-600">Middle Name</label>
                <input
                  type="text"
                  value={userData.middleName}
                  onChange={(e) => setUserData({ ...userData, middleName: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-600">Last Name*</label>
                <input
                  type="text"
                  value={userData.lastName}
                  onChange={(e) => setUserData({ ...userData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-600">Suffix</label>
                <select 
                  value={userData.suffix}
                  onChange={(e) => setUserData({ ...userData, suffix: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-gray-600">Contact Number*</label>
                <input
                  type="text"
                  value={userData.phoneNumber}
                  onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-600">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-gray-600">Sex at Birth*</label>
                <select 
                  value={userData.sex}
                  onChange={(e) => setUserData({ ...userData, sex: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Sex</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-gray-600">Birthday*</label>
                <input
                  type="date"
                  value={userData.birthday}
                  onChange={(e) => setUserData({ ...userData, birthday: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
         {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20   
             text-center sm:p-0">
              <div className="relative bg-white rounded-lg p-8 max-w-md w-full mx-auto  
               shadow-xl">
                <h2 className="text-xl font-bold mb-4">
                  {requiresPasswordChange ? 'Change Default Password' : 'Change Password'}
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-gray-600">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword:   
                         e.target.value})}
                      className="w-full px-4 py-2 border rounded bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword:   
                         e.target.value})}
                      className="w-full px-4 py-2 border rounded bg-white "
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword:   
                         e.target.value})}
                      className="w-full px-4 py-2 border rounded bg-white "
                      required
                    />
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-  
                       700"
                    >
                      Change Password
                    </button>
                    {!requiresPasswordChange && (
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(false)}
                        className="flex-1 py-2 bg-gray-300 text-gray-700 rounded hover:bg-  
                         gray-400"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;