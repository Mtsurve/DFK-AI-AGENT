import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import NavbarSidebarLayout from "./layouts/navbar-sidebar";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector(
    (state: { auth: { isAuthenticated: boolean } }) =>
      state.auth.isAuthenticated
  );

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <NavbarSidebarLayout>{children}</NavbarSidebarLayout>;
};

export default ProtectedRoute;
