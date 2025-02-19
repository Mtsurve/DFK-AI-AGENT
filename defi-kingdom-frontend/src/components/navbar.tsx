/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, type FC } from "react";
import { DarkThemeToggle, Dropdown, Navbar, Tooltip } from "flowbite-react";
import { useSidebarContext } from "../context/SidebarContext";
import isSmallScreen from "../helpers/is-small-screen";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/authSlice";
import { HiMenu } from "react-icons/hi";
import { IoWalletOutline } from "react-icons/io5";
import { MdContentCopy } from "react-icons/md";
import { useNavigate } from "react-router";
import { truncateAddress } from "../utility/constants";

const ExampleNavbar: FC = function () {
  const { isOpenOnSmallScreens, isPageWithSidebar, setOpenOnSmallScreens } =
    useSidebarContext();
  const { authData } = useSelector((state: any) => state.auth);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (walletAddress: string) => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <Navbar fluid>
      <div className="w-full p-2 lg:p-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {isPageWithSidebar && (
              <button
                onClick={() => setOpenOnSmallScreens(!isOpenOnSmallScreens)}
                className="mr-2 lg:mr-3 cursor-pointer rounded p-1 lg:p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white lg:inline"
              >
                {isOpenOnSmallScreens && isSmallScreen() ? (
                  <HiMenu className="h-5 w-5 lg:h-6 lg:w-6" />
                ) : (
                  <HiMenu className="h-5 w-5 lg:h-6 lg:w-6" />
                )}
              </button>
            )}
            <Navbar.Brand>
              <div className="justify-around gap-x-2 flex">
                <img
                  src="../assets/images/Brand_logo.png"
                  alt=""
                  className="w-6 h-6 mt-1 object-contain mix-blend-multiply dark:mix-blend-screen"
                />
                <span className="self-center flex  gap-x-2 whitespace-nowrap text-xl lg:text-2xl font-semibold dark:text-white">
                  DFK AI
                </span>
              </div>
            </Navbar.Brand>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex items-center gap-1 lg:gap-2">
              <Tooltip content={authData?.wallet_address}>
                <button
                  onClick={() => copyToClipboard(authData?.wallet_address)}
                  className="bg-gray-200 flex items-center gap-1 lg:gap-2 dark:bg-gray-700 text-black dark:text-white px-2 lg:px-4 py-1.5 lg:py-2 rounded-xl focus:outline-none hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm lg:text-base"
                >
                  <IoWalletOutline className="w-4 h-4 lg:w-5 lg:h-5" />
                  {truncateAddress(authData?.wallet_address)}
                  {copied && (
                    <span className="text-green-500">
                      <MdContentCopy className="w-4 h-4 lg:w-5 lg:h-5" />
                    </span>
                  )}
                </button>
              </Tooltip>
              <DarkThemeToggle />
            </div>
            <div className="hidden lg:block">
              <UserDropdown />
            </div>
            <div className="lg:hidden">
              <UserDropdown />
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  );
};

const UserDropdown: FC = function () {
  const dispatch = useDispatch();
  const { authData } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  return (
    <>
      <Dropdown
        arrowIcon={false}
        inline
        label={
          <span className="flex items-center justify-center rounded-full w-8 h-8 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 ring-2 ring-gray-300 dark:ring-gray-600 transition-colors">
            {authData?.name[0]}
          </span>
        }
      >
        <Dropdown.Item
          className="hover:rounded-t-2xl"
          onClick={() => navigate("/profile")}
        >
          Profile
        </Dropdown.Item>
        <Dropdown.Item onClick={() => navigate("/wallet-details")}>
          Wallet Details
        </Dropdown.Item>
        <Dropdown.Item
          className="hover:rounded-b-2xl"
          onClick={() => dispatch(logout())}
        >
          Sign out
        </Dropdown.Item>
      </Dropdown>
    </>
  );
};

export default ExampleNavbar;
