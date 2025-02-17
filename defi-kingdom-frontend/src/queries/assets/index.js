import { toast } from "react-toastify";
import instance from "../axios";

export const getHeroesByAddress = async (address) => {
  const promise = instance.get(`heroes/owner-heroes?address=${address}`);
  const response = await toast.promise(promise, {});

  return response.data;
};

export const sellHeroById = async (data) => {
  const promise = instance.post(`heroes/sell-hero`, data);
  const response = await toast.promise(promise, {
    pending: "Selling hero...",
    success: "Hero sold successfully!",
    error: {
      render({ data }) {
        return data?.response?.data?.message;
      },
    },
  });
  return response.data;
};
