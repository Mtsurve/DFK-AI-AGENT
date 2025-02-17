import React from "react";

interface NoContentAvailableProps {
  message?: string;
  height?: string;
}

const NoContentAvailable: React.FC<NoContentAvailableProps> = ({
  message = "No content available",
  height = "80vh",
}) => {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="flex flex-col justify-center items-center gap-4 text-gray-600 dark:text-gray-300 my-8">
        <svg
          className="w-16 h-16 opacity-50 dark:opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <div className="text-2xl font-semibold text-gray-700 dark:text-gray-200">
          {message}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          The requested content is currently not available
        </p>
      </div>
    </div>
  );
};

export default NoContentAvailable;
