"use client"
import { FiltersProps } from "@/utils/endpoint/client/feedsEndpoint"
import { useState } from "react";
import { Posts } from "./Posts";
import { PostFilters } from "./PostFilters";

export default function PostsPage() {
    const [filters, setFilters] = useState<FiltersProps>({
        title: undefined,
        fromDate: undefined,
        toDate: undefined,
        limit: 3,
        page: 1
    })
    return (
        <>
            <PostFilters filters={filters} onChange={(f) => setFilters(f)} />
            <Posts filters={filters} onPaginationChange={(pageNumber) => setFilters((prev) => ({ ...prev, page: pageNumber }))} />
        </>
    )

}
