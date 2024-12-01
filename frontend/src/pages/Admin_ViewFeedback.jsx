import React, { useState, useEffect } from 'react';
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import AdminSideBar from '../components/AdminSideBar';
import FormCreator from '../components/FormCreator';

const Admin_ViewFeedback = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [stats, setStats] = useState({
    totalResponses: 0,
    averageRating: 0,
    satisfactionRate: 0
  });
  const [showFormCreator, setShowFormCreator] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch feedback responses
  const fetchResponses = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/form/responses', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch responses');
      }

      const data = await response.json();
      // Process responses and calculate statistics
      const processedData = data.map(response => {
        const answers = response.answers || {};
        return {
          id: response.responseId,
          date: new Date(response.createTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          overallExperience: answers['How would you rate your overall experience?'] || 'Not provided',
          staffProfessionalism: answers['How would you rate the staff\'s professionalism?'] || 'Not provided',
          treatmentSatisfaction: answers['How satisfied are you with your treatment?'] || 'Not provided',
          comments: answers['Additional Comments or Suggestions'] || 'No comments provided'
        };
      });

      // Calculate statistics
      const totalResponses = processedData.length;
      let totalRating = 0;
      let satisfiedCount = 0;

      processedData.forEach(response => {
        // Convert ratings to numbers (assuming 'Excellent' = 4, 'Good' = 3, etc.)
        const ratingMap = {
          'Excellent': 4,
          'Good': 3,
          'Fair': 2,
          'Poor': 1,
          'Very Satisfied': 4,
          'Satisfied': 3,
          'Neutral': 2,
          'Dissatisfied': 1
        };

        const ratings = [
          ratingMap[response.overallExperience] || 0,
          ratingMap[response.staffProfessionalism] || 0
        ].filter(rating => rating > 0);

        if (ratings.length > 0) {
          totalRating += ratings.reduce((a, b) => a + b, 0) / ratings.length;
        }

        // Count satisfied responses
        if (response.treatmentSatisfaction === 'Very Satisfied' || 
            response.treatmentSatisfaction === 'Satisfied') {
          satisfiedCount++;
        }
      });

      setStats({
        totalResponses,
        averageRating: totalResponses ? (totalRating / totalResponses).toFixed(1) : 0,
        satisfactionRate: totalResponses ? ((satisfiedCount / totalResponses) * 100).toFixed(1) : 0
      });

      setFeedbackData(processedData);
      setError(null);
    } catch (error) {
      console.error('Error fetching responses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    fetchActiveForm();
    fetchResponses();
  }, []);

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
      console.log('Form created successfully:', data);
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

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className={`flex-1 flex items-center justify-center transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Loading Feedback Data...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSideBar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <img src={Logo} alt="Logo" className="h-8" />
            <h1 className="text-xl font-semibold">Feedback Management</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFormCreator(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Feedback Form
            </button>
            <img src={bell} alt="Notifications" className="h-6" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {showFormCreator ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create Feedback Form</h2>
                <button
                  onClick={() => setShowFormCreator(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <FormCreator />
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Responses</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalResponses}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Rating</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.averageRating}/4.0</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Satisfaction Rate</h3>
                  <p className="text-3xl font-bold text-purple-600">{stats.satisfactionRate}%</p>
                </div>
              </div>
              
              {/* Feedback List */}
              <div className="p-6">
                <div className="bg-white rounded-lg shadow-md">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Feedback</h2>
                    <div className="space-y-4">
                      {filteredFeedback.map((feedback) => (
                        <div
                          key={feedback.id}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex space-x-4">
                                <span className="text-sm text-gray-600">{feedback.date}</span>
                                {feedback.reviewed && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    Reviewed
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Overall Experience</p>
                                  <p className={`text-gray-800 ${
                                    feedback.overallExperience === 'Excellent' ? 'text-green-600' :
                                    feedback.overallExperience === 'Good' ? 'text-blue-600' :
                                    feedback.overallExperience === 'Fair' ? 'text-yellow-600' :
                                    feedback.overallExperience === 'Poor' ? 'text-red-600' : ''
                                  }`}>{feedback.overallExperience}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Staff Professionalism</p>
                                  <p className={`text-gray-800 ${
                                    feedback.staffProfessionalism === 'Excellent' ? 'text-green-600' :
                                    feedback.staffProfessionalism === 'Good' ? 'text-blue-600' :
                                    feedback.staffProfessionalism === 'Fair' ? 'text-yellow-600' :
                                    feedback.staffProfessionalism === 'Poor' ? 'text-red-600' : ''
                                  }`}>{feedback.staffProfessionalism}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Treatment Satisfaction</p>
                                  <p className={`text-gray-800 ${
                                    feedback.treatmentSatisfaction === 'Very Satisfied' ? 'text-green-600' :
                                    feedback.treatmentSatisfaction === 'Satisfied' ? 'text-blue-600' :
                                    feedback.treatmentSatisfaction === 'Neutral' ? 'text-yellow-600' :
                                    feedback.treatmentSatisfaction === 'Dissatisfied' ? 'text-red-600' : ''
                                  }`}>{feedback.treatmentSatisfaction}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Clinic Cleanliness</p>
                                  <p className={`text-gray-800 ${
                                    feedback.clinicCleanliness === 'Excellent' ? 'text-green-600' :
                                    feedback.clinicCleanliness === 'Good' ? 'text-blue-600' :
                                    feedback.clinicCleanliness === 'Fair' ? 'text-yellow-600' :
                                    feedback.clinicCleanliness === 'Poor' ? 'text-red-600' : ''
                                  }`}>{feedback.clinicCleanliness}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Additional Comments</p>
                                <p className="text-gray-800 mt-1">{feedback.comments}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {!feedback.reviewed && (
                                <button
                                  onClick={() => handleMarkReviewed(feedback.id)}
                                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                                >
                                  Mark Reviewed
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin_ViewFeedback;
