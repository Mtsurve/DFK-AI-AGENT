import { useLocation } from "react-router-dom";

const AuthError = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const message = params.get("message");

  return <h2>{message || "Something went wrong"}</h2>;
};

export default AuthError;
