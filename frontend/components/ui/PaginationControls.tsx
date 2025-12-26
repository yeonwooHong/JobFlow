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
  const maxVisible = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <Pagination className="justify-center">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href={`/?page=${currentPage - 1}`}
            className={currentPage <= 1 ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>

        {startPage > 1 && (
          <>
            <PaginationItem><PaginationLink href="/?page=1">1</PaginationLink></PaginationItem>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
          </>
        )}

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink href={`/?page=${page}`} isActive={currentPage === page}>
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {endPage < totalPages && (
          <>
            <PaginationItem><PaginationEllipsis /></PaginationItem>
            <PaginationItem><PaginationLink href={`/?page=${totalPages}`}>{totalPages}</PaginationLink></PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext 
            href={`/?page=${currentPage + 1}`}
            className={currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}