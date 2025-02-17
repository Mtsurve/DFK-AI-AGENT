import { Sidebar } from "flowbite-react";
import type { FC } from "react";
import { useEffect, useState } from "react";
import { AiOutlineSwap } from "react-icons/ai";
import { useSidebarContext } from "../context/SidebarContext";
import isSmallScreen from "../helpers/is-small-screen";
import { PiChatCircleDotsBold } from "react-icons/pi";
import { FaArtstation } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router";

const ExampleSidebar: FC = function () {
  const {
    isOpenOnSmallScreens: isSidebarOpenOnSmallScreens,
    setOpenOnSmallScreens,
  } = useSidebarContext();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = location.pathname.split("/")[1];
    if (!pathname) {
      setActiveMenu("dfk-agent");
    } else {
      setActiveMenu(pathname);
    }
  }, [location]);

  const handleMenuChange = (menu: any) => {
    setActiveMenu(menu);
  };

  return (
    <div
      className={`lg:!block ${!isSidebarOpenOnSmallScreens ? "hidden" : ""}`}
    >
      <div>
        <Sidebar
          className="transition-all duration-[450ms] ease-in"
          collapsed={isSidebarOpenOnSmallScreens && !isSmallScreen()}
          onMouseEnter={() => setOpenOnSmallScreens(false)}
          onMouseLeave={() => setOpenOnSmallScreens(true)}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <Sidebar.Items>
                <Sidebar.ItemGroup>
                  <div
                    onClick={() => (
                      navigate("/dfk-agent"), handleMenuChange("dfk-agent")
                    )}
                    className={
                      "dfk-agent" === activeMenu
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 cursor-pointer py-2 rounded-md"
                        : "cursor-pointer text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 rounded-md"
                    }
                  >
                    <div className="w-10 flex items-center fixed justify-center">
                      <PiChatCircleDotsBold size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <span className="whitespace-nowrap ml-10 font-semibold">
                        Defi Agent
                      </span>
                    </div>
                  </div>
                  <div
                    onClick={() => (
                      navigate("/transaction-agent"),
                      handleMenuChange("transaction-agent")
                    )}
                    className={
                      "transaction-agent" === activeMenu
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 cursor-pointer py-2 rounded-md"
                        : "cursor-pointer text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 rounded-md"
                    }
                  >
                    <div className="w-10 flex items-center fixed justify-center">
                      <AiOutlineSwap size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <span className="whitespace-nowrap ml-10 font-semibold">
                        Transaction Agent
                      </span>
                    </div>
                  </div>
                  <div
                    onClick={() => (
                      navigate("/assets"), handleMenuChange("assets")
                    )}
                    className={
                      "assets" === activeMenu
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 cursor-pointer py-2 rounded-md"
                        : "cursor-pointer text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 py-2 rounded-md"
                    }
                  >
                    <div className="w-10 flex items-center fixed justify-center">
                      <FaArtstation size={24} />
                    </div>
                    <div className="overflow-hidden">
                      <span className="whitespace-nowrap ml-10 font-semibold">
                        Assets
                      </span>
                    </div>
                  </div>
                </Sidebar.ItemGroup>
              </Sidebar.Items>
            </div>
          </div>
        </Sidebar>
      </div>
    </div>
  );
};

export default ExampleSidebar;
