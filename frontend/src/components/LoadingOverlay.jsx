import React from 'react';

const LoadingOverlay = ({ 
  message = "Loading...", 
  isDarkMode = false, 
  fullScreen = false,
  isTransparent = true
}) => {
  return (
    <div className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} ${isTransparent ? 'backdrop-blur-sm bg-black/30' : isDarkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center z-10`}>
      <div className={`${isTransparent ? 'bg-white/90 dark:bg-gray-800/90' : isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-xl flex flex-col items-center justify-center`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{message}</h2>
      </div>
    </div>
  );
};

export default LoadingOverlay; 