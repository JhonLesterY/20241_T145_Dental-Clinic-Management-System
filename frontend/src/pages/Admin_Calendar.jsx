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
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [showEventsModal, setShowEventsModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [showEditForm, setShowEditForm] = useState(false);

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

    const handleViewEvents = async (date) => {
        try {
          // Format the date for comparison
          const formattedDate = date.toISOString().split('T')[0];
          
          // Filter events for the selected date
          const dateEvents = events.filter(event => {
            const eventDate = new Date(event.start.dateTime || event.start.date)
              .toISOString().split('T')[0];
            return eventDate === formattedDate;
          });
      
          setSelectedDateEvents(dateEvents);
          setShowEventsModal(true);
        } catch (error) {
          console.error('Error fetching events:', error);
          setError('Failed to fetch events for this date');
        }
      };

    const handleShowEventForm = () => setShowEventForm(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
    };

    const handleAddEvent = async () => {
        if (!accessToken) {
            setError('Not logged in to Google Calendar. Please log in first.');
            googleLogin();
            return;
        }
    
        const { summary, description, date, startTime, endTime } = newEvent;
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
    
        try {
            const response = await fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        summary,
                        description,
                        start: {
                            dateTime: startDateTime.toISOString(),
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        },
                        end: {
                            dateTime: endDateTime.toISOString(),
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        }
                    })
                }
            );
    
            if (!response.ok) {
                throw new Error('Failed to add event to calendar');
            }
    
            const addedEvent = await response.json();
            setEvents(prevEvents => [...prevEvents, addedEvent]);
            setShowEventForm(false);
            setError(null);
        } catch (error) {
            console.error('Error adding event:', error);
            setError('Failed to add event: ' + error.message);
            if (error.message.includes('authentication')) {
                googleLogin();
            }
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!accessToken) {
            setError('Not logged in to Google Calendar. Please log in first.');
            googleLogin();
            return;
        }

        try {
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            setShowEventsModal(false);
            setError(null);
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('Failed to delete event: ' + error.message);
            if (error.message.includes('authentication')) {
                googleLogin();
            }
        }
    };

    const handleEditEvent = async (event) => {
        setEditingEvent({
            id: event.id,
            summary: event.summary,
            description: event.description,
            date: new Date(event.start.dateTime).toISOString().split('T')[0],
            startTime: new Date(event.start.dateTime).toISOString().split('T')[1].substring(0, 5),
            endTime: new Date(event.end.dateTime).toISOString().split('T')[1].substring(0, 5),
        });
        setShowEditForm(true);
        setShowEventsModal(false);
    };

    const handleUpdateEvent = async () => {
        if (!accessToken || !editingEvent) {
            setError('Not logged in to Google Calendar or no event selected.');
            return;
        }

        const startDateTime = new Date(`${editingEvent.date}T${editingEvent.startTime}`);
        const endDateTime = new Date(`${editingEvent.date}T${editingEvent.endTime}`);

        try {
            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events/${editingEvent.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        summary: editingEvent.summary,
                        description: editingEvent.description,
                        start: {
                            dateTime: startDateTime.toISOString(),
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        },
                        end: {
                            dateTime: endDateTime.toISOString(),
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update event');
            }

            const updatedEvent = await response.json();
            setEvents(prevEvents => prevEvents.map(event => 
                event.id === editingEvent.id ? updatedEvent : event
            ));
            setShowEditForm(false);
            setEditingEvent(null);
            setError(null);
        } catch (error) {
            console.error('Error updating event:', error);
            setError('Failed to update event: ' + error.message);
            if (error.message.includes('authentication')) {
                googleLogin();
            }
        }
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
                                ${hasEvent ? 'border-2 border-blue-500' : 'border border-gray-200'} text-center 
                                hover:bg-gray-100 transition-colors duration-200`}
                                onClick={() => {
                                    const selectedDate = new Date(currentYear, currentMonth, index + 1);
                                    handleViewEvents(selectedDate);  // This will show existing events or an empty list
                                    setNewEvent(prev => ({
                                        ...prev,
                                        date: selectedDate.toISOString().split('T')[0]
                                    }));
                                }}
                            >
                                <span className={`font-semibold ${isToday ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {index + 1}
                                </span>
                            </div>
                        );
                    })}
                </div>

                    {/* Event Form Modal */}
                   {showEventsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">
          Events on {selectedDateEvents[0]?.start.dateTime ? 
            new Date(selectedDateEvents[0].start.dateTime).toLocaleDateString() : 
            new Date(newEvent.date).toLocaleDateString()}
        </h3>
        <button
          onClick={() => setShowEventsModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Existing Events List */}
      <div className="max-h-96 overflow-y-auto mb-4">
        {selectedDateEvents.length > 0 ? (
          selectedDateEvents.map((event, index) => (
            <div key={index} className="border-b border-gray-200 py-4 last:border-0">
              <h4 className="font-semibold text-lg">{event.summary}</h4>
              {event.description && (
                <p className="text-gray-600 mt-1">{event.description}</p>
              )}
              <div className="text-sm text-gray-500 mt-2">
                {new Date(event.start.dateTime).toLocaleTimeString()} - 
                {new Date(event.end.dateTime).toLocaleTimeString()}
              </div>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleEditEvent(event)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No events scheduled for this date</p>
        )}
      </div>

      {/* Add New Event Form */}
      <form onSubmit={handleAddEvent} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Event Title</label>
          <input
            type="text"
            value={newEvent.summary}
            onChange={(e) => setNewEvent({...newEvent, summary: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 ">Description</label>
          <textarea
            value={newEvent.description}
            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="time"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowEventsModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add Event
          </button>
        </div>
      </form>
    </div>
  </div>
)}

            {/* Add this new Edit Form Modal */}
            {showEditForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                            <h3 className="text-xl font-semibold mb-4">Edit Event</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="summary"
                                    value={editingEvent.summary}
                                    onChange={(e) => setEditingEvent({...editingEvent, summary: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    placeholder="Event Title"
                                />
                                <textarea
                                    name="description"
                                    value={editingEvent.description}
                                    onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    placeholder="Description"
                                />
                                <input
                                    type="date"
                                    name="date"
                                    value={editingEvent.date}
                                    onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                                    className="w-full p-2 border rounded"
                                />
                                <div className="flex space-x-4">
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={editingEvent.startTime}
                                        onChange={(e) => setEditingEvent({...editingEvent, startTime: e.target.value})}
                                        className="w-1/2 p-2 border rounded"
                                    />
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={editingEvent.endTime}
                                        onChange={(e) => setEditingEvent({...editingEvent, endTime: e.target.value})}
                                        className="w-1/2 p-2 border rounded"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex space-x-4">
                                <button
                                    onClick={handleUpdateEvent}
                                    className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
                                >
                                    Update Event
                                </button>
                                <button
                                    onClick={() => {
                                        setShowEditForm(false);
                                        setEditingEvent(null);
                                    }}
                                    className="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCalendar;

                   
