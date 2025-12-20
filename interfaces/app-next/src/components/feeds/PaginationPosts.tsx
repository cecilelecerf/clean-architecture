"use client"
import { FiltersProps } from "@/utils/endpoint/feedsEndpoint"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"

type Props = { filters: FiltersProps, totalPage: number, onPaginationChange: (page: number) => void }

export const PaginationPosts = ({ filters, totalPage, onPaginationChange }: Props) => {

    const displayedPages = getDisplayedPages(filters, totalPage)
    const goToPage = (page: number) => {
        if (page < 1 || page > totalPage) return
        onPaginationChange(page)
    }
    return (
        <Pagination className="pt-5">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            goToPage(filters.page - 1)
                        }}
                        className={filters.page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
                {displayedPages.map((p, i) => (
                    <PaginationItem key={i}>
                        {p === "..." ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    goToPage(Number(p))
                                }}
                                isActive={filters.page === p}
                            >
                                {p}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={(e) => {
                            e.preventDefault()
                            goToPage(filters.page + 1)
                        }}
                        className={filters.page >= totalPage ? "pointer-events-none opacity-50" : ""}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

const getDisplayedPages = (filters: FiltersProps, totalPages: number) => {
    const { page } = filters
    const pages: (number | string)[] = []
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page > 2) pages.push(1)
    if (page > 3) pages.push("...")
    const start = Math.max(1, page - 1)
    const end = Math.min(totalPages, page + 1)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    if (page < totalPages - 2) pages.push("...")
    if (page < totalPages - 1) pages.push(totalPages)

    return pages
}