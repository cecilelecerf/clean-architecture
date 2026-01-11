"use client"
import { useSession } from "next-auth/react";
import { PostWithTagsAndUser } from "@/utils/endpoint/feedsEndpoint";
import { useRouter } from "next/navigation";
import { Tag } from "@/components/Tag";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

type PostCardProps = {
    post: PostWithTagsAndUser;
    isAdmin?: boolean,
    basePath: string
};

export const PostCard = ({ post, isAdmin, basePath }: PostCardProps) => {
    const router = useRouter();
    const t = useTranslations("advisor.feeds");

    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const isMine = session.user.id === post.advisor.id;

    return (
        <div
            onClick={() => router.push(`${basePath}/feeds/${post.id}`)
            }
            className="cursor-pointer border rounded-xl shadow hover:shadow-lg transition p-6 relative flex justify-between"
        >
            <div>

                <div className="flex flex-col sm:flex-row justify-between gap-1 mb-3">
                    <h2 className="text-xl font-bold">{post.title}
                        {isAdmin && (
                            <Badge variant={post.publishedAt ? "secondary" : "outline"} className="h-fit ml-2">
                                {post.publishedAt ? t("filters.publish") : t("filters.unpublish")}
                            </Badge>
                        )}
                    </h2>
                </div>

                <p className="text-gray-700 dark:text-gray-200 mb-4 line-clamp-3">{post.content}</p>

                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                        <Tag tag={tag} key={tag.id} />
                    ))}
                </div>
            </div>
            {isMine && (
                <p
                    className="text-blue-500 hover:underline text-sm"
                >
                    {t("update")}
                </p>
            )}
        </div >
    );
};
