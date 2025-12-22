"use client"
import { Tag } from "@/components/Tag";
import { socket } from "@/lib/socket";
import { PostWithTagsAndUser } from "@/utils/endpoint/feedsEndpoint";
import { endpoints } from "@/utils/endpoint";
import { PostId } from "@infrastructure/types/feed";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { match } from "ts-pattern";

type Props = { postId: PostId }

export const PostQuery = ({ postId }: Props) => {

    const query = useQuery(endpoints.feeds.posts.get({ id: postId }));
    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
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