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
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination-container">

      <div
        className="pagination"
        aria-label="Player pagination"
      >

        {/* PREVIOUS BUTTON */}

        <button
          type="button"
          className="pagination-arrow"
          disabled={currentPage === 1}
          onClick={handlePrevious}
          aria-label="Previous page"
          title="Previous page"
        >
          ← Previous
        </button>

        {/* CURRENT PAGE */}

        <span className="pagination-page-info">
          Page {currentPage} of {totalPages}
        </span>

        {/* NEXT BUTTON */}

        <button
          type="button"
          className="pagination-arrow"
          disabled={currentPage === totalPages}
          onClick={handleNext}
          aria-label="Next page"
          title="Next page"
        >
          Next →
        </button>

      </div>

    </div>
  );
}

export default Pagination;