import { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [pageInput, setPageInput] = useState("");

  const getPages = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const handleGoToPage = () => {
    const page = Number(pageInput);

    if (
      !pageInput ||
      !Number.isInteger(page) ||
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    onPageChange(page);
    setPageInput("");
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleGoToPage();
    }
  };

  return (
    <div className="pagination-container">

      {/* PAGE NAVIGATION */}

      <div
        className="pagination"
        aria-label="Player pagination"
      >

        {/* PREVIOUS */}

        <button
          type="button"
          className="pagination-arrow"
          disabled={currentPage === 1}
          onClick={() =>
            onPageChange(currentPage - 1)
          }
          aria-label="Previous page"
          title="Previous page"
        >
          ←
        </button>

        {/* PAGE NUMBERS */}

        {getPages().map((page, index) =>
          page === "..." ? (
            <span
              key={`dots-${index}`}
              className="pagination-dots"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <button
              type="button"
              key={page}
              className={
                page === currentPage
                  ? "pagination-button active"
                  : "pagination-button"
              }
              onClick={() =>
                onPageChange(page as number)
              }
              aria-current={
                page === currentPage
                  ? "page"
                  : undefined
              }
              aria-label={`Go to page ${page}`}
            >
              {page}
            </button>
          )
        )}

        {/* NEXT */}

        <button
          type="button"
          className="pagination-arrow"
          disabled={currentPage === totalPages}
          onClick={() =>
            onPageChange(currentPage + 1)
          }
          aria-label="Next page"
          title="Next page"
        >
          →
        </button>

      </div>

      {/* GO TO PAGE */}

      <div className="go-to-page">

        <label htmlFor="page-input">
          Go to page
        </label>

        <input
          id="page-input"
          type="number"
          min="1"
          max={totalPages}
          value={pageInput}
          placeholder="Page"
          onChange={(event) =>
            setPageInput(event.target.value)
          }
          onKeyDown={handleKeyDown}
          aria-label={`Enter page number between 1 and ${totalPages}`}
        />

        <button
          type="button"
          onClick={handleGoToPage}
          disabled={!pageInput}
        >
          Go
        </button>

      </div>

    </div>
  );
}

export default Pagination;