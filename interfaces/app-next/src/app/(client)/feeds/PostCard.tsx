"use client"
import { PostWithTagsAndUser } from "@/utils/endpoint/advisor/feedsEndpoint";
import { useRouter } from "next/navigation";
import { Tag } from "@/components/Tag";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

type PostCardProps = {
    post: PostWithTagsAndUser;
};

export const PostCard = ({ post }: PostCardProps) => {
    const router = useRouter();
    const { data: session } = useSession()
    const isRead = post.readBy.includes(session.user.id)
    return (
        <div
            onClick={() => router.push(`/feeds/${post.id}`)}
            className={`cursor-pointer rounded-xl shadow hover:shadow-lg transition p-6 relative flex justify-between`}
        >
            {!isRead && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-red-600 rounded-full"></span>
            )}

            <div className="w-full">
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
                <div className="flex flex-col md:flex-row justify-between gap-3">

                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <Tag tag={tag} key={tag.id} />
                        ))}
                    </div>
                    {!isRead && (
                        <Button variant="outline" size="sm" className="w-fit text-xs"
                            onClick={() => { }}
                        >
                            Marquer comme lu
                            <Check />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
