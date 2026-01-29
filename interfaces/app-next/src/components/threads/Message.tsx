import { MessageWithUserDTO } from "@infrastructure/types/thread";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCheckIcon, CheckIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { UserDto } from "@infrastructure/types/user";

type Props = MessageWithUserDTO & {
    isCurrentUser: boolean;
    prevMessage?: MessageWithUserDTO
    nextMessage?: MessageWithUserDTO,
    lastReadByUsers?: UserDto[]
};

export const MessageComponent = ({
    content,
    sentAt,
    sender,
    isCurrentUser,
    readBy,
    readByUsers,
    prevMessage,
    nextMessage,
    lastReadByUsers
}: Props) => {
    const isReadByOthers = readBy.length > 1;
    return (
        <>
            <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group ${prevMessage && prevMessage.senderId === sender.id ? "" : "mt-7"}`}>
                <div className={`max-w-[70%] space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                        className={`px-4 py-2 rounded-lg ${isCurrentUser
                            ? 'bg-blue-500 text-white rounded-tr-none'
                            : 'bg-gray-200 text-gray-900 rounded-tl-none'
                            }`}
                    >
                        {!isCurrentUser && prevMessage && prevMessage.sender.id !== sender.id && <p className="text-xs text-gray-500"> {sender.firstname} {sender.lastname}</p>}
                        <p className="text-sm whitespace-pre-wrap wrap-break-word">{content}</p>
                    </div>


                    {nextMessage && nextMessage.senderId !== sender.id && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(sentAt), {
                                    addSuffix: true,
                                    locale: fr,
                                })}
                            </span>

                            {isCurrentUser && (
                                <span className="text-xs flex items-center gap-1">
                                    {isReadByOthers ? (
                                        <CheckCheckIcon className="w-3 h-3 text-blue-500" />
                                    ) : (
                                        <CheckIcon className="w-3 h-3 text-gray-400" />
                                    )}
                                </span>
                            )}
                        </div>
                    )}

                </div>
            </div>
            {lastReadByUsers && lastReadByUsers.length > 0 && (
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mt-1 mb-2`}>
                    <div className="flex items-center -space-x-2 px-1">
                        {lastReadByUsers.map((reader, index) => (
                            <Avatar
                                key={reader.id}
                                className="w-5 h-5 ring-2 ring-white"
                                style={{ zIndex: lastReadByUsers.length - index }}
                            >
                                <AvatarFallback className="bg-gray-900 text-white text-[10px]">
                                    {reader.firstname[0]}
                                    {reader.lastname[0]}
                                </AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};