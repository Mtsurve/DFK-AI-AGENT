import { toast } from "react-toastify";
import instance from "../axios";
const BackendUrl = import.meta.env.VITE_BACKEND_URL_PY;

export const sendMessageToAgent = async (message) => {
  const promise = instance.post(`${BackendUrl}/chat`, { query: message });
  const response = await toast.promise(promise, {});

  return response.data;
};
