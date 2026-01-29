import { UserId } from "@infrastructure/types/user";
import { ThreadCard } from "./ThreadCard"
import { ThreadWithUserAndLastMsg } from "@/utils/endpoint/threadEndpoints";
import { useCallback, useEffect } from "react";
import { MessageId, MessageWithUserDTO } from "@infrastructure/types/thread";
import { queryClient } from "@/lib/queryClient";
import { socket } from "@/lib/socket";

type ThreadsListProps = {
    threads: ThreadWithUserAndLastMsg[];
    onThreadClick: (threadId: string) => void;
    userId: UserId
};

export const ThreadsList = ({
    threads,
    onThreadClick,
    userId
}: ThreadsListProps) => {
    const updateThreadInCache = useCallback((threadId: string, newMessage: MessageWithUserDTO) => {
        queryClient.invalidateQueries({ queryKey: ['threads', threadId] })
        queryClient.setQueryData(
            ['threads', "list", threads[0].type],
            (oldData: any) => {
                if (!oldData) return oldData;

                return oldData.map((thread: ThreadWithUserAndLastMsg) => {
                    if (thread.id === threadId) {
                        return {
                            ...thread,
                            lastMessage: newMessage,
                        };
                    }
                    return thread;
                });
            }
        );
    }, [queryClient]);


    useEffect(() => {
        const listeners: Array<() => void> = [];

        threads.forEach((thread) => {
            socket.emit("thread:join", { threadId: thread.id });

            const eventName = `thread:${thread.id}:new_message`;

            const handlerNewMessage = (message: MessageWithUserDTO) => {
                updateThreadInCache(thread.id, message);

            };

            socket.on(eventName, handlerNewMessage);

            listeners.push(() => socket.off(eventName, handlerNewMessage));
        });

        return () => {
            listeners.forEach(cleanup => cleanup());
        };

    }, [threads]);
    if (threads.length === 0) return <>Pas de conversation</>
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {threads.map((thread) => (
                <ThreadCard
                    thread={thread}
                    key={thread.id}
                    onClick={() => onThreadClick(thread.id)}
                    userId={userId}
                />
            ))}
        </div>
    )
}