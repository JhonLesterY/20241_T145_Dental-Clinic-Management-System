import { Link, NavLink } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import magnify from "/src/images/magnifying-glass.png";
import UserSideBar from "../components/UserSideBar";
import userIcon from "/src/images/user.png";
import User_Profile_Header from "../components/User_Profile_Header";
import { useUserTheme } from '../context/UserThemeContext';

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

const UnavailableModal = ({ setShowUnavailableModal, navigate }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Unavailable</h3>
      <p className="text-gray-600 mb-6">
        We apologize, but the clinic is currently unavailable for appointments. Please check again another time.
      </p>
      <div className="flex justify-end">
        <button
          onClick={() => {
            setShowUnavailableModal(false);
            navigate('/dashboard');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  </div>
);

const BlockedDateModal = ({ showBlockedModal, setShowBlockedModal, blockedDate, setCurrentDate }) => (
  <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showBlockedModal ? '' : 'hidden'}`}>
    <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinic Unavailable</h3>
      <p className="text-gray-600 mb-6">
        We apologize, but the clinic will be unavailable on {blockedDate ? new Date(blockedDate).toLocaleDateString() : ''}. 
        Please select a different date for your appointment.
      </p>
      <div className="flex justify-end">
        <button
          onClick={() => {
            setShowBlockedModal(false);
            setCurrentDate(new Date());
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

const User_Appointment = () => {
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDateBlocked, setIsDateBlocked] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const { isDarkMode } = useUserTheme();

  useEffect(() => {
    const checkCurrentDate = async () => {
      try {
        setIsLoading(true);
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];

        const response = await fetch(`http://localhost:5000/admin/calendar/blocked-dates/${formattedDate}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to check date availability');
        }

        const { isBlocked } = await response.json();
        
        // Reset the state based on current check
        setIsDateBlocked(isBlocked);
        if (isBlocked) {
          setShowUnavailableModal(true);
          return;
        } else {
          setShowUnavailableModal(false);
        }
        
        // If not blocked, check profile completion
        if (!isBlocked) {
          await checkProfileCompletion();
        }
      } catch (error) {
        console.error('Error checking date:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentDate();
  }, []); // Empty dependency array means this runs once when component mounts

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

  const fetchAvailableSlots = async (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      
      const blockedResponse = await fetch(`http://localhost:5000/admin/calendar/blocked-dates/${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      const { isBlocked } = await blockedResponse.json();
      
      // Reset the state based on current check
      setIsDateBlocked(isBlocked);
      if (isBlocked) {
        setShowUnavailableModal(true);
        return;
      } else {
        setShowUnavailableModal(false);
      }
      
      // Only fetch slots if date is not blocked
      if (!isBlocked) {
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
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
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

  if (isDateBlocked || showUnavailableModal) {
    return (
      <div className="flex h-screen bg-gray-100">
        <UserSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex items-center justify-center">
          <UnavailableModal 
            setShowUnavailableModal={setShowUnavailableModal} 
            navigate={navigate} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Sidebar */}
      <UserSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <User_Profile_Header/>
        <div className="w-[78rem] mx-auto my-4"></div>

        {/* Date Section */}
        <div className="flex flex-col items-center mb-4">
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-md w-full max-w-md">
              Today: {formatDate(new Date())}
            </div>
          </div>
        </div>

        {/* Appointment Slot Section */}
        <div className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl shadow-lg max-w-4xl mx-auto p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {formatDate(currentDate)}
            </div>
          </div>

          <div className="space-y-4">
            {TIME_SLOTS.map((slot) => {
              const slotData = availableSlots.find(s => s.id === slot.id) || {};
              const isAvailable = slotData.available;
              const remainingSlots = slotData.remainingSlots || 0;
              
              return (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
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
                        !isAvailable 
                          ? 'cursor-not-allowed text-gray-400' 
                          : isDarkMode 
                            ? 'text-gray-200' 
                            : 'text-gray-700'
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
            <div className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
              cursor-pointer shadow-sm rounded-xl px-5 py-2 text-white
              ${selectedSlot && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out' 
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
