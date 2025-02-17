import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  fetchUserDetails,
  updateTelegramId,
  verifyDefiBotConnect,
} from "../../queries/comman";
import Box from "../../atoms/Box";

const Profile = () => {
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLinkClicked, setIsLinkClicked] = useState(false);
  const queryClient = useQueryClient();

  const { data: userDetails } = useQuery({
    queryKey: ["userDetails"],
    queryFn: fetchUserDetails,
  });

  const mutation = useMutation({
    mutationFn: updateTelegramId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userDetails"] });
    },
  });

  useEffect(() => {
    if (userDetails) {
      setTelegramId(userDetails.result.telegram_username || "");
    }
  }, [userDetails]);

  const handleUpdateTelegram = () => {
    if (telegramId && userDetails?.result?.id) {
      mutation.mutate({
        telegram: telegramId,
        id: Number(userDetails.result.id),
      });
    }
  };

  const verifyBotMutation = useMutation({
    mutationFn: verifyDefiBotConnect,
    onSuccess: () => {
      setVerificationStatus("Successfully Verified ✅");
      queryClient.invalidateQueries({ queryKey: ["userDetails"] });
    },
    onError: () => {
      setVerificationStatus(
        "Failed to Verify ❌ Please Try Again in 5 to 10 mins"
      );
    },
  });

  const handleVerifyDefiBot = () => {
    if (telegramId) {
      verifyBotMutation.mutate({ telegramId });
    }
  };

  const isTelegramChanged =
    telegramId !== userDetails?.result?.telegram_username;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Box>
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
            Profile
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Manage your account details and Telegram ID
          </p>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={userDetails?.result?.name || ""}
              className="w-full px-4 py-3 text-sm border rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-gray-300 cursor-not-allowed"
              disabled
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={userDetails?.result?.email || ""}
              className="w-full px-4 py-3 text-sm border rounded-lg bg-gray-100 dark:bg-gray-800 dark:text-gray-300 cursor-not-allowed"
              disabled
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Telegram User ID
            </label>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={telegramId || ""}
                  onChange={(e) => setTelegramId(e.target.value)}
                  className="w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:text-gray-300 focus:outline-none"
                  placeholder="Enter Telegram User ID"
                />
                <button
                  onClick={handleUpdateTelegram}
                  disabled={!isTelegramChanged}
                  className={`px-5 py-3 text-sm font-semibold rounded-lg shadow-lg transition ${
                    isTelegramChanged
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                >
                  Update
                </button>
              </div>
            </div>
          </div>

          {!userDetails?.result?.telegram_chatid ? (
            <div className="flex flex-col gap-3 p-4 my-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                To connect with the DeFi bot, please{" "}
                <a
                  href="https://t.me/Defi_AI_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 font-medium hover:underline"
                  onClick={() => setIsLinkClicked(true)}
                >
                  click here
                </a>{" "}
                and send <span className="font-semibold">"Connect"</span>. Then,
                click the button below to verify.
              </p>

              <button
                onClick={handleVerifyDefiBot}
                className={`px-5 py-3 text-sm font-semibold rounded-lg shadow-lg transition ${
                  isLinkClicked
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
                disabled={!isLinkClicked || loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

              {verificationStatus && (
                <p
                  className={`text-center text-sm font-semibold ${
                    verificationStatus.includes("Success")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {verificationStatus}
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Note - Telegram user is been Verified ✅{" "}
              </p>
            </>
          )}
        </Box>
      </div>
    </div>
  );
};

export default Profile;
