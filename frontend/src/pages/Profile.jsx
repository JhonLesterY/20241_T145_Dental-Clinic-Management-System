import { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import User_Profile from "/src/images/user.png";

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "None",
    phoneNumber: "",
    email: "",
    sex: "Male",
    birthday: "",
    isProfileComplete: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(User_Profile);
  const fileInputRef = useRef(null);

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
            navigate('/login');
            return;
        }
  
        const response = await fetch(`http://localhost:5000/patients/${patientId}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
  
        if (!response.ok) throw new Error('Failed to fetch profile');
      
        const data = await response.json();
        console.log('Profile data received:', data); // Debug log

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
            birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : "",
            isProfileComplete: data.isProfileComplete || false
        });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData();
        
        // Add all user data
        Object.keys(userData).forEach(key => {
            formData.append(key, userData[key]);
        });

        // Add profile picture if selected
        if (profilePicture) {
            formData.append('profilePicture', profilePicture);
        }

        const patientId = sessionStorage.getItem('patient_id');
        const token = sessionStorage.getItem('token');

        const response = await fetch(`http://localhost:5000/patients/${patientId}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
                // Don't set Content-Type header when sending FormData
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to update profile');

        const data = await response.json();
        console.log('Profile updated:', data);

        // Update the preview URL if a new picture was uploaded
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
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      <Dashboard />
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
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
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

export default Profile;