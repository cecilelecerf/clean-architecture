import { ThreadId } from "@infrastructure/types/thread";
import ThreadPageClient from "./threadPageClient";

export default async function ThreadPageServer({ params }: { params: Promise<{ threadId: ThreadId }> }) {
    const { threadId } = await params
    if (!threadId) return
    return <ThreadPageClient threadId={threadId} />;
}
