import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

const ProtectedRoutes = ({ accountType }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false); // Set initial state to false
  const [hasChangedPassword, setHasChangedPassword] = useState(false); // Set initial state to false
  const location = useLocation();
  
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('role');
  const adminId = sessionStorage.getItem('admin_id');

  // Add cache control to prevent browser caching of protected pages
  useEffect(() => {
    // Set cache control headers using meta tags
    const metaCache = document.createElement('meta');
    metaCache.httpEquiv = 'Cache-Control';
    metaCache.content = 'no-store, no-cache, must-revalidate, proxy-revalidate';
    document.head.appendChild(metaCache);

    const metaPragma = document.createElement('meta');
    metaPragma.httpEquiv = 'Pragma';
    metaPragma.content = 'no-cache';
    document.head.appendChild(metaPragma);

    const metaExpires = document.createElement('meta');
    metaExpires.httpEquiv = 'Expires';
    metaExpires.content = '0';
    document.head.appendChild(metaExpires);

    // Clean up function to remove meta tags when component unmounts
    return () => {
      document.head.removeChild(metaCache);
      document.head.removeChild(metaPragma);
      document.head.removeChild(metaExpires);
    };
  }, []);

  useEffect(() => {
    const checkProfileStatus = async () => {
        if (accountType === 'admin') {
            const adminId = sessionStorage.getItem('admin_id');
            const token = sessionStorage.getItem('token');
            
            console.log('Protected route check:', { adminId, token });
            
            if (!adminId || !token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/admin/${adminId}/profile`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Profile data received:', data);
                    
                    // Update both state and sessionStorage
                    setIsProfileComplete(Boolean(data.isProfileComplete));
                    setHasChangedPassword(Boolean(data.hasChangedPassword));
                    
                    sessionStorage.setItem('isProfileComplete', data.isProfileComplete);
                    sessionStorage.setItem('hasChangedPassword', data.hasChangedPassword);
                    
                    console.log('Updated status:', {
                        isProfileComplete: data.isProfileComplete,
                        hasChangedPassword: data.hasChangedPassword
                    });
                } else {
                    console.error('Profile check failed:', response.status);
                    if (response.status === 401) {
                        sessionStorage.clear();
                        window.location.href = '/login';
                    }
                }
            } catch (error) {
                console.error('Error checking profile status:', error);
            }
        }
        setIsLoading(false);
    };

    checkProfileStatus();
}, [accountType, location.pathname]); // Add location.pathname to dependencies

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Check if the user is authenticated
  const isAuthenticated = Boolean(token);
  
  // If a specific account type is required, check that it matches
  const isAuthorized = !accountType || userRole === accountType;

  // Check if this is an admin route
  // Check if this is an admin route
if (accountType === 'admin') {
  const isProfilePage = location.pathname === '/admin-profile';
  const isPasswordPage = location.pathname === '/admin-change-password';
  const profileComplete = sessionStorage.getItem('isProfileComplete') === 'true';
  const passwordChanged = sessionStorage.getItem('hasChangedPassword') === 'true';
  
  console.log('Route protection check:', {
      isProfilePage,
      isPasswordPage,
      profileComplete,
      passwordChanged,
      currentPath: location.pathname
  });

  // Allow access to profile and password pages
  if (isProfilePage || isPasswordPage) {
      return <Outlet />;
  }

  // Redirect to profile if incomplete
  if (!profileComplete) {
      console.log('Redirecting to profile page - incomplete profile');
      return <Navigate to="/admin-profile" replace />;
  }

  // Redirect to password change if needed
  if (!passwordChanged) {
      console.log('Redirecting to profile page - password change needed');
      return <Navigate to="/admin-profile" replace state={{ showPasswordModal: true }} />;
  }
}

  // Only allow access if both authenticated and authorized
  if (!isAuthenticated || !isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;