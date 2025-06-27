import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div
      className={`mt-6 flex items-center justify-center space-x-2 ${className}`}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={prevDisabled}
        className="p-2 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5 text-purple-600" />
      </button>

      {Array.from({ length: totalPages || 1 }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            currentPage === i + 1
              ? "bg-purple-600 text-white"
              : "text-purple-600 hover:bg-purple-50"
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={nextDisabled}
        className="p-2 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5 text-purple-600" />
      </button>
    </div>
  );
};

export default Pagination;
