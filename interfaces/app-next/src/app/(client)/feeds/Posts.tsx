"use client"
import { PostWithTagsAndUser } from "@/utils/endpoint/advisor/feedsEndpoint"
import { useQuery } from "@tanstack/react-query"
import { match } from "ts-pattern"
import { PostCard } from "./PostCard"
import { PaginationPosts } from "./PaginationPosts"
import { useEffect, useState } from "react"
import { socket } from "@/lib/socket"
import { queryClient } from "@/lib/queryClient"
import { FiltersProps } from "@/utils/endpoint/client/feedsEndpoint"
import { clientEndpoints } from "@/utils/endpoint/client"

export const Posts = ({ filters, onPaginationChange }: { filters: FiltersProps, onPaginationChange: (pageNumber: number) => void }) => {
    const query = useQuery(clientEndpoints.feeds.posts.getAll({ filters }))
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
    useEffect(() => {
        for (const query of queryClient.getQueryCache().getAll()) {
            console.log("QUERY KEY:", query.queryKey);
        }
    }, []);
    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with({ status: "success" }, ({ data }) => <>
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-10">
                    {data.posts.length === 0 ? (
                        <div className="text-gray-500">Aucun post trouvé</div>
                    ) : (
                        data.posts.map((post) => (
                            <DisplayPost dataPost={post} key={post.id} />
                        ))
                    )}
                </div>
                <PaginationPosts onPaginationChange={onPaginationChange} totalPage={data.total} filters={filters} />
            </>
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
    useEffect(() => { setPost(dataPost) }, [dataPost])

    return <PostCard post={post} key={post.id} />
}