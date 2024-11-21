import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

const ProtectedRoutes = ({ accountType }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const location = useLocation();
  
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('role');
  const adminId = sessionStorage.getItem('admin_id');

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (accountType === 'admin' && token && adminId) {
        try {
          const response = await fetch(`http://localhost:5000/admins/${adminId}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsProfileComplete(data.isProfileComplete);
          }
        } catch (error) {
          console.error('Error checking profile completion:', error);
        }
      }
      setIsLoading(false);
    };

    checkProfileCompletion();
  }, [accountType, token, adminId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if the user is authenticated
  const isAuthenticated = Boolean(token);
  
  // If a specific account type is required, check that it matches
  const isAuthorized = !accountType || userRole === accountType;

  // Check if this is an admin and profile is incomplete
  if (accountType === 'admin' && !isProfileComplete && !location.pathname.includes('/admin-profile')) {
    return <Navigate to="/admin-profile" replace />;
  }

  // Only allow access if both authenticated and authorized
  if (!isAuthenticated || !isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;