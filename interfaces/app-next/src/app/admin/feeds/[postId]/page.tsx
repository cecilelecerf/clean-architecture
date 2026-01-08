import { PostId } from "@infrastructure/types/feed";
import { PostQuery } from "./PostQuery";
import { ButtonBack } from "@/components/buttons/ButtonBack";
import { use } from "react";

export default function PostIdPage({ params }: { params: Promise<{ postId: PostId }> }) {
    const { postId: post_id } = use(params)
    return (
        <>
            <ButtonBack />
            <PostQuery postId={post_id} />
        </>)

}
