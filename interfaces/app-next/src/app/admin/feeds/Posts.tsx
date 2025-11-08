"use client"
import { advisorEndpoint } from "@/utils/endpoint/advisor"
import { FiltersProps } from "@/utils/endpoint/advisor/feedsEndpoint"
import { useQuery } from "@tanstack/react-query"
import { match } from "ts-pattern"
import { PostCard } from "./PostCard"

export const Posts = ({ filters }: { filters: FiltersProps }) => {
    const query = useQuery(advisorEndpoint.feeds.posts.getAll({ filters }))

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with({ status: "success" }, ({ data }) => <div className="space-y-4">
            {data.posts.length === 0 ? (
                <div className="text-gray-500">Aucun post trouvé</div>
            ) : (
                data.posts.map((post) => (
                    <PostCard post={post} key={post.id} />
                ))
            )}
        </div>)
        .exhaustive()
}