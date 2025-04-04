import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import dentist from "/src/images/dentist.jpeg";
import dentalchair from "/src/images/Dental_Chair_.jpg";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import userIcon from "/src/images/user.png";
import User_Profile_Header from "../components/User_Profile_Header";
import UserSideBar from "../components/UserSideBar";
import { useUserTheme } from '../context/UserThemeContext';
import LoadingOverlay from "../components/LoadingOverlay";

const User_Dashboard = () => {
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDarkMode } = useUserTheme();

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async () => {
    try {
      const patientId = sessionStorage.getItem('patient_id');
      const token = sessionStorage.getItem('token');
  
      if (!token || !patientId) {
        console.log('Missing authentication credentials');
        navigate('/login');
        return;
      }
  
      const response = await fetch(`http://localhost:5000/patients/numeric/${patientId}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('patient_id');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      console.log('Profile data:', data);
      
      const isProfileIncomplete = data.isGoogleUser ? 
        !data.firstName || !data.lastName || !data.phoneNumber || !data.sex || !data.birthday :
        !data.isProfileComplete || !data.hasChangedPassword;

      if (isProfileIncomplete) {
        navigate('/profile', { 
          state: { message: 'Please complete your profile to access the dashboard' }
        });
        return;
      }
      
      setIsProfileComplete(true);
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <UserSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-64' : 'ml-16'} relative`}>
        <User_Profile_Header/>
        
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-90 z-50 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading Dashboard...</h2>
            </div>
          </div>
        )}
        
        {!isLoading && (
          <div className="p-6">
            <h2 className={`text-2xl font-semibold mb-6 ${
              isDarkMode ? 'text-white' : 'text-[#003367]'
            }`}>
              Welcome to Your Dashboard
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <img
                  className="w-full h-48 object-cover"
                  src={dentist}
                  alt="Dental Services"
                />
                <div className="p-4">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-[#003367]'
                  }`}>Free Dental Care</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Access free dental care services available for BukSU students and personnel. We believe that a healthy smile is for everyone! 
                    Our clinic provides free dental care services to ensure that high-quality oral health is accessible to all. 
                    From routine check-ups to basic dental procedures, we are here to help you maintain your best smile without any financial barriers.
                  </p>
                </div>
              </div>

              <div className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <img
                  className="w-full h-48 object-cover"
                  src={dentalchair}
                  alt="Dental Equipment"
                />
                <div className="p-4">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-[#003367]'
                  }`}>Modern Facilities</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Our clinic is equipped with state-of-the-art technology and modern facilities, ensuring a comfortable and efficient dental experience. 
                    With advanced tools and equipment, we deliver precise and effective treatments, all in a clean and welcoming environment.

                    Your dental health is our priority—experience the perfect blend of compassionate care and cutting-edge solutions at our clinic!
                  </p>
                </div>
              </div>

              <div className={`rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-xl font-bold mb-6 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-[#003367]'
                }`}>
                  <span className={`p-2 rounded-lg mr-3 ${
                    isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                  }`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </span>
                  Available Services
                </h3>
                
                <ul className="space-y-4">
                  {[
                    { name: 'Tooth Extraction', description: 'Professional tooth removal service' },
                    { name: 'Dental Consultation', description: 'Expert dental health evaluation' },
                    { name: 'Fluoride Treatment', description: 'Preventive dental care' },
                    { name: 'Oral Examination', description: 'Comprehensive mouth check-up' }
                  ].map((service, index) => (
                    <li key={index} className={`flex items-start p-3 rounded-lg transition-colors duration-200 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                    }`}>
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5"></div>
                      </div>
                      <div className="ml-4">
                        <h4 className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-[#003367]'
                        }`}>{service.name}</h4>
                        <p className={`text-sm mt-1 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>{service.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to="/appointment" 
                  className="mt-6 inline-block w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-3 px-6 rounded-full transition-colors duration-200 text-center"
                >
                  <div className="flex items-center justify-center">
                    <span>Book Appointment</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 5l7 7-7 7" 
                      />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default User_Dashboard;