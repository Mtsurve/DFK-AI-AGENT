import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { login } from "../../Redux/authSlice";

const GoogleAuthPage = () => {
  const navigate = useNavigate();
  const { token, wallet_address } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        if (token) {
          const decodedToken = jwtDecode(token);

          console.log(wallet_address);
          const data = {
            name: decodedToken.name,
            email: decodedToken.email,
            token,
            wallet_address,
          };
          dispatch(login(data));

          navigate("/dfk-agent");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Google Authentication failed:", error);
        navigate("/login");
      }
    };

    handleGoogleAuth();
  }, []);

  return <div>Authenticating...</div>;
};

export default GoogleAuthPage;
