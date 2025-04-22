import React, { useEffect } from 'react';
import { useDentistTheme } from '../context/DentistThemeContext';

const Toast = ({ message, type = 'success', isVisible, onClose, duration = 3000 }) => {
  const { isDarkMode } = useDentistTheme();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const baseClasses = `fixed top-4 right-4 flex items-center p-4 mb-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
    isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
  }`;

  const colorClasses = type === 'success'
    ? `${isDarkMode ? 'bg-green-800' : 'bg-green-100'} ${isDarkMode ? 'text-green-200' : 'text-green-800'}`
    : `${isDarkMode ? 'bg-red-800' : 'bg-red-100'} ${isDarkMode ? 'text-red-200' : 'text-red-800'}`;

  return (
    <div className={`${baseClasses} ${colorClasses}`} role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2">
        {getIcon()}
      </div>
      <div className="text-sm font-medium">{message}</div>
      <button
        type="button"
        className={`ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center h-8 w-8 ${
          type === 'success'
            ? `${isDarkMode ? 'hover:bg-green-700 focus:ring-green-600' : 'hover:bg-green-200 focus:ring-green-400'}`
            : `${isDarkMode ? 'hover:bg-red-700 focus:ring-red-600' : 'hover:bg-red-200 focus:ring-red-400'}`
        }`}
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      </button>
    </div>
  );
};

export default Toast; 