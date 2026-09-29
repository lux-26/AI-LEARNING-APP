import React from "react";
import { Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isAuthenticated = true;
  const loadind = false;

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
