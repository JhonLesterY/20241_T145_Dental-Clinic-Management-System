// components/ProtectedRoutes.jsx
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoutes = ({ accountType }) => {
  const token = sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('role');

  console.log("Protected route - Token:", token);      // Check token
  console.log("Protected route - User Role:", userRole); // Check role
  console.log("Required Account Type:", accountType);
  // Check if the user is authenticated
  const isAuthenticated = Boolean(token);
  
  // If a specific account type is required, check that it matches
  const isAuthorized = !accountType || userRole === accountType;

  // Only allow access if both authenticated and authorized
  return isAuthenticated && isAuthorized ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoutes;
