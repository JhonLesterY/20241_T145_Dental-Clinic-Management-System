import { Link, NavLink } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "/src/images/Dental_logo.png";
import bell from "/src/images/bell.png";
import magnify from "/src/images/magnifying-glass.png";

const TIME_SLOTS = [
  { time: "8:00 - 10:00 AM", id: 1 },
  { time: "10:30 - 12:30 NN", id: 2 },
  { time: "1:00 - 3:00 PM", id: 3 },
  { time: "3:00 - 5:00 PM", id: 4 }
];

const User_Appointment = () => {
  const navigate = useNavigate();
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    checkProfileCompletion();
  }, []); 

  useEffect(() => {
    fetchAvailableSlots(currentDate);
  }, [currentDate]);

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
      const token = sessionStorage.getItem('token');
      const formattedDate = date.toISOString().split('T')[0];
      
      const response = await fetch(`http://localhost:5000/appointments/available-slots?date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const data = await response.json();
      const slotsWithAvailability = TIME_SLOTS.map(slot => ({
        ...slot,
        available: data.availableSlots?.includes(slot.id) ?? true
      }));
      setAvailableSlots(slotsWithAvailability);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots(TIME_SLOTS.map(slot => ({ ...slot, available: false })));
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden lg:block w-1/4 bg-gray-50 text-gray-700">
        <Dashboard />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="w-full shadow-lg bg-gray-50">
          <div className="flex items-center justify-between p-4 max-w-5xl mx-auto">
            {/* Logo and Appointment Link */}
            <div className="flex items-center space-x-4">
              <img className="w-11 cursor-pointer" src={Logo} alt="Dental logo" />
              <Link
                to="/appointment"
                className="text-xl font-semibold text-[#003367] hover:text-blue-500 transition"
              >
                Appointment
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex items-center bg-white border rounded-xl px-3 py-1">
              <img className="w-5" src={magnify} alt="Search icon" />
              <input
                type="text"
                placeholder="Search"
                className="ml-2 p-1 outline-none w-full"
                aria-label="Search for appointments"
              />
            </div>

            {/* Notification Bell */}
            <button
              className="bg-gray-100 p-3 rounded-full hover:bg-gray-200 focus:outline-none"
              aria-label="Notifications"
            >
              <img className="w-6" src={bell} alt="Notifications" />
            </button>
          </div>
        </header>

        <div className="w-[95rem] mx-auto my-4"></div>

        {/* Appointment Content */}
        <div className="flex flex-col items-center mt-5 mx-auto w-full max-w-5xl">
          <h1 className="text-3xl font-semibold text-[#003367] mb-6 text-center">
            Book Your Appointment
          </h1>

          {/* Date Section */}
          <div className="flex flex-col items-center mb-4">
            <div className="flex gap-2 items-center">
              <div className="border rounded-md px-2 py-1 bg-gray-100 shadow-md text-gray-700">
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
          <div className="flex justify-end mt-4">
            <button
              onClick={handleNext}
              disabled={!selectedSlot}
              className={`
                cursor-pointer shadow-sm rounded-xl px-5 py-2 
                ${selectedSlot 
                  ? 'bg-[#003367] hover:shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out' 
                  : 'bg-gray-400 cursor-not-allowed'
                }
                text-white
              `}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default User_Appointment;
