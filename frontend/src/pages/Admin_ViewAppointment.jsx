import { useState, useEffect } from "react";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import AdminSideBar from "../components/AdminSideBar";

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

const Admin_ViewAppointment = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className="text-2xl font-semibold text-[#003367]">View Appointment</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {/* Search Icon */}
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

        {/* Appointment Box */}
        <div className="mt-6 space-y-4 mx-auto w-full max-w-5xl px-4">
          <div className="border shadow-lg p-5 rounded-xl mb-1.5 text-black bg-white">
            <div className="grid grid-cols-4 gap-5 items-center">
              {/* Column 1: Appointment Number */}
              <span className="text-center">01</span>
              {/* Column 2: Consultation ID */}
              <span className="text-center">2201103921</span>
              {/* Column 3: Time Slot */}
              <span className="text-center">8:00 - 10:00 AM</span>

              {/* Column 4: Actions (✔️ and ❌ buttons) */}
              <div className="flex space-x-4 ml-4">
              <button className="bg-green-200 p-2 w-20 rounded-lg transform hover:scale-105 transition-transform duration-200 ease-in-out">✔️</button>
              <button className="bg-red-200 p-2 w-20 rounded-lg transform hover:scale-105 transition-transform duration-200 ease-in-out">❌</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin_ViewAppointment;
