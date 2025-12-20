import { ThreadId } from "@infrastructure/types/thread";
import ThreadPageClient from "./ThreadPageCliente";

export default async function ThreadPageServer({ params }: { params: Promise<{ thread_id: ThreadId }> }) {
    const { thread_id } = await params
    if (!thread_id) return "error"
    return <ThreadPageClient threadId={thread_id} />
}
