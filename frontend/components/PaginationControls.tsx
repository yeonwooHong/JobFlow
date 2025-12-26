import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Props {
  currentPage: number;
  totalPages: number;
}

export function PaginationControls({ currentPage, totalPages }: Props) {
  // Calculate the 5-page pagination window
  const maxVisible = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)
  
  // Adjust if we are near the end page
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  // Create an array of page numbers to display
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <Pagination className="justify-center">
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <PaginationPrevious 
            href={`/?page=${currentPage - 1}`}
            // Disable if on first page
            className={currentPage <= 1 ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>

        {/* Jump to first page */}
        {startPage > 1 && (
          <>
            <PaginationItem><PaginationLink href="/?page=1">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
          </>
        )}

        {/* Page Numbers*/}
        {pages.map((page) => (
          <PaginationItem key={page}>
            {/* Highlight current page number */}
            <PaginationLink href={`/?page=${page}`} isActive={currentPage === page}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Jump to last page */}
        {endPage < totalPages && (
          <>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationLink href={`/?page=${totalPages}`}>{totalPages}</PaginationLink></PaginationItem>
          </>
        )}

        {/* Next button */}
        <PaginationItem>
          <PaginationNext 
            href={`/?page=${currentPage + 1}`}
            // Disable if on last page
            className={currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}