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
import { Skeleton } from "../ui/skeleton"
import { useTranslations } from "next-intl"

type Props = { filters: PostFilters, onPaginationChange: (pageNumber: number) => void, isAdmin?: boolean, basePath: string }

export const Posts = ({ filters, onPaginationChange, isAdmin, basePath }: Props) => {
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
    const t = useTranslations("advisor.feeds.post");
    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => new Array(6).map((i) => <SkeletonPost key={i} />))
        .with({ status: "success" }, ({ data }) => <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {data.posts.length === 0 ? (
                    <div className="text-gray-500">{t("none")}</div>
                ) : (
                    data.posts.map((post) => (
                        <DisplayPost dataPost={post} key={post.id} isAdmin={isAdmin} basePath={basePath} />
                    ))
                )}
            </div>
            {data.posts.length !== 0 && <PaginationComponent onPaginationChange={onPaginationChange} totalPage={data.total} filters={{ ...filters }} />}
        </>
        )
        .exhaustive()
}

const DisplayPost = ({ dataPost, isAdmin, basePath }: { dataPost: PostWithTagsAndUser, isAdmin?: boolean, basePath: string }) => {
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
    }, [post]);
    useEffect(() => {
        setPost(dataPost)
    }, [dataPost])

    return <PostCard post={post} key={post.id} isAdmin={isAdmin} basePath={basePath} />
}


export const SkeletonPost = () => {
    return (
        <>
            <div className="flex justify-between items-center gap-3">
                <Skeleton className="h-8 w-3/4 max-w-lg" />
            </div>
            <div className="space-y-6 mt-4">
                <div className="space-y-2">
                    {/* Tags skeleton */}
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-6 w-16 rounded-full"
                            />
                        ))}
                    </div>
                    {/* Date skeleton */}
                    <Skeleton className="h-4 w-40" />
                </div>
                {/* Content skeleton */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </>
    )
}