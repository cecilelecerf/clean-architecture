"use client"
import { useState } from "react";
import { FiltersProps } from "@/utils/endpoint/feedsEndpoint";
import { PostFilters } from "@/components/feeds/PostFilters";
import { Posts } from "@/components/feeds/Posts";

export default function PostsPage() {
    const [filters, setFilters] = useState<FiltersProps>({
        title: undefined,
        fromDate: undefined,
        toDate: undefined,
        limit: 20,
        page: 1,
        status: true
    })
    return (
        <>
            <PostFilters filters={filters} onChange={(f) => setFilters(f)} />
            <Posts filters={filters} onPaginationChange={(pageNumber) => setFilters((prev) => ({ ...prev, page: pageNumber }))} />
        </>
    )

}
