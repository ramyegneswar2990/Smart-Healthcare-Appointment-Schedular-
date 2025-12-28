import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect based on role
  if (user) {
    if (user.role === 'patient' && !location.pathname.startsWith('/patient')) {
      return <Navigate to="/patient/dashboard" replace />;
    }
    if (user.role === 'doctor' && !location.pathname.startsWith('/doctor')) {
      return <Navigate to="/doctor/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;

