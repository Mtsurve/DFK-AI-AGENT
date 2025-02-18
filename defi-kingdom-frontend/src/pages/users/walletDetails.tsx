import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { FaEthereum, FaWallet, FaCopy } from "react-icons/fa";
import { useSelector } from "react-redux";
import Box from "../../atoms/Box";
import { QRCodeSVG } from "qrcode.react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  tokens,
  tokenABI,
  AVALANCHE_MAINNET_PARAMS,
  USER_ACTIVITY_COLUMNS,
  truncateAddress,
} from "../../utility/constants";
import Modal from "../../atoms/Modal";
import ReusableButton from "../../atoms/ReusableButton";
import { IoIosKey } from "react-icons/io";
import {
  fetchUserActivityDetails,
  sendOtpApi,
  verifyOtpApi,
  withdrawAmount,
} from "../../queries/comman";
import { useMutation, useQuery } from "@tanstack/react-query";
import Table from "../../atoms/Table";

const provider = new ethers.JsonRpcProvider(
  "https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc"
);

const WalletDetails = () => {
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [nativeBalance, setNativeBalance] = useState<string>("Loading...");
  const { authData } = useSelector((state: any) => state.auth);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false);
  const [avaxBalance, setAvaxBalance] = useState("0.00");
  const [userActivity, setUserActivity] = useState([]);

  const { data: userActivityDetails } = useQuery({
    queryKey: ["userActivityDetails"],
    queryFn: fetchUserActivityDetails,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const withdrawMutation = useMutation({
    mutationFn: withdrawAmount,
    onSuccess: (data) => {
      setShowWithdrawModal(false);
      fetchAvaxBalance();
      fetchBalances();
    },
    onError: (error) => {
      console.error("Error withdrawing:", error);
    },
  });

  const handleWithdraw = async (address: string, amount: string) => {
    withdrawMutation.mutate({
      to: address,
      amount: amount.toString(),
    });
  };

  const withdrawValidationSchema = Yup.object().shape({
    address: Yup.string()
      .required("Address is required")
      .matches(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    amount: Yup.number()
      .required("Amount is required")
      .positive("Amount must be positive")
      .test(
        "balance-check",
        "Amount exceeds available balance",
        function (value) {
          const availableBalance = Number(avaxBalance || 0);
          return !value || value <= availableBalance;
        }
      ),
  });

  const otpValidationSchema = Yup.object().shape({
    otp: Yup.string()
      .required("OTP is required")
      .matches(/^[0-9]{6}$/, "OTP must be 6 digits"),
  });

  const sendOtpMutation = useMutation({
    mutationFn: sendOtpApi,
    onSuccess: () => {
      setOtpSent(true);
    },
    onError: (error) => {
      console.error("Error sending OTP:", error);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (data) => {
      setPrivateKeyVisible(true);
    },
    onError: (error) => {
      console.error("Error verifying OTP:", error);
    },
  });

  const handleSendOTP = async () => {
    sendOtpMutation.mutate();
  };

  const handleVerifyOTP = async (otp: string) => {
    verifyOtpMutation.mutate({ otp });
  };

  const exportKeyContent = () => {
    if (!otpSent) {
      return (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We'll send a verification code to your registered email address for
            security purposes.
          </p>
          <ReusableButton
            type="button"
            className="w-full"
            onClick={handleSendOTP}
            disabled={sendOtpMutation.isPending}
          >
            {sendOtpMutation.isPending
              ? "Sending..."
              : "Send Verification Code"}
          </ReusableButton>
        </div>
      );
    }

    if (otpSent && !privateKeyVisible) {
      return (
        <Formik
          initialValues={{ otp: "" }}
          validationSchema={otpValidationSchema}
          onSubmit={(values) => handleVerifyOTP(values.otp)}
        >
          {({ errors, touched }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter 6-digit verification code
                </label>
                <Field
                  name="otp"
                  type="text"
                  maxLength={6}
                  className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                    errors.otp && touched.otp
                      ? "border-red-500"
                      : "border-gray-300"
                  } dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700`}
                  placeholder="Enter OTP"
                />
                {errors.otp && touched.otp && (
                  <div className="text-red-500 text-sm mt-1">{errors.otp}</div>
                )}
              </div>
              <ReusableButton
                type="submit"
                className="w-full"
                disabled={verifyOtpMutation.isPending}
                onClick={() => {}}
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify Code"}
              </ReusableButton>
            </Form>
          )}
        </Formik>
      );
    }

    if (privateKeyVisible) {
      return (
        <>
          <div className="text-center mb-6">
            <p className="text-red-500 text-sm mb-4">
              Warning: Never share your private key with anyone. Anyone with
              your private key has full control over your wallet.
            </p>
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white rounded-2xl shadow-inner">
                <QRCodeSVG
                  value={
                    verifyOtpMutation.data?.result?.wallet_private_key || ""
                  }
                  size={200}
                  level="H"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl flex items-center justify-between border border-gray-200 dark:border-gray-700">
              <div className="truncate flex-1 font-mono text-sm text-gray-600 dark:text-gray-300">
                {verifyOtpMutation.data?.result?.wallet_private_key || ""}
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    verifyOtpMutation.data?.result?.wallet_private_key || ""
                  )
                }
                className={`ml-3 p-2 rounded-lg transition-all duration-200 ${
                  isCopied
                    ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                }`}
              >
                <FaCopy className={`w-4 h-4 ${isCopied ? "scale-110" : ""}`} />
              </button>
            </div>
          </div>
        </>
      );
    }
  };

  async function fetchBalances() {
    try {
      const native = await provider.getBalance(authData.wallet_address);
      setNativeBalance(ethers.formatEther(native));
      const tokenBalances: Record<string, string> = {};

      for (const token of tokens) {
        const contract = new ethers.Contract(token.address, tokenABI, provider);
        const balance = await contract.balanceOf(authData.wallet_address);
        const decimals = await contract.decimals();

        tokenBalances[token.name] = (
          Number(balance.toString()) /
          10 ** Number(decimals)
        ).toFixed(4);
      }

      setBalances(tokenBalances);
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  }

  async function fetchAvaxBalance() {
    try {
      const provider = new ethers.JsonRpcProvider(
        AVALANCHE_MAINNET_PARAMS.rpcUrls[0]
      );
      const balance = await provider.getBalance(authData.wallet_address);
      setAvaxBalance(ethers.formatEther(balance));
      return;
    } catch (error) {
      console.error("Error fetching AVAX C-Chain balance:", error);
      return "0.00";
    }
  }

  useEffect(() => {
    fetchBalances(), fetchAvaxBalance();
  }, []);

  const withdrawContent = () => {
    return (
      <>
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Available Balance
          </p>
          <p className="text-xl font-bold text-black dark:text-white">
            {avaxBalance ?? "Loading..."} AVAX
          </p>
        </div>
        <Formik
          initialValues={{ address: "", amount: "" }}
          validationSchema={withdrawValidationSchema}
          validateOnChange={true}
          validateOnBlur={true}
          onSubmit={(values, { setSubmitting }) => {
            handleWithdraw(values.address, values.amount);
            setSubmitting(false);
          }}
        >
          {({ errors, touched, values }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipient Address
                </label>
                <Field
                  name="address"
                  type="text"
                  className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none ${
                    errors.address && touched.address
                      ? "border-red-500"
                      : "border-gray-300"
                  } dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700`}
                  placeholder="Enter wallet address"
                />
                {errors.address && touched.address && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.address}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (Avax)
                </label>
                <div className="relative">
                  <Field
                    name="amount"
                    type="number"
                    className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                      errors.amount && touched.amount
                        ? "border-red-500"
                        : "border-gray-300"
                    } dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700`}
                    placeholder="0.0"
                  />
                </div>
                {errors.amount && touched.amount && (
                  <div className="text-red-500 text-sm mt-1">
                    {errors.amount}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  Object.keys(errors).length > 0 || withdrawMutation.isPending
                }
                className="w-full p-3 rounded-lg text-white text-sm font-semibold transition duration-300 bg-blue-600 hover:bg-blue-700 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
              </button>
            </Form>
          )}
        </Formik>
      </>
    );
  };

  const depositContent = () => {
    return (
      <>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          Scan the QR code or copy the address below to deposit AVAX to your
          wallet
        </p>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-2xl shadow-inner">
            <QRCodeSVG
              value={authData.wallet_address}
              size={200}
              level="H"
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl flex items-center justify-between border border-gray-200 dark:border-gray-700">
          <div className="truncate flex-1 font-mono text-sm text-gray-600 dark:text-gray-300">
            {authData.wallet_address}
          </div>
          <button
            onClick={() => copyToClipboard(authData.wallet_address)}
            className={`ml-3 p-2 rounded-lg transition-all duration-200 ${
              isCopied
                ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            }`}
            title={isCopied ? "Copied!" : "Copy to clipboard"}
          >
            <FaCopy className={`w-4 h-4 ${isCopied ? "scale-110" : ""}`} />
          </button>
        </div>
      </>
    );
  };

  useEffect(() => {
    if (userActivityDetails?.result.length > 0) {
      const formattedData = userActivityDetails?.result?.map((item: any) => ({
        name: item.name,
        action: item.action,
        ip_address: item.ip_address,
        transaction_hash: item.transaction_hash && (
          <a
            href={`https://subnets.avax.network/defi-kingdoms/tx/${item.transaction_hash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="text-blue-700 font-bold underline cursor-pointer">
              {truncateAddress(item.transaction_hash)}
            </div>
          </a>
        ),
        createdAt: new Date(item.createdAt).toLocaleString(),
      }));
      setUserActivity(formattedData);
    }
  }, [userActivityDetails?.result]);

  return (
    <>
      <div className="m-3 h-screen overflow-y-auto">
        <Box>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <h1 className="text-xl font-bold text-black dark:text-white flex items-center">
              <FaWallet className="text-gray-700 dark:text-blue-400 mr-2 text-sm" />{" "}
              Wallet Details
            </h1>
            <div className="flex gap-3 w-full sm:w-auto">
              <ReusableButton
                type="submit"
                className="w-full px-3"
                onClick={() => setShowExportModal(true)}
              >
                <div className="flex items-center gap-2">
                  <span>Export</span>
                  <IoIosKey className="text-lg text-gray-800 dark:text-blue-400" />
                </div>
              </ReusableButton>
              <ReusableButton
                type="submit"
                className="w-full px-3"
                onClick={() => setShowDepositModal(true)}
              >
                Deposit
              </ReusableButton>

              <ReusableButton
                type="submit"
                className="w-full px-3"
                onClick={() => setShowWithdrawModal(true)}
              >
                Withdraw
              </ReusableButton>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-100 dark:bg-gray-800 shadow-md rounded-xl p-4 flex items-center justify-between ">
              <div>
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Avax (C Chain)
                </h2>
                <p className="text-base font-bold text-black dark:text-white">
                  {avaxBalance} AVAX
                </p>
              </div>
              <img
                src={tokens[0]?.image}
                alt={`Avax icon`}
                className="w-6 h-6 object-contain mix-blend-multiply dark:mix-blend-screen"
              />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 shadow-md rounded-xl p-4 flex items-center justify-between ">
              <div>
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Native JEWEL Balance
                </h2>
                <p className="text-base font-bold text-black dark:text-white">
                  {nativeBalance} JEWEL
                </p>
              </div>
              <FaEthereum className="text-xl text-yellow-500" />
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-base font-semibold text-gray-600 dark:text-gray-300 mb-3">
              Token Balances
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tokens.map((token) => (
                <div
                  key={token.key}
                  className="bg-gray-100 dark:bg-gray-800 shadow-md rounded-xl p-4 flex items-center justify-between "
                >
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {token.name}
                    </h3>
                    <p className="text-sm font-bold text-black dark:text-white">
                      {balances[token.name] ?? "Loading..."}
                    </p>
                  </div>
                  <img
                    src={token.image}
                    alt={`${token.name} icon`}
                    className="w-6 h-6 object-contain mix-blend-multiply dark:mix-blend-screen"
                  />
                </div>
              ))}
            </div>
          </div>
        </Box>
        <div>
          <div className="p-4">
            <h2 className="text-xl dark:text-white font-bold mb-4">
              User Activity
            </h2>
            {userActivityDetails?.result?.length > 0 && (
              <Table columns={USER_ACTIVITY_COLUMNS} rows={userActivity} />
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title="Deposit Avax On C-Chain"
      >
        {depositContent()}
      </Modal>

      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Avax"
      >
        {withdrawContent()}
      </Modal>

      <Modal
        isOpen={showExportModal}
        onClose={() => {
          setShowExportModal(false);
          setOtpSent(false);
          setPrivateKeyVisible(false);
        }}
        title="Export Private Key"
      >
        {exportKeyContent()}
      </Modal>
    </>
  );
};

export default WalletDetails;
