"use client"
import { FiltersProps } from "@/utils/endpoint/client/feedsEndpoint"
import { useState } from "react";
import { Posts } from "./Posts";
import { PostFilters } from "./PostFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PostsPage() {
    const router = useRouter()
    const [filters, setFilters] = useState<FiltersProps>({
        title: undefined,
        fromDate: undefined,
        toDate: undefined,
        status: undefined,
        limit: 3,
        page: 1
    })
    return (
        <>
            <PostFilters filters={filters} onChange={(f) => setFilters(f)} />
            <Posts filters={filters} onPaginationChange={(pageNumber) => setFilters((prev) => ({ ...prev, page: pageNumber }))} />
            <Button
                className="fixed bottom-3 right-3 group flex items-center justify-center overflow-hidden w-12 h-12  transition-all duration-300 hover:w-auto gap-0"
                onClick={() => router.push("/admin/feeds/new")}
            >
                <Plus />
                <span className="opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
                    Ajouter
                </span>
            </Button>

        </>
    )

}
