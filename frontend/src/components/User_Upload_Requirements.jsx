import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import UserSideBar from "../components/UserSideBar";
import toast from 'react-hot-toast';
import User_Profile_Header from "../components/User_Profile_Header";
import { useUserTheme } from '../context/UserThemeContext';

const User_Upload_Requirements = () => {
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [schoolIdFile, setSchoolIdFile] = useState(""); 
  const [registrationCertFile, setRegistrationCertFile] = useState(""); 
  const [vaccinationCardFile, setVaccinationCardFile] = useState(""); 
  const { isDarkMode } = useUserTheme();
  const [uploadStatus, setUploadStatus] = useState({
    schoolId: { status: '', link: '' },
    registrationCert: { status: '', link: '' },
    vaccinationCard: { status: '', link: '' }
  });

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const patientId = sessionStorage.getItem('patient_id');
      const token = sessionStorage.getItem('token');
  
      if (!token || !patientId) {
        console.log('Missing authentication credentials');
        sessionStorage.clear();
        navigate('/login');
        return;
      }
  
      const response = await fetch(`http://localhost:5000/patients/numeric/${patientId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Profile fetch error:', data);
        if (response.status === 401 || response.status === 404) {
          sessionStorage.clear();
          navigate('/login', { 
            state: { message: data.message || 'Please login again.' }
          });
          return;
        }
        throw new Error(data.message || 'Failed to fetch profile');
      }
      
      console.log('Profile data received:', data);
      sessionStorage.setItem('userData', JSON.stringify(data));
      
      // Special handling for Google users
      const isProfileIncomplete = data.isGoogleUser ? 
        !data.firstName || !data.lastName || !data.phoneNumber || !data.sex || !data.birthday :
        !data.isProfileComplete || !data.hasChangedPassword;
  
      if (isProfileIncomplete) {
        navigate('/profile', { 
          state: { message: 'Please complete your profile first' }
        });
        return;
      }
      
      setIsProfileComplete(true);
    } catch (error) {
      console.error('Error checking profile:', error);
      sessionStorage.clear();
      navigate('/login', {
        state: { message: 'An error occurred. Please login again.' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file, fileType) => {
    try {
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { status: 'uploading', link: '' }
      }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', sessionStorage.getItem('patient_id'));
      formData.append('patientName', `${JSON.parse(sessionStorage.getItem('userData') || '{}').firstName || ''}_${JSON.parse(sessionStorage.getItem('userData') || '{}').lastName || ''}`);
      formData.append('fileType', fileType);

      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: formData
      });

      const uploadResult = await response.json();

      if (!response.ok) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { 
          status: 'success', 
          link: uploadResult.webViewLink 
        }
      }));

      if (fileType === "schoolId") setSchoolIdFile(uploadResult.fileName);
      if (fileType === "registrationCert") setRegistrationCertFile(uploadResult.fileName);
      if (fileType === "vaccinationCard") setVaccinationCardFile(uploadResult.fileName);

      alert('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(prev => ({
        ...prev,
        [fileType]: { status: 'error', link: '' }
      }));
      alert(error.message || 'Failed to upload file');
    }
  };

  const handleFileChange = async (event, fileType) => {
    const file = event.target.files[0];
    if (file) {
      if (fileType === "schoolId") setSchoolIdFile(file.name);
      if (fileType === "registrationCert") setRegistrationCertFile(file.name);
      if (fileType === "vaccinationCard") setVaccinationCardFile(file.name);
      await handleFileUpload(file, fileType);
    }
  };

  const renderUploadStatus = (fileType) => {
    const status = uploadStatus[fileType].status;
    if (status === 'uploading') {
      return <p className="text-blue-500 mt-2">Uploading...</p>;
    } else if (status === 'success') {
      return (
        <div className="mt-2">
          <p className="text-green-500">Upload successful!</p>
          <a 
            href={uploadStatus[fileType].link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View file
          </a>
        </div>
      );
    } else if (status === 'error') {
      return <p className="text-red-500 mt-2">Upload failed. Please try again.</p>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className={`flex h-screen w-screen items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <div className={`text-xl ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* UserSideBar */}
      <UserSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <User_Profile_Header/>

        {/* Main Dashboard Content */}
        <div className="p-6">
          <h2 className={`text-2xl font-semibold mb-6 ${
            isDarkMode ? 'text-white' : 'text-[#003367]'
          }`}>
            Upload Your Requirements
          </h2>

          {/* Upload Requirements Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* School ID Card */}
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-[#003367]'
              }`}>
                School ID
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Upload your valid school ID to verify your enrollment status.
              </p>
              <input 
                type="file" 
                className="hidden" 
                id="schoolId" 
                onChange={(e) => handleFileChange(e, "schoolId")} 
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label 
                htmlFor="schoolId" 
                className={`cursor-pointer inline-block font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                }`}
              >
                {schoolIdFile || "Choose a file"}
              </label>
              {renderUploadStatus("schoolId")}
            </div>

            {/* Certificate of Registration */}
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-[#003367]'
              }`}>
                Certificate of Registration
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Upload your Certificate of Registration to confirm your academic registration.
              </p>
              <input 
                type="file" 
                className="hidden" 
                id="registrationCert" 
                onChange={(e) => handleFileChange(e, "registrationCert")} 
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label 
                htmlFor="registrationCert" 
                className={`cursor-pointer inline-block font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                }`}
              >
                {registrationCertFile || "Choose a file"}
              </label>
              {renderUploadStatus("registrationCert")}
            </div>

            {/* Vaccination Card */}
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-[#003367]'
              }`}>
                Vaccination Card
              </h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Upload your vaccination card to verify your immunization status.
              </p>
              <input 
                type="file" 
                className="hidden" 
                id="vaccinationCard" 
                onChange={(e) => handleFileChange(e, "vaccinationCard")} 
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label 
                htmlFor="vaccinationCard" 
                className={`cursor-pointer inline-block font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                }`}
              >
                {vaccinationCardFile || "Choose a file"}
              </label>
              {renderUploadStatus("vaccinationCard")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Upload_Requirements;
