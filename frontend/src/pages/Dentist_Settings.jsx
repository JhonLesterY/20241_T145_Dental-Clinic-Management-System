import { useState, useEffect } from "react";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import DentistSideBar from "../components/DentistSidebar";
import { useDentistTheme } from '../context/DentistThemeContext';

// Helper function to format dates
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const Dentist_Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const { isDarkMode, toggleTheme } = useDentistTheme();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);

  const today = new Date().toLocaleDateString();

  useEffect(() => {
    // Fetch consultations data from an API or mock data
    const fetchConsultations = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch("http://localhost:5000/consultations");
        const data = await response.json();
        setConsultations(data);
      } catch (error) {
        console.error("Error fetching consultations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch feedbacks data
    const fetchFeedbacks = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch("http://localhost:5000/feedbacks");
        const data = await response.json();
        setFeedbacks(data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      }
    };

    fetchConsultations();
    fetchFeedbacks();
  }, []);

  // Handle button click actions for View Feedback
  const handleViewFeedbackClick = (consultationId) => {
    const feedback = feedbacks.filter(fb => fb.consultationId === consultationId);
    setSelectedFeedback(feedback.length ? feedback[0].feedback : "No feedback available");
  };

  // Toggle notifications
  const toggleNotifications = () => {
    setIsNotificationsEnabled(!isNotificationsEnabled);
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}>
                <img className="w-6 h-6" src={bell} alt="Notifications" />
              </button>
            </div>
          </div>
        </header>

        <div className="w-[78rem] mx-auto my-4"></div>

        <div className="flex flex-col gap-5 mt-8 mx-auto w-full max-w-6xl">
          <div className={`border shadow-md p-5 rounded-xl mb-1.5 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-center">
              <span>Switch Theme</span>
              <button 
                onClick={toggleTheme}
                className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center transform hover:scale-105 transition-transform duration-200 ease-in-out"
              >
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className={`border shadow-md p-5 rounded-xl mb-1.5 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-center">
              <span>Notification Settings</span>
              <button className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center transform hover:scale-105 transition-transform duration-200 ease-in-out">Edit</button>
            </div>
          </div>

          {/* Help */}
          <div className={`border shadow-md p-5 rounded-xl mb-1.5 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-center">
              <span>Help</span>
              <button className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center transform hover:scale-105 transition-transform duration-200 ease-in-out">View</button>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className={`border shadow-md p-5 rounded-xl mb-1.5 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            <div className="flex justify-between items-center">
              <span>Privacy Policy</span>
              <button className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center transform hover:scale-105 transition-transform duration-200 ease-in-out">View</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dentist_Settings;
