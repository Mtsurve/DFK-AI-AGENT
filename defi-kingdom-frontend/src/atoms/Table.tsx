import React, { useState } from "react";

interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  rows: Record<string, any>[];
}

const Table: React.FC<TableProps> = ({ columns, rows }) => {
  const [visibleRows, setVisibleRows] = useState(15);

  const handleLoadMore = () => {
    setVisibleRows((prev) => prev + 15);
  };

  return (
    <div className="overflow-x-auto w-full mb-28">
      <div className="max-h-96 overflow-y-auto rounded-t-lg">
        <table className="min-w-full whitespace-nowrap bg-white border border-none border-gray-200 shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white sticky top-0 z-10">
            <tr className="py-4">
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 text-left border-b ${
                    index === 0
                      ? "rounded-tl-lg sticky left-0 z-20 bg-gray-800"
                      : ""
                  } ${index === columns.length - 1 ? "rounded-tr-lg" : ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.slice(0, visibleRows).map((row, index) => (
                <tr key={index} className="border-b">
                  {columns.map((col, colIndex) => (
                    <td
                      key={col.key}
                      className={`font-semobold text-sm my-3 py-2 px-4 border-b ${
                        colIndex === 0 ? "sticky left-0 z-auto bg-white" : ""
                      }`}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {visibleRows < rows.length && (
          <div className="text-center py-4">
            <button
              onClick={handleLoadMore}
              className="w-full py-3 rounded-lg text-white text-sm font-semibold transition duration-300 bg-blue-600 hover:bg-blue-700"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
