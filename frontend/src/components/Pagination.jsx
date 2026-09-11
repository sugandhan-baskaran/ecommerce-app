const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const pageNumbers = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav className="flex justify-center gap-2 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="btn-secondary px-3 py-1.5 disabled:opacity-40"
      >
        Prev
      </button>
      {pageNumbers.map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-3 py-1.5 rounded-md text-sm ${
            num === page ? "bg-primary-600 text-white" : "btn-secondary"
          }`}
        >
          {num}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === pages}
        className="btn-secondary px-3 py-1.5 disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
