import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
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
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminCalendar = () => {
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
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'error' });
    const [blockedDates, setBlockedDates] = useState([]);
    const [isDateBlocked, setIsDateBlocked] = useState(false);

    const showNotification = (message, type = 'error') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'error' }), 5000);
    };
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const loadCalendarData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await fetch('http://localhost:5000/admin/calendar/events', {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Error loading calendar events: ${errorData.message}`);
                }

                const data = await response.json();
                setEvents(data.items || []);

            } catch (error) {
                console.error('Error loading events:', error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadCalendarData();
    }, []);

    useEffect(() => {
        const fetchBlockedDates = async () => {
            try {
                const response = await fetch('http://localhost:5000/admin/calendar/blocked-dates', {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch blocked dates');
                const dates = await response.json();
                // Ensure we're working with an array of date strings
                const formattedDates = dates.map(date => new Date(date).toISOString().split('T')[0]);
                setBlockedDates(formattedDates || []);
            } catch (error) {
                console.error('Error fetching blocked dates:', error);
                showNotification('Error fetching blocked dates: ' + error.message);
                setBlockedDates([]); // Ensure we always have an array
            }
        };
        fetchBlockedDates();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen bg-white">
                <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
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
            // Create a new date object without timezone adjustment
            const localDate = new Date(date);
            localDate.setMinutes(localDate.getMinutes() + localDate.getTimezoneOffset());
            localDate.setHours(0, 0, 0, 0);
            
            const dateEvents = events.filter(event => {
                const eventDate = new Date(event.start.dateTime || event.start.date);
                const localEventDate = new Date(eventDate);
                localEventDate.setHours(0, 0, 0, 0);
                return localEventDate.getTime() === localDate.getTime();
            });
        
            setSelectedDateEvents(dateEvents);
            setShowEventsModal(true);
        } catch (error) {
            console.error('Error fetching events:', error);
            showNotification(`Error fetching calendar events: ${error.message}`);
        }
    };

    const handleShowEventForm = () => setShowEventForm(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            const { summary, description, date, startTime, endTime } = newEvent;
            const startDateTime = new Date(`${date}T${startTime}`);
            const endDateTime = new Date(`${date}T${endTime}`);

            const response = await fetch('http://localhost:5000/admin/calendar/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    summary,
                    description,
                    start: startDateTime.toISOString(),
                    end: endDateTime.toISOString()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const addedEvent = await response.json();
            setEvents(prevEvents => [...prevEvents, addedEvent]);
            setShowEventForm(false);
            setNewEvent({
                summary: '',
                description: '',
                date: '',
                startTime: '',
                endTime: '',
            });
        } catch (error) {
            console.error('Error adding event:', error);
            showNotification('Failed to add event: ' + error.message);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            const response = await fetch(
                `http://localhost:5000/admin/calendar/events/${eventId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            setShowEventsModal(false);
            setError(null);
        } catch (error) {
            console.error('Error deleting event:', error);
            showNotification('Failed to delete event: ' + error.message);
        }
    };

    const handleEditEvent = async (event) => {
        setEditingEvent({
            id: event.googleEventId || event.id,
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
        if (!editingEvent) {
            setError('No event selected for update.');
            return;
        }

        const startDateTime = new Date(`${editingEvent.date}T${editingEvent.startTime}`);
        const endDateTime = new Date(`${editingEvent.date}T${editingEvent.endTime}`);

        try {
            const response = await fetch(
                `http://localhost:5000/admin/calendar/events/${editingEvent.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        summary: editingEvent.summary,
                        description: editingEvent.description,
                        start: startDateTime.toISOString(),
                        end: endDateTime.toISOString()
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
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
            showNotification('Failed to update event: ' + error.message);
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

    const handleBlockDate = async (date) => {
        try {
            const localDate = new Date(date);
            localDate.setHours(12, 0, 0, 0);
            const adjustedDate = localDate.toISOString().split('T')[0];

            const response = await fetch(`http://localhost:5000/admin/calendar/blocked-dates`, {
                method: isDateBlocked ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: adjustedDate })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const updatedBlockedDates = await response.json();
            // Ensure we're working with an array
            const formattedDates = Array.isArray(updatedBlockedDates) 
                ? updatedBlockedDates.map(date => new Date(date).toISOString().split('T')[0])
                : [];
                
            setBlockedDates(formattedDates);
            setIsDateBlocked(!isDateBlocked);
            setShowEventsModal(false);
            showNotification(`Date successfully ${isDateBlocked ? 'unblocked' : 'blocked'}`, 'success');
        } catch (error) {
            console.error('Error updating blocked date:', error);
            if (error.message.includes('duplicate key error')) {
                showNotification('This date is already blocked');
            } else {
                showNotification(`Error updating blocked date: ${error.message}`);
            }
        }
    };

    return (
        <div className={`flex h-screen w-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
            
            {/* Main Content */}
            <div className={`flex-1 p-8 ${sidebarOpen ? 'ml-64' : 'ml-16'} ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
               

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-4 rounded-lg">
                            Adding appointment...
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className={`flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md`}>
                    <div className="flex items-center">
                        <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                        <span className={`ml-2 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Calendar
                        </span>
                    </div>
                    <div className={`flex items-center border ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} rounded-lg px-3 py-1`}>
                        <FontAwesomeIcon icon={faSearch} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className={`border-none focus:outline-none ml-2 ${
                                isDarkMode 
                                ? 'bg-gray-700 text-gray-200 placeholder-gray-400' 
                                : 'bg-white text-gray-700 placeholder-gray-500'
                            }`}
                        />
                    </div>
                    <button className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                        <FontAwesomeIcon icon={faBell} className="text-xl" />
                    </button>
                </div>

                {/* Calendar Navigation */}
                <div className="mt-8 flex items-center justify-center">
                    <button onClick={previousMonth} className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <h2 className={`text-3xl font-bold mx-4 ${isDarkMode ? 'text-gray-200' : 'text-blue-700'}`}>
                        {monthNames[currentMonth]} {currentYear}
                    </h2>
                    <button onClick={nextMonth} className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>

                {/* Calendar Area */}
                <div className="mt-4 grid grid-cols-7 gap-4">
                    {/* Day Labels */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className={`text-xl font-semibold text-center ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                            {day}
                        </div>
                    ))}

                    {/* Empty boxes for alignment */}
                    {Array.from({ length: startDay }).map((_, index) => (
                        <div key={`empty-${index}`} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border p-4 rounded-lg`}></div>
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }).map((_, index) => {
                        const currentDate = new Date(currentYear, currentMonth, index + 1);
                        const formattedDate = currentDate.toISOString().split('T')[0];
                        const isToday = currentDate.toDateString() === new Date().toDateString();
                        const hasEvent = events.some((event) => {
                            const eventStartDate = new Date(event.start.dateTime || event.start.date);
                            return eventStartDate.toDateString() === currentDate.toDateString();
                        });

                        return (
                            <div
                                key={index}
                                className={`p-2 border cursor-pointer hover:bg-gray-100 relative
                                    ${isToday ? 'bg-blue-50' : ''}
                                    ${Array.isArray(blockedDates) && blockedDates.includes(formattedDate) ? 'bg-red-100' : ''}`}
                                onClick={() => {
                                    const selectedDate = new Date(currentYear, currentMonth, index + 1);
                                    selectedDate.setHours(12, 0, 0, 0);
                                    const formattedDate = selectedDate.toISOString().split('T')[0];
                                    
                                    setIsDateBlocked(Array.isArray(blockedDates) && blockedDates.includes(formattedDate));
                                    
                                    handleViewEvents(selectedDate);
                                    setNewEvent(prev => ({
                                        ...prev,
                                        date: formattedDate
                                    }));
                                    setShowEventsModal(true);
                                }}
                            >
                                <span className={`font-semibold ${
                                    isToday 
                                        ? isDarkMode 
                                            ? 'text-blue-200' 
                                            : 'text-blue-900'
                                        : isDarkMode 
                                            ? 'text-gray-200' 
                                            : 'text-gray-700'
                                }`}>
                                    {index + 1}
                                </span>
                                {hasEvent && (
                                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                            </div>
                        );
                    })}
                </div>

                    {/* Event Form Modal */}
                   {showEventsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-semibold text-black">
            Events on {(() => {
              if (selectedDateEvents[0]?.start.dateTime) {
                  const date = new Date(selectedDateEvents[0].start.dateTime);
                  return date.toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'Asia/Manila'
                  });
              } else {
                  const [year, month, day] = newEvent.date.split('-');
                  const selectedDate = new Date(year, month - 1, day);
                  selectedDate.setHours(12, 0, 0, 0);
                  return selectedDate.toLocaleDateString('en-PH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: 'Asia/Manila'
                  });
              }
            })()}
          </h3>
          {isDateBlocked && (
            <span className="text-red-600 text-sm font-medium">
              This date is currently blocked
            </span>
          )}
        </div>
        <button
          onClick={() => setShowEventsModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Block/Unblock Date Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => handleBlockDate(newEvent.date)}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
            isDateBlocked 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isDateBlocked ? 'Unblock Date' : 'Block Date'}
        </button>
      </div>

      {/* Show form and events only if date is not blocked */}
      <div className={isDateBlocked ? 'opacity-50 pointer-events-none' : ''}>
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
                  {new Date(event.start.dateTime).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila' })} - 
                  {new Date(event.end.dateTime).toLocaleTimeString('en-PH', { timeZone: 'Asia/Manila' })}
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
  </div>
)}

            {/* Add this new Edit Form Modal */}
            {showEditForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                            <h3 className="text-xl font-semibold mb-4 text-black">Edit Event</h3>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="summary"
                                    value={editingEvent.summary}
                                    onChange={(e) => setEditingEvent({...editingEvent, summary: e.target.value})}
                                    className="w-full p-2 border rounded bg-white"
                                    placeholder="Event Title"
                                />
                                <textarea
                                    name="description"
                                    value={editingEvent.description}
                                    onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                                    className="w-full p-2 border rounded bg-white text-black"
                                    placeholder="Description"
                                />
                                <input
                                    type="date"
                                    name="date"
                                    value={editingEvent.date}
                                    onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                                    className="w-full p-2 border rounded bg-white"
                                />
                                <div className="flex space-x-4">
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={editingEvent.startTime}
                                        onChange={(e) => setEditingEvent({...editingEvent, startTime: e.target.value})}
                                        className="w-1/2 p-2 border rounded bg-white"
                                    />
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={editingEvent.endTime}
                                        onChange={(e) => setEditingEvent({...editingEvent, endTime: e.target.value})}
                                        className="w-1/2 p-2 border rounded bg-white"
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
                {/* Notification Component */}
                {notification.show && (
                    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border-l-4 border-red-500 animate-slide-up z-50">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-800">{notification.message}</p>
                            </div>
                            <div className="ml-4">
                                <button
                                    onClick={() => setNotification({ show: false, message: '', type: 'error' })}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
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

                   