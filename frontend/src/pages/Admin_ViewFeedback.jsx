import React, { useState, useEffect } from 'react';
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';
import AdminSideBar from '../components/AdminSideBar';
import FormCreator from '../components/FormCreator';

const Admin_ViewFeedback = () => {
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
    <div className="flex h-screen overflow-hidden">
      <AdminSideBar isOpen={sidebarOpen} />
      
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowResponses(!showResponses)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {showResponses ? 'Show Dashboard' : 'View Responses'}
              </button>
              <button
                onClick={() => window.open('https://docs.google.com/forms/d/1QMIf2EbuFc0lpQvbqVj9mBDtfJ4mSMItskEKJOLh6UY/edit#responses', '_blank')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Open in Google Forms
              </button>
              <img src={bell} alt="Notifications" className="h-6" />
            </div>
          </div>
        </header>

        {showResponses ? (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-black">Feedback Responses</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border text-black">Date</th>
                    <th className="px-4 py-2 border text-black">Patient Email</th>
                    <th className="px-4 py-2 border text-black">Overall Experience</th>
                    <th className="px-4 py-2 border text-black">Staff Professionalism</th>
                    <th className="px-4 py-2 border text-black">Treatment Satisfaction</th>
                    <th className="px-4 py-2 border text-black">Clinic Cleanliness</th>
                    <th className="px-4 py-2 border text-black">Rating</th>
                    <th className="px-4 py-2 border text-black">Comments</th>
                  </tr>
                </thead>
                <tbody>
                {feedbackData.map((response, index) => (
                  <tr key={response.responseId || `response-${index}`}>
                    <td className="px-4 py-2 border text-black">
                      {response.submittedAt}
                    </td>
                    <td className="px-4 py-2 border text-black">
                      {response.answers['Patient Email']}
                    </td>
                    <td className="px-4 py-2 border text-black">
                      {response.answers['Overall Experience']}
                    </td>
                    <td className="px-4 py-2 border text-black">
                      {response.answers['Staff Professionalism']}
                    </td>
                    <td className="px-4 py-2 border text-black">
                      {response.answers['Treatment Satisfaction']}
                    </td>
                    <td className="px-4 py-2 border text-black">
                      {response.answers['Clinic Cleanliness']}
                    </td>
                    <td className="px-4 py-2 border text-black">
                      {response.answers['Rating']}
                    </td>
                    <td className="px-4 py-2 border text-black">
                      {response.answers['Comments']}
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
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
                    {filteredFeedback.map((feedback, index) => (
                      <div key={feedback.responseId || `feedback-${index}`}>
                        <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin_ViewFeedback;
