import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProtectedRoutes = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  
  // State to handle redirection
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');  // Redirect to login if user is not authenticated
    } else {
      setLoading(false);  // If user exists, stop loading and render the protected content
    }
  }, [user, navigate]);

  if (loading) {
    // You can render a loading spinner here if needed
    return <div>Loading...</div>;
  }

  return <>{children}</>;  // If authenticated, render the protected content
};

export default ProtectedRoutes;
