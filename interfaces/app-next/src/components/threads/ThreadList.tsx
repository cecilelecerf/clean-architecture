import { memo } from "react";
import { ThreadCard } from "./ThreadCard"
import { ThreadWithUser } from "@/utils/endpoint/threadEndpoints";

type ThreadsListProps = {
    threads: ThreadWithUser[];
    onThreadClick: (threadId: string) => void;
};

export const ThreadsList = memo(function ThreadsList({
    threads,
    onThreadClick
}: ThreadsListProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {threads.map((thread) => (
                <ThreadCard
                    thread={thread}
                    key={thread.id}
                    onClick={() => onThreadClick(thread.id)}
                />
            ))}
        </div>
    );
});
