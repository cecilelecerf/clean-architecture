import { MessageWithUserDTO } from "@infrastructure/types/thread";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { ReadByAvatars } from "./ReadByAvatars";

type Props = MessageWithUserDTO & {
    isCurrentUser: boolean;
    currentUserId?: string;
};

export const MessageComponent = ({
    content,
    sentAt,
    sender,
    isCurrentUser,
    readBy,
    readByUsers,
    currentUserId
}: Props) => {
    const isReadByOthers = readBy.length > 1;

    return (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
            <div className={`max-w-[70%] space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                {!isCurrentUser && (
                    <div className="flex items-center gap-2">
                        <Avatar
                        >
                            <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-xs">
                                {sender.firstname?.[0]}
                                {sender.lastname?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600 font-medium">
                            {sender.firstname} {sender.lastname}
                        </span>
                    </div>
                )}

                <div
                    className={`px-4 py-2 rounded-lg ${isCurrentUser
                        ? 'bg-blue-500 text-white rounded-tr-none'
                        : 'bg-gray-200 text-gray-900 rounded-tl-none'
                        }`}
                >
                    <p className="text-sm whitespace-pre-wrap wrap-break-word">{content}</p>
                </div>

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
                                <CheckCheck className="w-3 h-3 text-blue-500" />
                            ) : (
                                <Check className="w-3 h-3 text-gray-400" />
                            )}
                        </span>
                    )}

                    {currentUserId && readByUsers && readByUsers.length > 0 && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ReadByAvatars
                                readByUsers={readByUsers}
                                currentUserId={currentUserId}
                                maxDisplay={3}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};