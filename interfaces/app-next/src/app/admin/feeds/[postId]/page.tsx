import { PostId } from "@infrastructure/types/feed";
import { PostQuery } from "./PostQuery";
import { ButtonBack } from "@/components/buttons/ButtonBack";

export default async function PostIdPage({ params }: { params: Promise<{ postId: PostId }> }) {
    const { postId: post_id } = await params
    return (
        <>
            <ButtonBack />
            <PostQuery postId={post_id} />
        </>)

}
