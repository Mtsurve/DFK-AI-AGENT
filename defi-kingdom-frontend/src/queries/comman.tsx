import { toast } from "react-toastify";
import instance from "./axios";

export const loginApi = async (loginInput: any) => {
  const promise = instance.post("user/sign-in", loginInput);
  const response = await toast.promise(promise, {
    pending: "Authenticating your credentials",
    success: "You're now logged in!",
    error: {
      render({ data }) {
        return data?.response?.data?.message;
      },
    },
  });
  return response.data;
};

export const registerApi = async (registerInput: any) => {
  const promise = instance.post("user/register", registerInput);
  const response = await toast.promise(promise, {
    pending: "Creating your account",
    success: "Registration successful!",
    error: {
      render({ data }) {
        return data?.response?.data?.message;
      },
    },
  });
  return response.data;
};

export const resetPassword = async (data: any) => {
  const promise = instance.put("user/set-user-password", data);
  const response = await toast.promise(promise, {
    pending: "Validating Details",
    success: "Your new password has been set",
    error: {
      render({ data }) {
        return data?.response?.data?.message;
      },
    },
  });
  return response.data;
};

export const forgotPasswordApi = async (emailInput: any) => {
  const promise = instance.post("user/forgot-password", emailInput);
  const response = await toast.promise(promise, {
    pending: "Sending reset link to your email",
    success: "Reset link sent to your email",
    error: {
      render({ data }) {
        return data?.response?.data?.message;
      },
    },
  });
  return response.data;
};

export const sendOtpApi = async () => {
  const promise = instance.post("otp/generate-otp");
  await toast.promise(promise, {
    pending: "Sending OTP",
    success: "OTP sent successfully",
  });
};

export const verifyOtpApi = async (data: any) => {
  const promise = instance.post("otp/verify-otp", data);
  const response = await toast.promise(promise, {
    pending: "Verifying OTP",
    success: "OTP verified successfully",
    error: {
      render({ data }) {
        return data?.response?.data?.message;
      },
    },
  });
  return response.data;
};

export const withdrawAmount = async (data: any) => {
  const promise = instance.post("token/withdraw-funds", data);
  const response = await toast.promise(promise, {
    pending: "Withdrawing Amount",
    success: "Amount Withdraw Successfully",
    error: {
      render({ data }) {
        return data?.response?.data?.message;
      },
    },
  });
  return response.data;
};

export const verifyDefiBotConnect = async (data: any) => {
  const promise = instance.post("user/telegram-verify", data);
  const response = await toast.promise(promise, {});
  return response.data;
};

export const fetchUserDetails = async () => {
  const promise = instance.get("/user/user-profiles-data");
  const response = await toast.promise(promise, {});
  return response.data;
};

export const updateTelegramId = async ({
  telegram,
  id,
}: {
  telegram: string;
  id: number;
}) => {
  const promise = instance.put("/user/telegram-username", {
    telegram_username: telegram,
    id,
  });

  const response = await toast.promise(promise, {
    pending: "Updating Telegram ID...",
    success: "Telegram ID updated successfully",
    error: {
      render({ data }) {
        return data?.response?.data?.message;
      },
    },
  });

  return response.data;
};

export const fetchUserActivityDetails = async () => {
  const promise = instance.get("/user/get-user-activity");
  const response = await toast.promise(promise, {});
  return response.data;
};
