"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  onPageChange,
}: PaginationControlsProps) => {
  // Calculate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t py-4 gap-3 text-sm">
      {/* Left info */}
      <div className="text-gray-600">
        Showing <span className="font-medium">{startIndex}</span>–
        <span className="font-medium">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{" "}
        of <span className="font-medium">{totalItems}</span> products
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-1 justify-center sm:justify-end">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Button>

        {/* Page Numbers */}
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`${
              page === currentPage
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } rounded-md`}
          >
            {page}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
