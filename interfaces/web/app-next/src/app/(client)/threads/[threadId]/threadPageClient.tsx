'use client';

import { useSession } from 'next-auth/react';
import { ThreadId } from '@infrastructure/types/thread';
import { formatDateFrench } from '@/utils/date/formatDateFrench';
import { useQuery } from '@tanstack/react-query';
import { match } from 'ts-pattern';
import { clientEndpoints } from '@/utils/clientEndpoint';

export default function ThreadPageClient({ threadId }: { threadId: ThreadId }) {
    const query = useQuery(clientEndpoints.threads.get({ id: threadId }))
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with({ status: "success" }, ({ data: thread }) =>
            <div className="flex flex-col h-full ">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="font-bold text-lg">{thread.title}</h2>
                    <span className="text-sm text-gray-500">
                        Administrateur: {thread.administrator.firstname}
                        {thread.administrator.lastname}
                    </span>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {thread.messages.map((msg) => {
                        const isCurrentUser = msg.senderId === session.user.id;
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
                </div>

                {/* Input */}
                <div className="border-t pt-2">
                    <input
                        type="text"
                        placeholder="Écrire un message..."
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    />
                </div>
            </div>)
        .exhaustive()
}
