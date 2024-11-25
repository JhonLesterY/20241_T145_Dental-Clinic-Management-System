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
  { time: "8:00 - 10:00 AM", id: 1, maxSlots: 3 },
  { time: "10:30 - 12:30 NN", id: 2, maxSlots: 3 },
  { time: "1:00 - 3:00 PM", id: 3, maxSlots: 3 },
  { time: "3:00 - 5:00 PM", id: 4, maxSlots: 3 }
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      console.log('Checking profile with:', { patientId, token }); // Debug log
      
      if (!token || !patientId) {
        console.log('Missing credentials');
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
        console.log('Profile response not ok:', response.status);
        if (response.status === 401) {
          sessionStorage.clear(); // Clear all session data
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      console.log('Profile data received:', data); // Debug log
  
      // Store user data in session storage
      sessionStorage.setItem('userData', JSON.stringify(data));
      
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
      const formattedDate = date.toISOString().split('T')[0];
      console.log('Fetching slots for date:', formattedDate);
      
      const response = await fetch(`http://localhost:5000/appointments/available?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch slots: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Received slots:', data);
      
      // Transform the data to include remaining slots
      const slotsWithAvailability = TIME_SLOTS.map(slot => {
        const slotData = data.find(s => s.id === slot.id) || {};
        const bookedCount = slotData.bookedCount || 0;
        const remainingSlots = slot.maxSlots - bookedCount;
        return {
          ...slot,
          available: remainingSlots > 0,
          remainingSlots: remainingSlots
        };
      });
      
      setAvailableSlots(slotsWithAvailability);
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Fallback to default slots with max availability
      setAvailableSlots(TIME_SLOTS.map(slot => ({
        ...slot,
        available: true,
        remainingSlots: slot.maxSlots
      })));
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

  const handleNext = async () => {
    if (!selectedSlot) return;
  
    setIsSubmitting(true);
    try {
      const userData = JSON.parse(sessionStorage.getItem('userData'));
      if (!userData) {
        throw new Error('User data not found');
      }
  
      const appointmentData = {
        studentName: `${userData.firstName} ${userData.lastName}`,
        appointmentDate: currentDate.toISOString(),
        timeSlot: selectedSlot
      };
  
      console.log('Sending appointment data:', appointmentData);
  
      const response = await fetch('http://localhost:5000/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(appointmentData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }
  
      const result = await response.json();
      console.log('Appointment created:', result);
      navigate('/upload-requirements');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert(error.message || 'Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                const slotData = availableSlots.find(s => s.id === slot.id) || {};
                const isAvailable = slotData.available;
                const remainingSlots = slotData.remainingSlots || 0;
                
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
                          {isAvailable 
                            ? `Available Slots: ${remainingSlots}` 
                            : 'Fully Booked'}
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
          <div className="flex justify-end mt-4">
                  <button
              onClick={handleNext}
              disabled={!selectedSlot || isSubmitting}
              className={`
                cursor-pointer shadow-sm rounded-xl px-5 py-2 
                ${selectedSlot && !isSubmitting
                  ? 'bg-[#003367] hover:shadow-lg transform hover:scale-105 transition- transform duration-200 ease-in-out' 
                  : 'bg-gray-400 cursor-not-allowed'
                }
                shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              {isSubmitting ? 'Submitting...' : 'Next'}
            </button>
          </div>
          </div>
        </div>
     
  );
};

export default User_Appointment;
