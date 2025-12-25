import { Flex } from "@radix-ui/themes";
import { Settings } from "./Settings";
import { MessageComponent } from "./Message";
import { ReactNode, useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { ThreadWithUser } from "@/utils/endpoint/threadEndpoints";
import { UserDto } from "@infrastructure/types/user";
import { match } from "ts-pattern";
import { PostMessage } from "./PostMessage";
import { JoinThread } from "@/app/admin/client-threads/[threadIdd]/Join";
import { ButtonBack } from "../buttons/ButtonBack";
import { useSession } from "next-auth/react";
import { MessageWithUserDTO } from "@infrastructure/types/message";
import { Skeleton } from "../ui/skeleton";

type Props = { thread: ThreadWithUser, defaultMessages: MessageWithUserDTO[], userId: UserDto["id"], withSetting?: boolean, addElementInTop?: ReactNode }

export const WrapperThread = ({ thread, defaultMessages, userId, withSetting, addElementInTop }: Props) => {
    const { data: session } = useSession();

    const [messages, setMessages] = useState<MessageWithUserDTO[]>(defaultMessages);
    const bottomRef = useRef<HTMLDivElement | null>(null);
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

                {/* Messages */}
                <div className="flex-1 overflow-y-scroll space-y-3 max-h-[60vh] sm:max-h-[67vh] md:max-h-[65vh] min-h-[60vh] sm:min-h-[67vh] md:min-h-[65vh] ">
                    {messages.map((msg) => (<MessageComponent key={msg.id} {...msg} isCurrentUser={msg.senderId === userId} />))}
                    <div ref={bottomRef} />
                </div>
                {match({
                    haveAdministrator: !!thread.administratorId,
                    isClose: thread.isClose,
                    role: session.user.role
                })
                    .with({ isClose: true }, () =>
                        <p className='w-full bg-red-200 text-red-900 rounded-sm text-center p-2 font-bold'>Discussion fermée</p>
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

                {/* Messages skeleton */}
                <div className="flex-1 overflow-y-scroll space-y-3 max-h-[60vh] sm:max-h-[67vh] md:max-h-[65vh] min-h-[60vh] sm:min-h-[67vh] md:min-h-[65vh]">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <SkeletonMessage key={index} isRight={index % 2 === 0} />
                    ))}
                </div>

                {/* Input skeleton */}
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