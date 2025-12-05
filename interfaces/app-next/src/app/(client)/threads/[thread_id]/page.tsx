import { ThreadId } from "@infrastructure/types/thread";
import { ButtonBack } from "@/components/ButtonBack";
import ThreadPageClient from "./threadPageClient";

export default async function ThreadPageServer({ params }: { params: Promise<{ thread_id: ThreadId }> }) {
    const { thread_id } = await params
    if (!thread_id) return
    return <>
        <ButtonBack />
        <ThreadPageClient threadId={thread_id} />
    </>;
}
