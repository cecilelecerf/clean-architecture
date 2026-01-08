"use client"
import { Tag } from "@/components/Tag";
import { socket } from "@/lib/socket";
import { PostWithTagsAndUser } from "@/utils/endpoint/feedsEndpoint";
import { endpoints } from "@/utils/endpoint";
import { PostId } from "@infrastructure/types/feed";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { match } from "ts-pattern";
import { Skeleton } from "@/components/ui/skeleton";

type Props = { postId: PostId }

export const PostQuery = ({ postId }: Props) => {

    const query = useQuery(endpoints.feeds.posts.get({ id: postId }));
    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => <SkeletonPost />)
        .with({ status: "success" }, ({ data: post }) => (
            <PostDisplay postData={post} />)
        ).exhaustive()

}

const PostDisplay = ({ postData }: { postData: PostWithTagsAndUser }) => {
    const [post, setPost] = useState<PostWithTagsAndUser>(postData)
    useEffect(() => {
        if (!socket) return;

        const eventName = `post:${post.id}:update`;

        socket.on(eventName, (socketPost: PostWithTagsAndUser) => {
            console.log("💬 Post mis à jour:", socketPost);
            setPost(socketPost);
        });

        return () => {
            socket.off(eventName);
        };
    }, []);

    return (
        <>
            <div className="flex justify-between items-center gap-3">
                <h1 className="text-2xl font-bold">{post.title}</h1>
            </div>
            <div className="space-y-6 mt-4">
                <div className="space-y-2">
                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <Tag tag={tag} key={tag.id} />
                            ))}
                        </div>
                    )}
                    <p className="text-sm text-gray-500">
                        Publié le {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                </div>
                <p>
                    {post.content}
                </p>
            </div>
        </>)
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