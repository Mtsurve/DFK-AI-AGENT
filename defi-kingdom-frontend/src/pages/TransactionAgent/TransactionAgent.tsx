import { useEffect, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { TbRobot } from "react-icons/tb";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { sendMessageToTransactionAgent } from "../../queries/transaction/index";
import Card from "../../atoms/Card";
import { ROLES, VARIABLES } from "../../utility/constants";

interface AgentResponse {
  response: {
    action: string;
    amount: number | null;
    from: string;
    message: string | null;
    success_response?: string | Record<string, any>;
    to: string;
  };
}

interface Message {
  sender: string | any;
  text: string | AgentResponse;
}

interface RootState {
  auth: {
    authData: {
      email(
        message: void,
        email: any
      ): AgentResponse | PromiseLike<AgentResponse>;
      token: string;
    } | null;
  };
}

const TransactionAgent = () => {
  const { authData } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("Typing...");

  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const messageMutation = useMutation({
    mutationFn: async (message) => {
      setIsAnalyzing(true);
      const token = authData?.token;

      if (!token) {
        throw new Error("Authentication required");
      }

      return await sendMessageToTransactionAgent(message, authData?.email);
    },
    onError: () => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: ROLES.AGENT,
          text: "Oops, something went wrong. Please try again.",
        },
      ]);
    },
    onSuccess: (data: AgentResponse) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: ROLES.AGENT, text: data },
      ]);
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: ROLES.USER, text: inputMessage },
    ]);

    messageMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isAnalyzing && inputMessage.trim() !== "") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingMessage((prev) =>
          prev.endsWith("...") ? "Typing." : prev + "."
        );
      }, 500);
    } else {
      setLoadingMessage("Typing...");
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const renderAgentResponse = (response: AgentResponse) => {
    if (!response) return null;

    return (
      <div className="space-y-4">
        {response.response.success_response && (
          <p className="text-md text-gray-700 dark:text-gray-300">
            {response.response.success_response}
          </p>
        )}
        {response.response.message && (
          <p className="text-md text-gray-700 dark:text-gray-300">
            {response.response.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900">
          <div className="p-3 overflow-y-auto dark:bg-gray-900">
            <div className="flex flex-col flex-1 bg-white rounded-lg dark:bg-[#1f2937] text-black h-[calc(100vh-100px)] dark:text-white">
              <div
                ref={messageContainerRef}
                className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-100px)]"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="py-2 font-bold text-xl md:text-2xl rounded-2xl text-black dark:text-white text-center">
                      <span className="block">
                        Welcome to Transaction AI! How can I assist you today?
                      </span>
                      <span className="block">Don't know where to start?</span>
                    </div>
                    <div className="flex flex-col gap-2 mt-4 w-full max-w-sm">
                      <button
                        onClick={() =>
                          setInputMessage("Swap 1 Crystal for Jewel")
                        }
                        className="p-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left text-black dark:text-white"
                      >
                        🔄 Swap 1 Crystal for Jewel
                      </button>

                      <button
                        onClick={() =>
                          setInputMessage("Transfer 1 Jewel to Crystal")
                        }
                        className="p-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left text-black dark:text-white"
                      >
                        💸 Transfer 1 Jewel to Crystal
                      </button>
                    </div>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.sender === ROLES.USER
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.sender === ROLES.AGENT && (
                        <TbRobot className="w-6 h-6 sm:w-7 sm:h-7 mt-2 sm:mt-3 mx-1 sm:mx-2 rounded-xl bg-gray-200 dark:bg-gray-700 p-1 text-gray-700 dark:text-gray-300" />
                      )}
                      <div
                        className={`px-3 sm:px-4 py-2 rounded-2xl ${
                          message.sender === ROLES.USER
                            ? "bg-gray-200 text-black"
                            : "bg-blue-100 mt-2 dark:bg-gray-700 text-black dark:text-white"
                        } max-w-[85%] sm:max-w-[80%]`}
                        style={
                          typeof message?.text?.response?.success_response ===
                          VARIABLES.OBJECT
                            ? { width: "-webkit-fill-available" }
                            : {}
                        }
                      >
                        {typeof message?.text?.response?.success_response ===
                        VARIABLES.OBJECT ? (
                          <div className="p-2 w-full flex flex-col items-center">
                            <p className="text-md text-gray-700 dark:text-gray-300 mb-2">
                              Hero Details:
                            </p>
                            <div className="w-full max-w-md sm:max-w-lg">
                              <Card
                                hero={message?.text?.response?.success_response}
                              />
                            </div>
                          </div>
                        ) : typeof message.text === "string" ? (
                          message.text
                        ) : (
                          renderAgentResponse(message.text)
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {isAnalyzing && (
                <div className="mx-28 flex justify-start items-center">
                  <TbRobot className="w-7 h-7 mx-2 mb-1 rounded-xl bg-gray-200 dark:bg-gray-700 p-1 text-gray-700 dark:text-gray-300" />
                  <div className="rounded-md">{loadingMessage}</div>
                </div>
              )}
              <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-28 py-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Start typing here! Try something like Swap 1 Avax for Crystals"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-gray-200 dark:bg-gray-700 border-3 border-gray-200 dark:border-gray-600 rounded-3xl pl-4 pr-12 shadow-sm focus:outline-nonew-full bg-transparent px-2 dark:border-none py-3 text-black dark:text-white focus:outline-none placeholder-gray-500 dark:placeholder-gray-400 rounded-l-3xl focus:ring-0"
                  />
                  <button
                    disabled={isAnalyzing}
                    onClick={handleSendMessage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black dark:bg-gray-900 p-2 text-white rounded-full hover:bg-gray-600 dark:hover:bg-white dark:hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAnalyzing ? (
                      <div className="loader"></div>
                    ) : (
                      <FaArrowRight className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center w-full">
              <span className="text-center text-gray-500 text-sm">
                Powered by DeFi Kingdoms
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionAgent;
