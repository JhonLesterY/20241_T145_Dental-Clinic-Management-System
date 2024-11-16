import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faBell,
    faThLarge,
    faClipboardList,
    faComments,
    faCog,
    faCalendarAlt,
    faTooth,
    faChevronLeft,
    faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { initClient, getEvents, addEventToGoogleCalendar } from '../components/calendarHelper';
import { gapi } from 'gapi-script';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const AdminCalendar = () => {
    const { accessToken, googleLogin } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [profileImage, setProfileImage] = useState(null);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [newEvent, setNewEvent] = useState({
        summary: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
    });
    const [showAppointmentForm, setShowAppointmentForm] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        studentName: '',
        studentId: '',
        date: '',
        time: '',
        serviceType: '',
        notes: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCalendarData = async () => {
            if (!accessToken) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                const timeMin = new Date().toISOString();
                const response = await fetch(
                    `https://www.googleapis.com/calendar/v3/calendars/primary/events`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        params: {
                            timeMin: timeMin,
                            maxResults: 10,
                            singleEvents: true,
                            orderBy: 'startTime'
                        }
                    }
                );

                if (!response.ok) {
                    if (response.status === 401) {
                        // Token expired, trigger new login
                        console.log('Token expired, triggering new login');
                        localStorage.removeItem('googleToken');
                        googleLogin();
                        return;
                    }
                    throw new Error('Failed to fetch calendar events');
                }

                const data = await response.json();
                console.log('Calendar data received:', data);

                if (data.items) {
                    setEvents(data.items);
                }

            } catch (error) {
                console.error('Error loading events:', error);
                setError(error.message);
                if (error.message.includes('authentication')) {
                    localStorage.removeItem('googleToken');
                    googleLogin();
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (accessToken) {
            loadCalendarData();
        } else {
            googleLogin();
        }
    }, [accessToken, googleLogin]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen">
                <div className="bg-[#003367] text-white w-1/4 p-6 hidden lg:block">
                    <div className="mb-4">
                        <Link to="/admin-profile" className="flex items-center">
                            {profileImage && (
                                <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full mr-2" />
                            )}
                            <div className="flex flex-col">
                                <span className="text-lg font-semibold">Admin Name</span>
                            </div>
                        </Link>
                    </div>

                    <div className="mb-8 bg-white p-4 rounded-lg text-center shadow-lg text-gray-900">
                        <h1 className="text-3xl font-bold">
                            <FontAwesomeIcon icon={faTooth} className="mr-3" /> BukSU Dental Clinic
                        </h1>
                    </div>

                    <nav>
                        <ul className="space-y-4">
                            {['Dashboard', 'View Appointment', 'Calendar'].map((item, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                                        className="flex items-center text-lg rounded p-2 hover:bg-blue-500"
                                    >
                                        <FontAwesomeIcon icon={[faThLarge, faClipboardList, faCalendarAlt][index]} className="mr-3" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <ul className="space-y-4 mt-8">
                            {['Inventory', 'View Feedback', 'Settings'].map((item, index) => (
                                <li key={index}>
                                    <Link
                                        to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                                        className="flex items-center text-lg rounded p-2 hover:bg-blue-500"
                                    >
                                        <FontAwesomeIcon icon={[faClipboardList, faComments, faCog][index]} className="mr-3" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                
                <div className="flex-1 flex justify-center items-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading calendar events...</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                Error: {error}
            </div>
        );
    }

    const handleShowEventForm = () => setShowEventForm(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
    };

    const handleAddEvent = async () => {
        const { summary, description, date, startTime, endTime } = newEvent;
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);

        try {
            const addedEvent = await addEventToGoogleCalendar({
                summary,
                description,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
            });
            setEvents([...events, addedEvent]);
            setShowEventForm(false);
        } catch (error) {
            setError('Failed to add event');
            console.error('Error adding event:', error);
        }
    };

    const handleAddAppointment = async () => {
        try {
            if (!accessToken) {
                console.log('No access token, triggering login...');
                googleLogin();
                return;
            }

            setIsLoading(true);
            setError(null);

            const { studentName, studentId, date, time, serviceType, notes } = newAppointment;
            
            // Validate inputs
            if (!studentName || !studentId || !date || !time || !serviceType) {
                setError('Please fill in all required fields');
                return;
            }
            
            const appointmentDateTime = new Date(`${date}T${time}`);
            const endDateTime = new Date(appointmentDateTime.getTime() + (30 * 60000));

            try {
                // First, add to Google Calendar
                const googleEvent = await addEventToGoogleCalendar({
                    summary: `Dental Appointment - ${studentName}`,
                    description: `Student ID: ${studentId}\nService: ${serviceType}\nNotes: ${notes}`,
                    start: appointmentDateTime.toISOString(),
                    end: endDateTime.toISOString(),
                }, accessToken);

                if (!googleEvent) {
                    throw new Error('Failed to create Google Calendar event');
                }

                // Then, save to MongoDB
                const response = await fetch('/api/appointments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        studentName,
                        studentId,
                        serviceType,
                        date: appointmentDateTime.toISOString(),
                        time,
                        notes,
                        googleCalendarEventId: googleEvent.id
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save appointment to database');
                }

                const savedAppointment = await response.json();

                // Update local state
                setEvents(prevEvents => [...prevEvents, googleEvent]);
                setShowAppointmentForm(false);
                setNewAppointment({
                    studentName: '',
                    studentId: '',
                    date: '',
                    time: '',
                    serviceType: '',
                    notes: ''
                });

                alert('Appointment scheduled successfully!');

            } catch (error) {
                console.error('Error in appointment creation:', error);
                
                if (error.message === 'AUTH_ERROR') {
                    setError('Authentication failed. Please login again.');
                    googleLogin();
                    return;
                }
                
                throw error;
            }

        } catch (error) {
            console.error('Error adding appointment:', error);
            setError(error.message || 'Failed to add appointment');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppointmentInputChange = (e) => {
        const { name, value } = e.target;
        setNewAppointment(prev => ({ ...prev, [name]: value }));
    };

    const nextMonth = () => {
        setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
        if (currentMonth === 11) setCurrentYear((prev) => prev + 1);
    };

    const previousMonth = () => {
        setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
        if (currentMonth === 0) setCurrentYear((prev) => prev - 1);
    };

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDay = new Date(currentYear, currentMonth, 1).getDay();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        <div className="flex h-screen w-screen">
            {/* Sidebar */}
            <div className="bg-[#003367] text-white w-1/4 p-6 hidden lg:block">
                <div className="mb-4">
                    <Link to="/admin-profile" className="flex items-center">
                        {profileImage && (
                            <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full mr-2" />
                        )}
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold">Admin Name</span>
                        </div>
                    </Link>
                </div>

                <div className="mb-8 bg-white p-4 rounded-lg text-center shadow-lg text-gray-900">
                    <h1 className="text-3xl font-bold">
                        <FontAwesomeIcon icon={faTooth} className="mr-3" /> BukSU Dental Clinic
                    </h1>
                </div>

                <nav>
                    <ul className="space-y-4">
                        {['Dashboard', 'View Appointment', 'Calendar'].map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                                    className="flex items-center text-lg rounded p-2 hover:bg-blue-500"
                                >
                                    <FontAwesomeIcon icon={[faThLarge, faClipboardList, faCalendarAlt][index]} className="mr-3" />
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <ul className="space-y-4 mt-8">
                        {['Inventory', 'View Feedback', 'Settings'].map((item, index) => (
                            <li key={index}>
                                <Link
                                    to={`/admin-${item.toLowerCase().replace(/\s/g, '-')}`}
                                    className="flex items-center text-lg rounded p-2 hover:bg-blue-500"
                                >
                                    <FontAwesomeIcon icon={[faClipboardList, faComments, faCog][index]} className="mr-3" />
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white p-6">
                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-4 rounded-lg">
                            Adding appointment...
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md text-gray-900">
                    <div className="flex items-center">
                        <img 
                            src="/src/assets/unicare.png" 
                            alt="UniCare Logo" 
                            className="h-10"
                            onError={(e) => {
                                console.error('Error loading logo:', e);
                                e.target.style.display = 'none';
                            }}
                        />
                        <span className="ml-2 text-2xl font-bold">Calendar</span>
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1 bg-white">
                        <FontAwesomeIcon icon={faSearch} className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-white border-none focus:outline-none ml-2 text-gray-700"
                        />
                    </div>
                    <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600">
                        <FontAwesomeIcon icon={faBell} className="text-xl" />
                    </button>
                </div>

                {/* Calendar Navigation */}
                <div className="mt-8 flex items-center justify-center">
                    <button onClick={previousMonth} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <h2 className="text-3xl font-bold mx-4 text-blue-700">{monthNames[currentMonth]} {currentYear}</h2>
                    <button onClick={nextMonth} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>

                {/* Add Appointment Button */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => setShowAppointmentForm(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
                    >
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                        Add Appointment
                    </button>
                </div>

                {/* Calendar Area */}
                <div className="mt-4 grid grid-cols-7 gap-4">
                    {/* Day Labels */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-xl font-semibold text-center text-blue-700">{day}</div>
                    ))}

                    {/* Empty boxes for alignment */}
                    {Array.from({ length: startDay }).map((_, index) => (
                        <div key={`empty-${index}`} className="bg-gray-50 border border-gray-200 p-4 rounded-lg"></div>
                    ))}

                                        {/* Days of the month */}
                                        {Array.from({ length: daysInMonth }).map((_, index) => {
                        const currentDate = new Date(currentYear, currentMonth, index + 1);
                        const isToday = currentDate.toDateString() === new Date().toDateString();
                        const hasEvent = events.some((event) => {
                            const eventStartDate = new Date(event.start.dateTime || event.start.date);
                            return eventStartDate.toDateString() === currentDate.toDateString();
                        });

                        return (
                            <div
                                key={index}
                                className={`p-4 rounded-lg cursor-pointer ${isToday ? 'bg-blue-200' : 'bg-gray-50'} 
                                ${hasEvent ? 'border-2 border-blue-500' : 'border border-gray-200'} text-center`}
                                onClick={() => {
                                    // Show the event form if an event is clicked
                                    if (hasEvent) {
                                        handleShowEventForm();
                                    }
                                }}
                            >
                                <span className={`font-semibold ${isToday ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {index + 1}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Event Form */}
                {showEventForm && (
                    <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
                        <h3 className="text-2xl font-semibold mb-4">Add Event</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                name="summary"
                                value={newEvent.summary}
                                onChange={handleInputChange}
                                placeholder="Event Title"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                            <textarea
                                name="description"
                                value={newEvent.description}
                                onChange={handleInputChange}
                                placeholder="Event Description"
                                rows="4"
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            ></textarea>
                            <div className="flex space-x-4">
                                <input
                                    type="date"
                                    name="date"
                                    value={newEvent.date}
                                    onChange={handleInputChange}
                                    className="w-1/2 p-3 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="time"
                                    name="startTime"
                                    value={newEvent.startTime}
                                    onChange={handleInputChange}
                                    className="w-1/2 p-3 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="time"
                                    name="endTime"
                                    value={newEvent.endTime}
                                    onChange={handleInputChange}
                                    className="w-1/2 p-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <button
                                onClick={handleAddEvent}
                                className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                            >
                                Add Event
                            </button>
                        </div>
                    </div>
                )}

                {/* Appointment Form Modal */}
                {showAppointmentForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-2xl font-semibold mb-4">Schedule Dental Appointment</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="studentName"
                                    value={newAppointment.studentName}
                                    onChange={handleAppointmentInputChange}
                                    placeholder="Student Name"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-black"
                                />
                                <input
                                    type="text"
                                    name="studentId"
                                    value={newAppointment.studentId}
                                    onChange={handleAppointmentInputChange}
                                    placeholder="Student ID"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-black"
                                />
                                <select
                                    name="serviceType"
                                    value={newAppointment.serviceType}
                                    onChange={handleAppointmentInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black"
                                >
                                    <option value="">Select Service Type</option>
                                    <option value="Dental Checkup">Dental Checkup</option>
                                    <option value="Tooth Extraction">Tooth Extraction</option>
                                    <option value="Cleaning">Cleaning</option>
                                    <option value="Consultation">Consultation</option>
                                </select>
                                <div className="flex space-x-4">
                                    <input
                                        type="date"
                                        name="date"
                                        value={newAppointment.date}
                                        onChange={handleAppointmentInputChange}
                                        className="w-1/2 p-3 border border-gray-300 rounded-lg bg-white"
                                    />
                                    <input
                                        type="time"
                                        name="time"
                                        value={newAppointment.time}
                                        onChange={handleAppointmentInputChange}
                                        className="w-1/2 p-3 border border-gray-300 rounded-lg bg-white"
                                    />
                                </div>
                                <textarea
                                    name="notes"
                                    value={newAppointment.notes}
                                    onChange={handleAppointmentInputChange}
                                    placeholder="Additional Notes"
                                    rows="3"
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black placeholder-black"
                                ></textarea>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={handleAddAppointment}
                                        className="w-1/2 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                                    >
                                        Schedule Appointment
                                    </button>
                                    <button
                                        onClick={() => setShowAppointmentForm(false)}
                                        className="w-1/2 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCalendar;

                   
