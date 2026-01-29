"use client"
import { useState } from "react";
import { PostFilters } from "@/components/feeds/PostFilters";
import { Posts } from "@/components/feeds/Posts";
import { PostFilters as TPostFilters } from "@/utils/endpoint/feedsEndpoint";
 
export default function PostsPage() {
    const [filters, setFilters] = useState<TPostFilters>({
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
            <Posts filters={filters} onPaginationChange={(pageNumber) => setFilters((prev) => ({ ...prev, page: pageNumber }))} basePath="" />
        </>
    )

}
