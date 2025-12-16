"use client"
import { endpoints } from "@/utils/endpoint"
import { PostWithTagsAndUser } from "@/utils/endpoint/feedsEndpoint"
import { useQuery } from "@tanstack/react-query"
import { match } from "ts-pattern"
import { PostCard } from "./PostCard"
import { PaginationPosts } from "./PaginationPosts"
import { useEffect, useState } from "react"
import { socket } from "@/lib/socket"
import { queryClient } from "@/lib/queryClient"
import { FiltersProps } from "@/utils/endpoint/feedsEndpoint"

export const Posts = ({ filters, onPaginationChange }: { filters: FiltersProps, onPaginationChange: (pageNumber: number) => void }) => {
    const query = useQuery(endpoints.feeds.posts.getAll({ filters }))
    useEffect(() => {
        if (!socket) return;
        const eventName = `post:status`;
        socket.on(eventName, () => queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === 'posts' && query.queryKey[1] === 'list',
        }))
        return () => {
            socket.off(eventName);
        };
    }, []);
    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with({ status: "success" }, ({ data }) => <>
            <div className="space-y-4">
                {data.posts.length === 0 ? (
                    <div className="text-gray-500">Aucun post trouvé</div>
                ) : (
                    data.posts.map((post) => (
                        <DisplayPost dataPost={post} key={post.id} />
                    ))
                )}
                <PaginationPosts onPaginationChange={onPaginationChange} totalPage={data.total} filters={filters} />
            </div>
        </>
        )

        .exhaustive()
}

const DisplayPost = ({ dataPost }: { dataPost: PostWithTagsAndUser }) => {
    const [post, setPost] = useState<PostWithTagsAndUser>(dataPost)

    useEffect(() => {
        if (!socket) return;
        const eventName = `post:${post.id}:update`;
        socket.on(eventName, (socketPost) => {
            console.log("💬 Nouveau post reçu:", post);
            setPost(socketPost);
        });
        return () => {
            socket.off(eventName);
        };
    }, []);

    return <PostCard post={post} key={post.id} />
}