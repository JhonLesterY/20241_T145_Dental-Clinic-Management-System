import React, { useState, useEffect } from 'react';
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import AdminSideBar from '../components/AdminSideBar';

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
  const [formCreating, setFormCreating] = useState(false);
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
        const answers = response.answers;
        return {
          id: response.responseId,
          date: new Date(response.createTime).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          overallExperience: answers['Overall Experience'] || 'Not provided',
          staffProfessionalism: answers['Staff Professionalism'] || 'Not provided',
          treatmentSatisfaction: answers['Treatment Satisfaction'] || 'Not provided',
          clinicCleanliness: answers['Clinic Cleanliness'] || 'Not provided',
          comments: answers['Additional Comments'] || 'No comments provided',
          reviewed: false
        };
      });

      // Calculate statistics
      const totalResponses = processedData.length;
      let totalRating = 0;
      let satisfiedCount = 0;

      processedData.forEach(response => {
        // Convert ratings to numbers (assuming 'Excellent' = 4, 'Good' = 3, etc.)
        const ratingMap = { 'Excellent': 4, 'Good': 3, 'Fair': 2, 'Poor': 1 };
        const ratings = [
          ratingMap[response.overallExperience] || 0,
          ratingMap[response.staffProfessionalism] || 0,
          ratingMap[response.clinicCleanliness] || 0
        ].filter(rating => rating > 0); // Only count provided ratings

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
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:5000/form/active-form', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch active form');
      }

      const data = await response.json();
      setActiveForm(data);
    } catch (error) {
      console.error('Error fetching active form:', error);
      if (error.message === 'No authentication token found') {
        // Redirect to login if no token
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    fetchResponses();
    fetchActiveForm();
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
      {/* Sidebar */}
      <AdminSideBar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-500 ${sidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <img className="w-10 h-10" src={Logo} alt="Dental Logo" />
              <h1 className="text-2xl font-semibold text-[#003367]">View Feedback</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search feedback..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={handleSearchChange}
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

              {/* Bell Icon */}
              <button className="p-2 rounded-full hover:bg-gray-100 transition">
                <img className="w-6 h-6" src={bell} alt="Notifications" />
              </button>
            </div>
          </div>
        </header>

        {/* Form Management Section */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Feedback Form Management</h2>
            
            {activeForm ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Current Form URL:</p>
                    <a 
                      href={activeForm.formUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {activeForm.formUrl}
                    </a>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activeForm.formUrl);
                      alert('Form URL copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Copy URL
                  </button>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Form Preview:</h3>
                  <iframe
                    src={activeForm.formUrl}
                    className="w-full h-96 border border-gray-300 rounded-md"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                  >
                    Loading...
                  </iframe>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No feedback form has been created yet.</p>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4">Create New Form</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Google Form URL</label>
                      <input
                        type="text"
                        id="formUrl"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter the complete Google Form URL"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Copy the entire URL from your Google Form's edit page
                      </p>
                    </div>
                    <button
                      onClick={handleCreateForm}
                      disabled={formCreating}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {formCreating ? 'Creating...' : 'Create Form'}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-4 text-red-600">
                      {error}
                    </div>
                  )}

                  {message && (
                    <div className="mt-4 text-green-600">
                      {message}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Section */}
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

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default Admin_ViewFeedback;
