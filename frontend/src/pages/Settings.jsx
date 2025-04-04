import { useState, useEffect } from "react";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import UserSideBar from "../components/UserSideBar";
import User_Profile_Header from "../components/User_Profile_Header";
import { useUserTheme } from '../context/UserThemeContext';

// Helper function to format dates
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true); // State for notifications toggle

  const today = new Date().toLocaleDateString();

  const { isDarkMode, toggleTheme } = useUserTheme();

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
      {/* UserSideBar */}
      <UserSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}
      >
        <User_Profile_Header/>

        <div className="w-[78rem] mx-auto my-4"></div>

        {/* Dentist Settings Section */}
        <div className="flex flex-col gap-5 mt-8 mx-auto w-full max-w-6xl p-4">
          {/* Switch Theme */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border shadow-md p-5 rounded-xl mb-1.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>
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
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border shadow-md p-5 rounded-xl mb-1.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            <div className="flex justify-between items-center">
              <span>Notification Settings</span>
              <button className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                Edit
              </button>
            </div>
          </div>

          {/* Help */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border shadow-md p-5 rounded-xl mb-1.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            <div className="flex justify-between items-center">
              <span>Help</span>
              <button className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                View
              </button>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border shadow-md p-5 rounded-xl mb-1.5 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            <div className="flex justify-between items-center">
              <span>Privacy Policy</span>
              <button className="inline-block bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
                View
              </button>
            </div>
          </div>
          </div>
      </div>
    </div>
  );
};

export default Settings;
