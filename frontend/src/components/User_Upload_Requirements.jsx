import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import UserSideBar from "../components/UserSideBar";
import toast from 'react-hot-toast';

const User_Upload_Requirements = () => {
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [schoolIdFile, setSchoolIdFile] = useState(""); 
  const [registrationCertFile, setRegistrationCertFile] = useState(""); 
  const [vaccinationCardFile, setVaccinationCardFile] = useState(""); 
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
  
      const response = await fetch(`http://localhost:5000/patients/${patientId}/profile`, {
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
      
      if (!data.isProfileComplete) {
        navigate('/profile', { 
          state: { message: 'Please complete your profile before uploading requirements' }
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
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-blue-600 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* UserSideBar */}
      <UserSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className="text-2xl font-semibold text-[#003367]">Upload Requirements</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* New Search Icon (Magnifying Glass) */}
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M16 10a6 6 0 1112 0 6 6 0 01-12 0z"
                  />
                </svg>
              </div>

              {/* Notifications Button */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <img className="w-6 h-6" src={bell} alt="Notifications" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-[#003367] mb-6">Upload Your Requirements</h2>

          {/* Upload Requirements Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* School ID Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#003367] mb-4">School ID</h3>
              <p className="text-gray-600 mb-4">
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
                className="cursor-pointer inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center"
              >
                {schoolIdFile || "Choose a file"}
              </label>
              {renderUploadStatus("schoolId")}
            </div>

            {/* Certificate of Registration */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#003367] mb-4">Certificate of Registration</h3>
              <p className="text-gray-600 mb-4">
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
                className="cursor-pointer inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center"
              >
                {registrationCertFile || "Choose a file"}
              </label>
              {renderUploadStatus("registrationCert")}
            </div>

            {/* Vaccination Card */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#003367] mb-4">Vaccination Card</h3>
              <p className="text-gray-600 mb-4">
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
                className="cursor-pointer inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center"
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
