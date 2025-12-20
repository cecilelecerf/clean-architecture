import { Flex } from "@radix-ui/themes";
import { Settings } from "./Settings";
import { MessageComponent } from "./Message";
import { ReactNode, useEffect, useRef, useState } from "react";
import { MessageWithUser } from "@infrastructure/types/message";
import { socket } from "@/lib/socket";
import { ThreadWithUser } from "@/utils/endpoint/threadEndpoints";
import { UserDto } from "@infrastructure/types/user";
import { match } from "ts-pattern";
import { PostMessage } from "./PostMessage";
import { JoinThread } from "@/app/admin/client-threads/[thread_id]/Join";
import { ButtonBack } from "../buttons/ButtonBack";
import { useSession } from "next-auth/react";

type Props = { thread: ThreadWithUser, defaultMessages: MessageWithUser[], userId: UserDto["id"], withSetting?: boolean, addElementInTop?: ReactNode }

export const WrapperThread = ({ thread, defaultMessages, userId, withSetting, addElementInTop }: Props) => {
    const { data: session } = useSession();

    const [messages, setMessages] = useState<MessageWithUser[]>(defaultMessages);
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