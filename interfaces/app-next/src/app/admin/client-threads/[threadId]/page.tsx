import { ThreadId } from "@infrastructure/types/thread";
import ThreadPageClient from "./ThreadPageCliente";
import { use } from "react";

export default function ThreadPageServer({ params }: { params: Promise<{ threadId: ThreadId }> }) {
    const { threadId } = use(params)
    return <ThreadPageClient threadId={threadId} />

}
