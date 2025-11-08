"use client"
import { useSession } from "next-auth/react";
import { PostWithTagsAndUser } from "@/utils/endpoint/advisor/feedsEndpoint";
import { useRouter } from "next/navigation";
import { Tag } from "@/components/Tag";

type PostCardProps = {
    post: PostWithTagsAndUser;
};

export const PostCard = ({ post }: PostCardProps) => {
    const router = useRouter();

    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const isMine = session.user.id === post.advisor.id;

    return (
        <div
            onClick={() => router.push(`/admin/feeds/${post.id}`)
            }
            className="cursor-pointer border rounded-xl shadow hover:shadow-lg transition p-6 bg-white relative"
        >
            {/* Badge publié */}
            < div className="absolute top-4 right-4" >
                {
                    post.publishedAt ? (
                        <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                            Publié
                        </span>
                    ) : (
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs font-semibold">
                            Brouillon
                        </span>
                    )
                }
            </div >

            <h2 className="text-xl font-bold mb-2">{post.title}</h2>

            <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>

            <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                    <Tag tag={tag} key={tag.id} />
                ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                    Par {post.advisor.firstname} {post.advisor.lastname}
                </div>
                {isMine && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // empêche la navigation au clic
                            router.push(`/admin/feeds/${post.id}/edit`);
                        }}
                        className="text-blue-500 hover:underline"
                    >
                        Modifier
                    </button>
                )}
            </div>
        </div >
    );
};
