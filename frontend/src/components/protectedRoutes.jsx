// components/ProtectedRoutes.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoutes = ({ accountType }) => {
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('role');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  console.log("Protected route - Token:", token);
  console.log("Protected route - User Role:", userRole);
  console.log("Protected route - User:", user);
  console.log("Required Account Type:", accountType);

  // Check if the user is authenticated
  const isAuthenticated = Boolean(token);
  
  // If a specific account type is required, check that it matches
  const isAuthorized = !accountType || userRole === accountType;

  // Add debug logging
  console.log("Is Authenticated:", isAuthenticated);
  console.log("Is Authorized:", isAuthorized);

  // Only allow access if both authenticated and authorized
  if (!isAuthenticated || !isAuthorized) {
    console.log("Redirecting to login - Auth failed");
    return <Navigate to={`/${accountType}/login`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;