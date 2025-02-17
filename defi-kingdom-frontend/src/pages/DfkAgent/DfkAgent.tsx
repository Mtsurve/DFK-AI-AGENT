import { useState, useRef, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { sendMessageToAgent } from "../../queries/dfkAgent";
import { TbRobot } from "react-icons/tb";

interface Message {
  sender: "user" | "agent";
  text: string | AgentResponse;
}

interface AgentResponse {
  response: {
    title?: string;
    description?: string;
    steps?: {
      title: string;
      description: string;
    }[];
  };
}

interface RootState {
  auth: {
    authData: {
      token: string;
    } | null;
  };
}

const DfkAgent = () => {
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

      return await sendMessageToAgent(message);
    },

    onError: () => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          sender: "agent",
          text: "Oops, something went wrong. Please try again.",
        },
      ]);
    },

    onSuccess: (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "agent", text: data },
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
      { sender: "user", text: inputMessage },
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

  const renderAgentResponse = (response: AgentResponse["response"]) => {
    if (!response) return null;

    return (
      <div className="space-y-4">
        {response.title && (
          <h3 className="dark:text-white font-bold text-lg">
            {response.title}
          </h3>
        )}
        {response.description && (
          <p className=" text-sm text-gray-700 dark:text-gray-300">
            {response.description}
          </p>
        )}
        {response.steps && (
          <ul className="space-y-2">
            {response.steps.map((step: any, index: number) => (
              <li key={index} className=" p-2 rounded-lg">
                <h4 className="dark:text-white font-semibold text-sm">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              </li>
            ))}
          </ul>
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
                    <img
                      src="/images/dfk_logo.png"
                      alt="DeFi Kingdoms Logo"
                      className="w-30 h-20 object-contain mix-blend-multiply dark:mix-blend-screen"
                    />
                    <div className="py-2 font-bold text-xl md:text-2xl rounded-2xl text-black dark:text-white text-center">
                      <span className="block">
                        Greetings, brave adventurer! I am your DeFi Kingdoms
                        guide.
                      </span>
                      <span className="block mt-2">
                        Ask me about heroes, quests, trading, or anything
                        DFK-related!
                      </span>
                    </div>
                    <div className="mt-4 text-gray-600 dark:text-gray-400">
                      <p className="text-center">Try asking about:</p>
                      <ul className="mt-2 space-y-1">
                        <li>• How do I start questing with my heroes?</li>
                        <li>• What's the best profession for mining?</li>
                        <li>• How can I swap JEWEL tokens?</li>
                        <li>• What are the current gas fees?</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="h-full space-y-2 mx-4 sm:mx-8 md:mx-16 lg:mx-24">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.sender === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.sender === "agent" && (
                          <div className="">
                            <TbRobot className="w-6 h-6 sm:w-7 sm:h-7 mt-2 sm:mt-3 mx-1 sm:mx-2 rounded-xl bg-gray-200 dark:bg-gray-700 p-1 text-gray-700 dark:text-gray-300" />
                          </div>
                        )}
                        <div
                          className={`px-3 sm:px-4 py-2 rounded-2xl ${
                            message.sender === "user"
                              ? "bg-gray-200 text-black"
                              : "bg-blue-100 mt-2 dark:bg-gray-700 text-black dark:text-white"
                          } ${
                            typeof message.text === "object"
                              ? "agent-response"
                              : ""
                          } max-w-[85%] sm:max-w-[80%]`}
                        >
                          {message.sender === "agent" &&
                          typeof message.text === "object"
                            ? renderAgentResponse(
                                (message.text as AgentResponse).response
                              )
                            : typeof message.text === "string"
                            ? message.text
                            : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {isAnalyzing && (
                <div className="mx-28 flex justify-start items-center">
                  <div className="mb-2 mr-2">
                    <TbRobot className="w-7 h-7 mx-2 rounded-xl bg-gray-200 dark:bg-gray-700 p-1 text-gray-700 dark:text-gray-300" />
                  </div>
                  <div className="rounded-md">{loadingMessage}</div>
                </div>
              )}
              <div className="mx-4 sm:mx-8 md:mx-16 lg:mx-28 py-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Ask about heroes, quests, trading..."
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

export default DfkAgent;
