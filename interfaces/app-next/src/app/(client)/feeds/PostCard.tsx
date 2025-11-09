"use client"
import { PostWithTagsAndUser } from "@/utils/endpoint/advisor/feedsEndpoint";
import { useRouter } from "next/navigation";
import { Tag } from "@/components/Tag";

type PostCardProps = {
    post: PostWithTagsAndUser;
};

export const PostCard = ({ post }: PostCardProps) => {
    const router = useRouter();
    return (
        <div
            onClick={() => router.push(`/feeds/${post.id}`)
            }
            className="cursor-pointer border rounded-xl shadow hover:shadow-lg transition p-6 bg-white relative flex justify-between"
        >
            <div>
                <h2 className="text-xl font-bold">{post.title}</h2>
                <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                        <Tag tag={tag} key={tag.id} />
                    ))}
                </div>
            </div>
        </div >
    );
};
