import { type FC } from "react";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import FlowbiteWrapper from "./components/flowbite-wrapper";
import TransactionAgent from "./pages/TransactionAgent/TransactionAgent";
import Login from "./pages/authentication/Login";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import Register from "./pages/authentication/Register";
import ForgotPassword from "./pages/authentication/ForgotPassword";
import SetPassword from "./pages/authentication/SetPassword";
import ProtectedRoute from "./ProtectedRoute";
import WalletDetails from "./pages/users/walletDetails";
import DfkAgent from "./pages/DfkAgent/DfkAgent";
import Assets from "./pages/Assets/Assets";
import GoogleAuthPage from "./pages/authentication/GoogleAuthPage";
import AuthError from "./pages/AuthError";
import Profile from "./pages/users/Profile";

const queryClient = new QueryClient();

const App: FC = function () {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route element={<FlowbiteWrapper />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/set-password/:token" element={<SetPassword />} />
            <Route path="/auth/error" element={<AuthError />} />
            <Route
              path="/auth/google/success/:token/:wallet_address"
              element={<GoogleAuthPage />}
            />
            <Route
              path="/dfk-agent"
              element={
                <ProtectedRoute>
                  <DfkAgent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaction-agent"
              element={
                <ProtectedRoute>
                  <TransactionAgent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet-details"
              element={
                <ProtectedRoute>
                  <WalletDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets"
              element={
                <ProtectedRoute>
                  <Assets />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          className="!w-full md:!w-auto px-4 md:px-0"
          toastClassName={({ type }) => {
            return `relative p-5 pr-10 flex items-center justify-between rounded-md max-w-[90vw] md:max-w-md mx-auto md:mx-0 ${
              type === "success"
                ? "border-l-4 border-green-500 bg-[#e7f7df] text-green-500"
                : type === "default"
                ? "border-l-4 border-yellow-300 bg-yellow-100 text-yellow-400"
                : "border-l-4 border-red-500 bg-[#ffe8e8] text-red-500"
            } font-semibold`;
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
