import { toast } from "react-toastify";
import instance from "../axios";

export const getHeroesByAddress = async (address) => {
  const promise = instance.get(`heroes/owner-heroes?address=${address}`);
  const response = await toast.promise(promise, {});

  return response.data;
};
