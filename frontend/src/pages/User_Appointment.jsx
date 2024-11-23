import { Link, NavLink } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import magnify from "/src/images/magnifying-glass.png";
import UserSideBar from "../components/UserSideBar";
import userIcon from "/src/images/user.png";

const TIME_SLOTS = [
  { time: "8:00 - 10:00 AM", id: 1 },
  { time: "10:30 - 12:30 NN", id: 2 },
  { time: "1:00 - 3:00 PM", id: 3 },
  { time: "3:00 - 5:00 PM", id: 4 }
];

// Helper function to format dates
const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

const User_Appointment = () => {
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkProfileCompletion();
  }, []); 

  useEffect(() => {
    fetchAvailableSlots(currentDate);
  }, [currentDate]);

  useEffect(() => {
    setSidebarOpen(true);
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
  
      const response = await fetch(`http://localhost:5000/patients/${patientId}/profile`, {
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

      if (!data.isProfileComplete) {
        navigate('/profile', { 
          state: { message: 'Please complete your profile before making an appointment' }
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

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await fetch(`/appointments/available?date=${date}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch slots: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to fetch available slots');
      return [];
    }
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const handleSlotSelection = (slotId) => {
    setSelectedSlot(slotId);
  };

  const handleNext = () => {
    if (selectedSlot) {
      sessionStorage.setItem('appointmentDate', currentDate.toISOString());
      sessionStorage.setItem('appointmentSlot', selectedSlot);
      navigate('/upload-requirements');
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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <UserSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-500 ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className="text-2xl font-semibold text-[#003367]">
                Book Your Appointment
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

              <button
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Notifications"
              >
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

          {/* Appointment Slot Section */}
          <div className="w-full bg-white border rounded-xl shadow-lg max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="text-lg font-medium text-gray-700">{formatDate(currentDate)}</div>
            </div>

            <div className="space-y-4">
              {TIME_SLOTS.map((slot) => {
                const isAvailable = availableSlots.find(s => s.id === slot.id)?.available;
                
                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        id={`slot-${slot.id}`}
                        name="timeSlot"
                        value={slot.id}
                        checked={selectedSlot === slot.id}
                        onChange={() => handleSlotSelection(slot.id)}
                        disabled={!isAvailable}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <label
                        htmlFor={`slot-${slot.id}`}
                        className={`flex-1 flex items-center justify-between cursor-pointer ${
                          !isAvailable ? 'cursor-not-allowed text-gray-400' : 'text-gray-700'
                        }`}
                      >
                        <span className="font-medium">{slot.time}</span>
                        <span 
                          className={`text-sm font-medium ${
                            isAvailable ? 'text-blue-500' : 'text-red-500'
                          }`}
                        >
                          {isAvailable ? 'Available Slots' : 'Fully Booked'}
                        </span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSlot === null && (
              <div className="mt-4 text-sm text-gray-500">
                Please select a time slot to continue
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleNext}
              disabled={!selectedSlot}
              className={`
                cursor-pointer rounded-xl px-6 py-3
                ${selectedSlot 
                  ? 'hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out'
                  : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]cursor-not-allowed text-gray-300 transition-colors duration-200 text-center transform hover:scale-105 transition-transform duration-200 ease-in-out'
                }
                shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              Next
            </button>
          </div>
          </div>
        </div>
     
  );
};

export default User_Appointment;
