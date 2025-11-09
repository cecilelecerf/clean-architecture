'use client';

import { useSession } from 'next-auth/react';
import { ThreadId } from '@infrastructure/types/thread';
import { formatDateFrench } from '@/utils/date/formatDateFrench';
import { useMutation, useQuery } from '@tanstack/react-query';
import { match } from 'ts-pattern';
import { useEffect, useRef, useState } from 'react';
import { socket } from '@/lib/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserDto } from '@infrastructure/types/user';
import { Message } from '@infrastructure/types/message';
import { post } from '@/lib/apiClient';
import { NewMessage } from '@/app/api/client/threads/[thread_id]/messages/new/route';
import { Spinner } from '@/components/ui/spinner';
import { ArrowRight } from 'lucide-react';
import { clientEndpoints, GetMessage } from '@/utils/endpoint/client';


export default function ThreadPageClient({ threadId }: { threadId: ThreadId }) {
    const query = useQuery(clientEndpoints.threads.get({ id: threadId }))

    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with({ status: "success" }, ({ data: thread }) =>
            <Display thread={thread} userId={session.user.id as UserDto["id"]} />
        )
        .exhaustive()
}


const Display = ({ thread, userId }: { thread: GetMessage, userId: UserDto["id"] }) => {
    const [messages, setMessages] = useState<Message[]>(thread.messages);
    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const mutate = useMutation({
        mutationFn: (content: string) => post<Message, NewMessage>(`/threads/${thread.id}/messages/new`, { content }, "client"),
        onSuccess: (data) => {
            socket.emit("thread:new_message", { message: data });
            setInput("")
        }
    })
    useEffect(() => {
        if (!socket) return;
        socket.emit("thread:join", { threadId: thread.id });

        const eventName = `thread:${thread.id}:new_message`;

        socket.on(eventName, (msg) => {
            console.log("💬 Nouveau message reçu:", msg);
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            socket.off(eventName);
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return <div className="flex flex-col h-full ">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="font-bold text-lg">{thread.title}</h2>
            <span className="text-sm text-gray-500">
                Administrateur: {thread.administrator.firstname}
                {thread.administrator.lastname}
            </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-scroll space-y-3 max-h-[65vh] sm:max-h-[75vh] xl:max-h-[72vh]">
            {messages.map((msg) => {
                const isCurrentUser = msg.senderId === userId;
                const sender =
                    msg.senderId === thread.administrator.id
                        ? thread.administrator
                        : thread.participants.find((p) => p.id === msg.senderId);

                return (
                    <div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                                }`}
                        >
                            <div className="text-sm font-semibold">
                                {sender?.firstname} {sender?.lastname}
                            </div>
                            <div className="mt-1">{msg.content}</div>
                            <div className={`text-xs mt-1 text-right ${isCurrentUser ? "  text-blue-100" : "text-gray-400"
                                }`}>
                                {formatDateFrench(msg.sentAt)}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />

        </div>

        {/* Input */}
        <div className="flex gap-3 mt-4">
            <Input
                type="text"
                value={input}
                placeholder="Écrire un message..."
                onChange={(e) => setInput(e.target.value)}
            />
            <Button onClick={() => input.length && mutate.mutate(input)} disabled={mutate.isPending} >{mutate.isPending && <Spinner />} <ArrowRight /></Button>
        </div>
    </div>
}