"use client"
import { Flex } from "@radix-ui/themes";
import { Settings } from "./settings";
import { MessageComponent } from "./Message";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { threadsEndpoint, ThreadWithUser } from "@/utils/endpoint/threadEndpoints";
import { UserDto, UserId } from "@infrastructure/types/user";
import { match } from "ts-pattern";
import { PostMessage } from "./PostMessage";
import { JoinThread } from "@/app/[locale]/admin/client-threads/[threadId]/Join";
import { ButtonBack } from "../buttons/ButtonBack";
import { useSession } from "next-auth/react";
import { Skeleton } from "../ui/skeleton";
import { MessageId, MessageWithUserDTO } from "@infrastructure/types/thread";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";

type Props = { thread: ThreadWithUser, defaultMessages: MessageWithUserDTO[], userId: UserDto["id"], withSetting?: boolean, addElementInTop?: ReactNode }

export const WrapperThread = ({ thread, defaultMessages, userId, withSetting, addElementInTop }: Props) => {
    const { data: session } = useSession();
    const t = useTranslations("thread");

    const [messages, setMessages] = useState<MessageWithUserDTO[]>(defaultMessages);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const markReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const hasMarkedRef = useRef(false);
    const readMessage = useMutation(threadsEndpoint.messages.read({ threadId: thread.id }));


    const markMessagesAsRead = useCallback(() => {
        if (readMessage.isPending || hasMarkedRef.current) {
            return;
        }

        console.log(`📖 Marking unread messages as read`);

        readMessage.mutate(undefined, {
            onSuccess: (data) => {
                console.log(`✅ Response:`, data);

                if (data.messageIds.length === 0) {
                    console.log('ℹ️ No messages to mark as read');
                    return;
                }

                console.log(`✅ ${data.messageIds.length} messages marked as read`);

                if (socket && data.messageIds && data.messageIds.length > 0) {
                    socket.emit("thread:messages_marked_read", {
                        threadId: thread.id,
                        messageIds: data.messageIds,
                        userId: userId,
                    });
                    console.log(`📡 Broadcasted ${data.messageIds.length} read messages via Socket.IO`);
                }

                // Mise à jour optimiste locale
                setMessages(prev => prev.map(msg => {
                    if (msg.senderId !== userId && !msg.readBy.includes(userId)) {
                        return {
                            ...msg,
                            readBy: [...msg.readBy, userId]
                        };
                    }
                    return msg;
                }));

                hasMarkedRef.current = false;
            },
            onError: (error) => {
                console.error("❌ Error marking messages as read:", error);
                hasMarkedRef.current = false;
            }
        });

        hasMarkedRef.current = true;
    }, [readMessage, userId, thread.id]);

    const handleScroll = useCallback(() => {
        // Debounce pour éviter trop d'appels
        if (markReadTimeoutRef.current) {
            clearTimeout(markReadTimeoutRef.current);
        }

        markReadTimeoutRef.current = setTimeout(() => {
            markMessagesAsRead();
        }, 1000); // Debounce de 1s
    }, [markMessagesAsRead]);

    const handleNewMessage = useCallback((msg: MessageWithUserDTO) => {
        console.log("💬 Nouveau message reçu:", msg);
        setMessages((prev) => [...prev, msg]);
    }, []);
    useEffect(() => {
        if (!socket) return;
        socket.emit("thread:join", { threadId: thread.id });
        const newMessageEvent = `thread:${thread.id}:new_message`;
        const messagesReadEvent = `thread:${thread.id}:messages_read`;


        socket.on(newMessageEvent, handleNewMessage);
        socket.on(messagesReadEvent, (data: { messageIds: MessageId[], userId: UserId }) => {
            console.log(`👁️ User ${data.userId} marked ${data.messageIds.length} messages as read`);

            setMessages((prev) => prev.map(msg => {
                if (data.messageIds.includes(msg.id) && !msg.readBy.includes(data.userId)) {
                    return {
                        ...msg,
                        readBy: [...msg.readBy, data.userId]
                    };
                }
                return msg;
            }));
        });

        return () => {
            socket.off(newMessageEvent);
            socket.off(messagesReadEvent);
        };
    }, [thread.id, handleNewMessage]);
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            if (markReadTimeoutRef.current) {
                clearTimeout(markReadTimeoutRef.current);
            }
        };
    }, [handleScroll]);
    return (
        <div className="h-full">
            <ButtonBack />
            <div className="flex flex-col">
                <Flex justify="between" align="center" className="border-b pb-2 mb-4">
                    <h2 className="font-bold text-lg">{thread.title}</h2>
                    <Flex gap="3" justify="end">
                        {addElementInTop}
                        {withSetting && (
                            <Settings {...thread} />
                        )}
                    </Flex>
                </Flex>

                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-scroll space-y-3 max-h-[60vh] sm:max-h-[67vh] md:max-h-[65vh] min-h-[60vh] sm:min-h-[67vh] md:min-h-[65vh]"
                >
                    {messages.map((msg) => (
                        <div key={msg.id} data-message-id={msg.id}>
                            <MessageComponent
                                {...msg}
                                isCurrentUser={msg.senderId === userId}
                            />
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {match({
                    haveAdministrator: !!thread.administratorId,
                    isClose: thread.isClose,
                    role: session.user.role
                })
                    .with({ isClose: true }, () =>
                        <p className='w-full bg-red-200 text-red-900 rounded-sm text-center p-2 font-bold'>{t("close")}</p>
                    )
                    .with({ haveAdministrator: false, role: "conseiller" }, () =>
                        <JoinThread threadId={thread.id} />
                    )
                    .otherwise(() => <PostMessage threadId={thread.id} />)
                }
            </div>
        </div>
    )
}

export const SkeletonThread = () => {
    return (
        <div className="h-full">
            <ButtonBack />
            <div className="flex flex-col">
                <Flex justify="between" align="center" className="border-b pb-2 mb-4">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-9 w-9 rounded-md" />
                </Flex>

                <div className="flex-1 overflow-y-scroll space-y-3 max-h-[60vh] sm:max-h-[67vh] md:max-h-[65vh] min-h-[60vh] sm:min-h-[67vh] md:min-h-[65vh]">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <SkeletonMessage key={index} isRight={index % 2 === 0} />
                    ))}
                </div>

                <div className="mt-4 flex gap-2">
                    <Skeleton className="h-10 flex-1 rounded-lg" />
                    <Skeleton className="h-10 w-20 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

const SkeletonMessage = ({ isRight }: { isRight: boolean }) => {
    return (
        <div className={`flex ${isRight ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] space-y-1 ${isRight ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isRight && <Skeleton className="h-3 w-20" />}
                <Skeleton
                    className={`h-16 w-full rounded-lg ${isRight ? 'rounded-tr-none' : 'rounded-tl-none'
                        }`}
                />
                <Skeleton className="h-2.5 w-16" />
            </div>
        </div>
    );
};