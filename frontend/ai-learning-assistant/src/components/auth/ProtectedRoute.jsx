import { Outlet, Navigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout.jsx";
import { useAuth } from "../../context/authContext";

const ProtectedRoute = () => {
  const { isAuthenticated, loadind } = useAuth;

  if (loadind) {
    return <div className="">Loading...</div>;
  }
  return isAuthenticated ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
