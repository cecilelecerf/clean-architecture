import { ThreadId } from "@infrastructure/types/thread";
import ThreadPageClient from "./threadPageClient";
import { ButtonBack } from "@/components/ButtonBack";

export default async function ThreadPageServer({ params }: { params: Promise<{ threadId: ThreadId }> }) {
    const { threadId } = await params
    if (!threadId) return
    return <>
        <ButtonBack />
        <ThreadPageClient threadId={threadId} />
        k</>;
}
