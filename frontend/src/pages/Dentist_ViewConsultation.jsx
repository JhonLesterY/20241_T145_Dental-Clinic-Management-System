import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

const Dentist_ViewConsultation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useDentistTheme();

  const today = new Date().toLocaleDateString();

  useEffect(() => {
    // Fetch consultations data from an API or mock data
    const fetchConsultations = async () => {
      try {
        const response = await fetch("http://localhost:5000/consultations");
        const data = await response.json();
        setConsultations(data);
      } catch (error) {
        console.error("Error fetching consultations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultations();
  }, []);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <DentistSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <header className={`${isDarkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white'} shadow-md`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-[#003367]'}`}>View Consultations</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className={`pl-10 pr-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                {/* New Search Icon (Magnifying Glass) */}
                <svg
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
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

              <button className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Notifications">
                <img className="w-6 h-6" src={bell} alt="Notifications" />
              </button>
            </div>
          </div>
        </header>

        <div className="w-[78rem] mx-auto my-4"></div>

        {/* Date Section */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-md w-full max-w-md">
              Today: {formatDate(new Date())}
            </div>
          </div>
        </div>

        {/* Consultations List */}
        <div className="flex flex-col items-center mt-6 mx-auto w-full max-w-7xl">
          <div className={`w-full border rounded-xl shadow-lg max-w-6xl mx-auto p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {isLoading ? (
              <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading...</div>
            ) : consultations.length === 0 ? (
              <div className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming consultations</div>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'border-gray-700 hover:bg-gray-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Consultation #{consultation.consultationNumber}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Scheduled for: {formatDate(new Date(consultation.scheduledTime))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/consultation-details/${consultation.id}`}
                        className="text-blue-500 hover:text-blue-400 transition"
                      >
                        View Consultation
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dentist_ViewConsultation;
