import { ThreadCard } from "./ThreadCard"
import { ThreadWithUser } from "@/utils/endpoint/threadEndpoints";

type ThreadsListProps = {
    threads: ThreadWithUser[];
    onThreadClick: (threadId: string) => void;
};

export const ThreadsList = ({
    threads,
    onThreadClick
}: ThreadsListProps) => (<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    {threads.map((thread) => (
        <ThreadCard
            thread={thread}
            key={thread.id}
            onClick={() => onThreadClick(thread.id)}
        />
    ))}
</div>)