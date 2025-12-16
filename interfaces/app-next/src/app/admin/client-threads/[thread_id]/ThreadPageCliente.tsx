'use client';

import { useSession } from 'next-auth/react';
import { ThreadId } from '@infrastructure/types/thread';
import { useQueries } from '@tanstack/react-query';
import { match } from 'ts-pattern';
import { useEffect, useRef, useState } from 'react';
import { socket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { UserDto } from '@infrastructure/types/user';
import { MessageWithUser } from '@infrastructure/types/message';
 import { useRouter } from 'next/navigation';
import { MessageComponent } from '@/components/threads/Message';
 import { Flex } from '@radix-ui/themes';
import { JoinThread } from './Join';
import { Settings } from './Settings';
import { PostMessage } from '@/components/threads/PostMessage';
import { endpoints } from '@/utils/endpoint';
import { ThreadWithUser } from '@/utils/endpoint/threadEndpoints';


export default function ThreadPageClient({ threadId }: { threadId: ThreadId }) {
    const queries = useQueries({
        queries: [
            endpoints.threads.get({  threadId }),
            endpoints.threads.messages.getAll({ threadId })
        ]
    })

    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    return match(queries)
        .when((q) => q.some(({ status }) => status === "error"), () => "error")
        .with([{ status: "success" }, { status: "success" }], ([{ data: thread }, { data: messages }]) =>
            <Display thread={thread} messages={messages} userId={session.user.id as UserDto["id"]} />
        )
        .otherwise(() => "pending")
}


const Display = ({ thread, userId, messages: messagesData }: { thread: ThreadWithUser, messages: MessageWithUser[], userId: UserDto["id"] }) => {
    const [messages, setMessages] = useState<MessageWithUser[]>(messagesData);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter()

    useEffect(() => {
        if (!socket) return;
        socket.emit("thread:join", { threadId: thread.id });
        const eventName = `thread:${thread.id}:new_message`;

        // Quand un message arrive du serveur
        socket.on(eventName, (msg) => {
            console.log("💬 Nouveau message reçu:", msg);
            setMessages((prev) => [...prev, msg]);
        });

        // Nettoyage
        return () => {
            socket.off(eventName);
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return <div className="flex flex-col">
        {/* Header */}
        <Flex justify="between" align="center" className="border-b pb-2 mb-4">
            <h2 className="font-bold text-lg">{thread.title}</h2>
            <Flex gap="3">
                <span className="text-sm text-gray-500">
                    Client:
                    <Button className='ml-2' variant='outline' onClick={() => router.push(`/admin/users/${thread.participants[0].id}`)}>{thread.participants[0].firstname}{" "}
                        {thread.participants[0].lastname}</Button>
                </span>
                {!!thread.isClose && (
                    <Settings {...thread} />
                )}
            </Flex>
        </Flex>

        {/* Messages */}
        <div className="flex-1 overflow-y-scroll space-y-3 min-h-[60vh] sm:min-h-[70vh] xl:min-h-[70vh] max-h-[60vh] sm:max-h-[75vh] xl:max-h-[72vh]">
            {messages.map((msg) => (<MessageComponent key={msg.id} {...msg} isCurrentUser={msg.senderId === userId} />))}
            <div ref={bottomRef} />
        </div>
        {/* Input */}
        {match({ haveAdministrator: !!thread.administratorId, isClose: thread.isClose })
            .with({ isClose: true }, () =>
                <p className='w-full bg-red-200 text-red-900 rounded-sm text-center p-2 font-bold'>Discussion fermée</p>)
            .with({ haveAdministrator: true }, () =>
                <PostMessage threadId={thread.id} />
            )
            .with({ haveAdministrator: false }, () =>
                <JoinThread threadId={thread.id} />
            )
            .exhaustive()
        }

    </div>
}