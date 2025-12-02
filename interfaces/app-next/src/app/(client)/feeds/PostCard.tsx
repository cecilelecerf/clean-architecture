"use client"
import { PostWithTagsAndUser } from "@/utils/endpoint/advisor/feedsEndpoint";
import { useRouter } from "next/navigation";
import { Tag } from "@/components/Tag";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { useSession } from "next-auth/react";
import { Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { clientEndpoints } from "@/utils/endpoint/client";
import { ButtonLoading } from "@/components/ButtonLoading";

type PostCardProps = {
    post: PostWithTagsAndUser;
};

export const PostCard = ({ post }: PostCardProps) => {
    const router = useRouter();
    const { data: session } = useSession()
    const markAsReadMutation = useMutation(clientEndpoints.feeds.posts.markAsRead())

    const isRead = post.readBy.includes(session.user.id)
    return (
        <div
            onClick={() => { router.push(`/feeds/${post.id}`); markAsReadMutation.mutate({ postId: post.id }) }}
            className={`cursor-pointer rounded-xl shadow hover:shadow-lg transition p-6 relative flex justify-between`}
        >
            {!isRead && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-red-600 rounded-full"></span>
            )}

            <div className="w-full flex flex-col justify-between">
                <div className="flex justify-between gap-2 mb-3 w-full">
                    <h2
                        className={"text-xl font-bold"}
                    >
                        {post.title}
                    </h2>
                    <p className="text-sm text-gray-700">
                        {formatDateFrench(post.publishedAt)}
                    </p>
                </div>
                <div className="flex flex-col md:flex-row justify-between gap-3 md:items-end">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <Tag tag={tag} key={tag.id} />
                        ))}
                    </div>
                    {!isRead && (
                        <ButtonLoading variant="ghost" loading={markAsReadMutation.isPending} className="w-fit text-xs"
                            onClick={(e) => { e.stopPropagation(); markAsReadMutation.mutate({ postId: post.id }) }}
                        >
                            Marquer comme lu
                            <Check />
                        </ButtonLoading>
                    )}
                </div>
            </div>
        </div>
    );
};
