import { useState, useRef } from "react";
import DentistSideBar from "../components/DentistSidebar";
import User_Profile from "/src/images/user.png";
import { useDentistTheme } from '../context/DentistThemeContext';

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(User_Profile); // Default profile image
  const [userData, setUserData] = useState({
    firstName: "William James",
    middleName: "Von",
    lastName: "Moriarty",
    suffix: "None",
    contactNumber: "0912-345-6789",
    email: "Criminalgenuis@example.com",
    sex: "Male",
    birthday: "1990-01-01",
    isProfileComplete: true,
  });

  const fileInputRef = useRef();
  const { isDarkMode } = useDentistTheme();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(userData);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col overflow-y-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex-1 flex flex-col items-center p-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {/* Profile Image Upload */}
          <div className="mb-6 text-center relative">
            <img
              src={previewUrl}
              alt="Profile"
              className="w-36 h-36 rounded-full border-6 border-white shadow-md"
            />
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full shadow-lg cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              <span className="material-icons">camera_alt</span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
            {Object.entries(userData).map(([key, value], idx) => (
              key !== "isProfileComplete" && (
                <div key={idx} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  {key === "sex" || key === "suffix" ? (
                    <select
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {key === "sex" ? (
                        <>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </>
                      ) : (
                        <>
                          <option value="None">None</option>
                          <option value="Jr">Jr</option>
                          <option value="Sr">Sr</option>
                          <option value="III">III</option>
                        </>
                      )}
                    </select>
                  ) : (
                    <input
                      type={key === "email" ? "email" : key === "birthday" ? "date" : "text"}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Enter ${key.replace(/([A-Z])/g, " $1")}`}
                    />
                  )}
                </div>
              )
            ))}
            <div className="col-span-full flex justify-center">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-medium rounded-full shadow-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
