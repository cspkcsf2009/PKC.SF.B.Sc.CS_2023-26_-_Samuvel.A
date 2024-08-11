import React from 'react';
import { useNavigate } from 'react-router-dom';

// Custom hook to handle user logout
export const useLogout = () => {
  // Get the navigate function from react-router-dom
  let navigate = useNavigate();

  // Return a function to be used for user logout
  return () => {
    // Clear the session storage to log the user out
    sessionStorage.clear();

    // Navigate to the login page after logout
    navigate('/login');
  };
};
