import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import UserSideBar from "../components/UserSideBar";
import User_Profile from "/src/images/user.png"; // Default user profile image

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "None",
    phoneNumber: "",
    email: sessionStorage.getItem("email") || "",
    sex: "Male",
    birthday: "",
    isProfileComplete: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(User_Profile);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [requiresPasswordChange, setRequiresPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const patientId = sessionStorage.getItem("patient_id");
      const token = sessionStorage.getItem("token");

      if (!token || !patientId) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/patients/${patientId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch profile");

      const data = await response.json();
      const nameParts = data.name?.split(" ") || [];
      setUserData({
        firstName: data.firstName || nameParts[0] || "",
        middleName: data.middleName || nameParts[1] || "",
        lastName: data.lastName || nameParts[2] || "",
        suffix: data.suffix || "None",
        phoneNumber: data.phoneNumber || "",
        email: data.email || "",
        sex: data.sex || "Male",
        birthday: data.birthday
          ? new Date(data.birthday).toISOString().split("T")[0]
          : "",
        isProfileComplete: data.isProfileComplete || false,
      });

      setPreviewUrl(data.profilePicture || User_Profile);
      setRequiresPasswordChange(!data.isGoogleUser && !data.hasChangedPassword);
      setShowPasswordModal(!data.isGoogleUser && !data.hasChangedPassword);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userData.firstName || !userData.lastName || !userData.phoneNumber) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(userData).forEach((key) => formData.append(key, userData[key]));
      if (profilePicture) formData.append("profilePicture", profilePicture);

      const patientId = sessionStorage.getItem("patient_id");
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/patients/${patientId}/profile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");
      alert("Profile updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const patientId = sessionStorage.getItem("patient_id");
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/patients/${patientId}/change-password`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(passwordData),
        }
      );

      if (!response.ok) throw new Error("Failed to change password");
      alert("Password changed successfully!");
      setShowPasswordModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex">
      <UserSideBar />
      <div className="flex-1 p-6">
        <div className="text-center">
          <img
            src={previewUrl}
            alt="Profile"
            className="w-36 h-36 rounded-full mx-auto"
          />
          <label>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button className="bg-blue-500 text-white px-4 py-2 mt-4">Upload</button>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
