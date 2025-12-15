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
import { advisorEndpoint } from '@/utils/endpoint/advisor';
import { useRouter } from 'next/navigation';
import { MessageComponent } from '@/components/threads/Message';
import { ThreadWithUser } from '@/utils/endpoint/client/threadEndpoints';
import { Flex } from '@radix-ui/themes';
import { PostMessage } from '@/components/threads/PostMessage';
import { Settings } from './Settings';


export default function ThreadPageClient({ threadId }: { threadId: ThreadId }) {
    const queries = useQueries({
        queries: [
            advisorEndpoint.thread.client.get({ id: threadId }),
            advisorEndpoint.thread.messages.getAll({ id: threadId })
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
            <Settings {...thread} />
        </Flex>

        {/* Messages */}
        <div className="flex-1 overflow-y-scroll space-y-3 min-h-[60vh] sm:min-h-[70vh] xl:min-h-[70vh] max-h-[60vh] sm:max-h-[75vh] xl:max-h-[72vh]">
            {messages.map((msg) => (<MessageComponent key={msg.id} {...msg} isCurrentUser={msg.senderId === userId} />))}
            <div ref={bottomRef} />
        </div>
        {/* Input */}
        {match({ isClose: thread.isClose })
            .with({ isClose: true }, () =>
                <p className='w-full bg-red-200 text-red-900 rounded-sm text-center p-2 font-bold'>Discussion fermée</p>)
            .otherwise(() => <PostMessage threadId={thread.id} />)
        }

    </div>
}