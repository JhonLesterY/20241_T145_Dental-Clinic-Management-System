import React, { useState, useEffect } from 'react';
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import AdminSideBar from '../components/AdminSideBar';
import FormCreator from '../components/FormCreator';
import { useTheme } from '../context/ThemeContext';

const Admin_ViewFeedback = () => {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResponses, setShowResponses] = useState(false);
  const [stats, setStats] = useState({
    totalResponses: 0,
    averageRating: 0,
    satisfactionRate: 0
  });
  const [showFormCreator, setShowFormCreator] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/form/responses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch responses');
      }

      const data = await response.json();
      setFeedbackData(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const totalResponses = data.length;
    let totalRating = 0;
    let satisfiedCount = 0;

    data.forEach(response => {
      const answers = response.answers;
      if (answers['Overall Experience'] === 'Excellent') totalRating += 4;
      else if (answers['Overall Experience'] === 'Good') totalRating += 3;
      else if (answers['Overall Experience'] === 'Fair') totalRating += 2;
      else if (answers['Overall Experience'] === 'Poor') totalRating += 1;

      if (answers['Treatment Satisfaction'] === 'Very Satisfied' || 
          answers['Treatment Satisfaction'] === 'Satisfied') {
        satisfiedCount++;
      }
    });

    setStats({
      totalResponses,
      averageRating: totalResponses ? (totalRating / totalResponses).toFixed(1) : 0,
      satisfactionRate: totalResponses ? ((satisfiedCount / totalResponses) * 100).toFixed(1) : 0
    });
  };

  // Fetch active form
  const fetchActiveForm = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await fetch('http://localhost:5000/form/active-form-url', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        setActiveForm(null);
        setError('No active feedback form found');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to fetch active form');
      }

      const data = await response.json();
      if (data.formUrl) {
        setActiveForm(data.formUrl);
        setError(null);
      } else {
        setActiveForm(null);
        setError('Form URL not found in response');
      }
    } catch (error) {
      console.error('Error fetching active form:', error);
      setError(error.message);
      setActiveForm(null);
    }
  };

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Handle marking feedback as reviewed
  const handleMarkReviewed = (id) => {
    setFeedbackData(prevData =>
      prevData.map(feedback =>
        feedback.id === id ? { ...feedback, reviewed: true } : feedback
      )
    );
  };

  // Create new feedback form
  const handleCreateForm = async () => {
    try {
      setLoading(true);
      setError(null);

      const formUrl = document.getElementById('formUrl').value;

      if (!formUrl) {
        setError('Please enter the Google Form URL');
        return;
      }

      // Extract form ID from URL for this specific format
      // Example: https://docs.google.com/forms/d/e/1FAIpQLSdYhBqZU0fGlgdKtsxliZ1MuT1SjswDWArjp__R3jFE7cQa2g/viewform
      const formIdMatch = formUrl.match(/\/e\/([^/]+)/);
      if (!formIdMatch) {
        setError('Invalid Google Form URL. Please enter a valid URL.');
        return;
      }

      const formId = formIdMatch[1];
      const baseUrl = formUrl.split('?')[0]; // Remove any existing query parameters

      const response = await fetch('http://localhost:5000/form/create-form', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify({
          formId,
          formUrl: baseUrl // Store the base URL without query parameters
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create form');
      }

      const data = await response.json();
      setMessage('Form created successfully! The form has been set as active.');
      
      // Clear form fields
      document.getElementById('formUrl').value = '';
      
    } catch (error) {
      console.error('Error creating form:', error);
      setError(error.message || 'Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  // Filter feedback based on search query
  const filteredFeedback = feedbackData.filter(feedback =>
    Object.values(feedback).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const initializeFeedbackForm = async () => {
    try {
        const response = await fetch('http://localhost:5000/form/initialize-form', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to initialize feedback form');
        }

        const data = await response.json();
        console.log('Feedback form initialized:', data);
        setMessage('Feedback form initialized successfully');
        // Refresh form data
        fetchActiveForm();
    } catch (error) {
        console.error('Error:', error);
        setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-[#f0f4f8]'}`}>
        <AdminSideBar isOpen={sidebarOpen} />
        
        <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"} relative`}>
          {/* Blurred overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-10">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Loading Feedback Data...</h2>
            </div>
          </div>
          
          {/* Placeholder header to maintain structure */}
          <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'}`}>
                  Feedback Management
                </h1>
              </div>
            </div>
          </header>
          
          {/* Placeholder main content */}
          <main className="flex-1 p-6"></main>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-[#f0f4f8]'}`}>
      <AdminSideBar isOpen={sidebarOpen} />
      
      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img src="/src/assets/unicare.png" alt="UniCare Logo" className="h-10" />
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'}`}>
                Feedback Management
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search feedback..."
                  className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => setShowResponses(!showResponses)}
                className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all duration-300 flex items-center gap-2"
              >
                {showResponses ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                    <span>Dashboard</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <span>View Responses</span>
                  </>
                )}
              </button>
              <div className="relative">
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <img src={bell} alt="Notifications" className="h-6 w-6" />
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">3</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {showResponses ? (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} h-full`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Feedback Responses</h2>
                <button onClick={() => window.open('https://docs.google.com/forms/d/1QMIf2EbuFc0lpQvbqVj9mBDtfJ4mSMItskEKJOLh6UY/edit#responses', '_blank')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                  Open in Google Forms
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      {["Date", "Patient Email", "Overall Experience", "Staff Professionalism", 
                        "Treatment Satisfaction", "Clinic Cleanliness", "Rating", "Comments"].map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredFeedback.map((response, index) => (
                  <tr key={response.responseId || `response-${index}`} className={`${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50/50'} transition-colors`}>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                      {new Date(response.submittedAt).toLocaleDateString()} {/* Assuming submittedAt is the date */}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                      {response.answers['Patient Email'] || 'Not provided'} {/* Assuming this is the correct field */}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                      {response.answers['Overall Experience'] || 'Not provided'} {/* Assuming this is the correct field */}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                      {response.answers['Staff Professionalism'] || 'Not provided'} {/* Assuming this is the correct field */}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                      {response.answers['Treatment Satisfaction'] || 'Not provided'} {/* Assuming this is the correct field */}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                      {response.answers['Clinic Cleanliness'] || 'Not provided'} {/* Assuming this is the correct field */}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                      {response.answers['Rating'] || 'Not provided'} {/* Assuming this is the correct field */}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                      {response.answers['Comments'] || 'Not provided'} {/* Assuming this is the correct field */}
                    </td>
                  </tr>
                ))}
              </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6 h-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <h3 className="text-lg font-semibold">Total Responses</h3>
                  <p className="text-4xl font-bold mt-2">{stats.totalResponses}</p>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-400/20 rounded-full"></div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <h3 className="text-lg font-semibold">Average Rating</h3>
                  <p className="text-4xl font-bold mt-2">{stats.averageRating}/4.0</p>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-400/20 rounded-full"></div>
                </div>
                <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <h3 className="text-lg font-semibold">Satisfaction Rate</h3>
                  <p className="text-4xl font-bold mt-2">{stats.satisfactionRate}%</p>
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-violet-400/20 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin_ViewFeedback;
