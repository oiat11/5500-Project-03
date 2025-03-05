import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const { currentUser, loading } = useSelector((state) => state.auth);
  
  console.log("PrivateRoute - currentUser:", currentUser);
  console.log("PrivateRoute - loading:", loading);

  // Show loading state or return null while checking auth
  if (loading) {
    return null; // or a loading spinner
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
} 