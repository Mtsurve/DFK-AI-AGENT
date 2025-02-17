import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
const BackendUrl = import.meta.env.VITE_BACKEND_URL_PY;

export const sendMessageToTransactionAgent = async (message, email) => {
  const token = Cookies.get("defi-auth-token");

  const promise = axios.post(
    `${BackendUrl}/swap`,
    { message, email },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const response = await toast.promise(promise, {});

  return response.data;
};
