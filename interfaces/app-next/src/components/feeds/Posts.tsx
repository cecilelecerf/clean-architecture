"use client"
import { endpoints } from "@/utils/endpoint"
import { PostFilters, PostWithTagsAndUser } from "@/utils/endpoint/feedsEndpoint"
import { useQuery } from "@tanstack/react-query"
import { match } from "ts-pattern"
import { PostCard } from "./PostCard"
import { PaginationComponent } from "../PaginationComponent"
import { useEffect, useState } from "react"
import { socket } from "@/lib/socket"
import { queryClient } from "@/lib/queryClient"
import { SkeletonPost } from "@/app/(client)/feeds/[postId]/PostQuery"

type Props = { filters: PostFilters, onPaginationChange: (pageNumber: number) => void, isAdmin?: boolean }

export const Posts = ({ filters, onPaginationChange, isAdmin }: Props) => {
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
        .with({ status: "pending" }, () => new Array(6).map((i) => <SkeletonPost key={i} />))
        .with({ status: "success" }, ({ data }) => <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {data.posts.length === 0 ? (
                    <div className="text-gray-500">Aucun post trouvé</div>
                ) : (
                    data.posts.map((post) => (
                        <DisplayPost dataPost={post} key={post.id} isAdmin={isAdmin} />
                    ))
                )}
                <PaginationComponent onPaginationChange={onPaginationChange} totalPage={data.total} filters={{ ...filters }} />
            </div>
        </>
        )

        .exhaustive()
}

const DisplayPost = ({ dataPost, isAdmin }: { dataPost: PostWithTagsAndUser, isAdmin?: boolean }) => {
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
    useEffect(() => {
        setPost(dataPost)
    }, [dataPost])

    return <PostCard post={post} key={post.id} isAdmin={isAdmin} />
}