import axios from "axios";
import Cookies from "js-cookie";
import store from "../Redux/store";
import { logout } from "../Redux/authSlice";

const BackendUrl = import.meta.env.VITE_BACKEND_URL;
const prefix = "/v1";

const instance = axios.create({
  baseURL: BackendUrl + prefix,
});

// Request Interceptor
instance.interceptors.request.use((req) => {
  const token = Cookies.get("defi-auth-token"); // Get the token directly

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
    req.headers["ngrok-skip-browser-warning"] = true;
  }
  return req;
});

// Response Interceptor
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove("defi-auth-token");
      store.dispatch(logout());

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    if (
      !err.response?.data?.message ||
      typeof err.response.data.message !== "string"
    ) {
      err.response = err.response || {};
      err.response.data = { message: "Something went wrong!" };
    }

    return Promise.reject(err);
  }
);

export default instance;
