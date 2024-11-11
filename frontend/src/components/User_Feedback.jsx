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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, message })
      });

      if (response.ok) {
        setFeedbackSuccess(true);
        setEmail('');
        setMessage('');
      } else {
        console.error("Failed to send feedback");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side with background image and title */}
      <div className="w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${buksubg})` }}>
        <div className="absolute inset-0 bg-blue-900 bg-opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
          <img className="w-14 mb-4" src={Logo} alt="dental-logo" />
          <h1 className="text-5xl text-white font-bold text-center leading-tight">
            We Value Your Feedback
          </h1>
        </div>
      </div>

      {/* Right side with feedback form */}
      <div className="w-1/2 bg-blue-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md relative">
          {/* Back to Dashboard Button */}
          <Link to="/Dashboard" className="absolute top-4 right-4 text-blue-500 hover:underline">
            Back
          </Link>

          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-blue-900">Feedback</h2>
            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
              <img className="w-6" src={bell} alt="Notifications" />
            </button>
          </header>

          {feedbackSuccess && <p className="text-green-600">Feedback sent successfully!</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-600 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm text-gray-600 mb-1">Message</label>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 border bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default User_Feedback;
