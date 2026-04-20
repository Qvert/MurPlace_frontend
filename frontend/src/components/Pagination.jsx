import React from 'react'

function getVisiblePages(totalPages, currentPage, maxVisiblePages) {
  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const half = Math.floor(maxVisiblePages / 2)
  let start = Math.max(1, currentPage - half)
  let end = start + maxVisiblePages - 1

  if (end > totalPages) {
    end = totalPages
    start = end - maxVisiblePages + 1
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showPageNumbers = false,
  maxVisiblePages = 5,
  prevLabel = 'Prev',
  nextLabel = 'Next',
  containerClassName,
  prevButtonClassName,
  nextButtonClassName,
  infoClassName,
  pageListClassName,
  pageButtonClassName,
  activePageButtonClassName
}) {
  if (totalPages <= 1) return null

  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const visiblePages = showPageNumbers
    ? getVisiblePages(totalPages, safeCurrentPage, Math.max(3, maxVisiblePages))
    : []

  const defaultContainerClass = showPageNumbers
    ? 'flex items-center justify-center gap-2 mb-12'
    : 'flex justify-center items-center mt-10 gap-4'

  const defaultPrevNextClass = showPageNumbers
    ? 'p-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
    : 'px-4 py-2 rounded-lg border text-indigo-600 border-indigo-600 hover:bg-indigo-50 disabled:text-gray-400 disabled:border-gray-200 disabled:hover:bg-transparent'

  const defaultInfoClass = 'font-medium'
  const defaultPageListClass = 'flex gap-1'
  const defaultPageButtonClass = 'w-10 h-10 rounded-lg text-sm font-medium transition-colors bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
  const defaultActivePageButtonClass = 'bg-indigo-600 text-white border-indigo-600'

  const goToPage = (page) => {
    const next = Math.min(Math.max(1, page), totalPages)
    if (next !== safeCurrentPage) {
      onPageChange(next)
    }
  }

  return (
    <div className={containerClassName || defaultContainerClass}>
      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage - 1)}
        disabled={safeCurrentPage === 1}
        className={prevButtonClassName || defaultPrevNextClass}
      >
        {prevLabel}
      </button>

      {showPageNumbers ? (
        <div className={pageListClassName || defaultPageListClass}>
          {visiblePages.map(page => (
            <button
              key={page}
              type="button"
              onClick={() => goToPage(page)}
              className={`${pageButtonClassName || defaultPageButtonClass} ${
                page === safeCurrentPage
                  ? activePageButtonClassName || defaultActivePageButtonClass
                  : ''
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      ) : (
        <span className={infoClassName || defaultInfoClass}>
          {safeCurrentPage} / {totalPages}
        </span>
      )}

      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage + 1)}
        disabled={safeCurrentPage === totalPages}
        className={nextButtonClassName || defaultPrevNextClass}
      >
        {nextLabel}
      </button>
    </div>
  )
}
