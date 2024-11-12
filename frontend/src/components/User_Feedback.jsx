import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import buksubg from '/src/images/BukSU-Dental-Clinic.jpg';
import Logo from '/src/images/Dental_logo.png';
import bell from '/src/images/bell.png';

const User_Feedback = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      if (response.ok) {
        setFeedbackSuccess(true);
        setEmail('');
        setMessage('');
        setTimeout(() => setFeedbackSuccess(false), 3000);
      } else {
        console.error('Failed to send feedback');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side with Image and Heading */}
      <div
        className="md:w-1/2 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${buksubg})` }}
      >
        <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
          <img className="w-16 mb-6" src={Logo} alt="dental-logo" />
          <h1 className="text-4xl md:text-5xl text-white font-bold">We Value Your Feedback</h1>
          <p className="mt-4 text-lg text-white">Your input helps us improve our services!</p>
        </div>
      </div>

      {/* Right Side with Form */}
      <div className="md:w-1/2 w-full bg-blue-900 flex items-center justify-center p-10">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
          {/* Back Button */}
          <Link to="/Dashboard" className="absolute top-4 left-4 text-blue-500 hover:text-blue-700 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-lg">Back</span>
          </Link>

          {/* Header */}
          <header className="flex justify-between items-center mb-10 p-6">
            <h2 className="text-3xl font-semibold text-blue-900">Feedback</h2>
            <button className="bg-gray-200 p-2 rounded-full hover:bg-gray-300">
              <img className="w-5" src={bell} alt="Notifications" />
            </button>
          </header>

          {feedbackSuccess && (
            <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
              Feedback sent successfully!
            </div>
          )}

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                placeholder="Your feedback"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Send Feedback
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default User_Feedback;
