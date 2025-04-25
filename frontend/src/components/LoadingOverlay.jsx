import React from 'react';

const LoadingOverlay = ({ 
  message = "Loading...", 
  isDarkMode = false, 
  fullScreen = false,
  isTransparent = true
}) => {
  return (
    <div className={`${fullScreen ? 'fixed inset-0' : 'absolute inset-0'} ${isTransparent ? 'backdrop-blur-sm bg-black/50' : isDarkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center z-50`}>
      <div className={`${isTransparent ? 'bg-white/98 dark:bg-gray-800/98' : isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-xl flex flex-col items-center justify-center border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-6"></div>
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} ${isDarkMode ? 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]' : 'drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]'}`}>{message}</h2>
      </div>
    </div>
  );
};

export default LoadingOverlay; 