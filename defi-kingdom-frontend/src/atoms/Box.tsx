import React, { ReactNode } from "react";

interface BoxProps {
  children: ReactNode;
  overflow?: string;
}

const Box: React.FC<BoxProps> = ({ children, overflow = "" }) => {
  return (
    <div
      className={`bg-white ${overflow} dark:bg-gray-900 rounded-md border dark:border-gray-800 border-gray-300 mb-4 shadow-md p-6`}
    >
      
      {children}
    </div>
  );
};

export default Box;
