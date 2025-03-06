import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const { currentUser, loading } = useSelector((state) => state.auth);
  
  console.log("PrivateRoute - currentUser:", currentUser);
  console.log("PrivateRoute - loading:", loading);

  if (loading) {
    return null;
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
} 