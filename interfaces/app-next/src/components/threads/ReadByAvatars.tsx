import { MessageWithUserDTO } from "@infrastructure/types/thread";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface ReadByAvatarsProps {
    readByUsers: MessageWithUserDTO["readByUsers"];
    currentUserId: string;
    maxDisplay?: number;
}

export const ReadByAvatars = ({
    readByUsers = [],
    currentUserId,
    maxDisplay = 3
}: ReadByAvatarsProps) => {
    const otherReaders = readByUsers.filter((reader) => reader.user.id !== currentUserId);

    if (otherReaders.length === 0) return null;

    const sortedReaders = [...otherReaders].sort(
        (a, b) => new Date(b.readAt).getTime() - new Date(a.readAt).getTime()
    );

    const displayedReaders = sortedReaders.slice(0, maxDisplay);
    const remainingCount = sortedReaders.length - maxDisplay;

    return (
        <div className="flex items-center gap-0.5 -space-x-2">
            {displayedReaders.map((reader, index) => (
                <div
                    key={reader.user.id}
                    className="relative ring-2 ring-white rounded-full"
                    style={{ zIndex: displayedReaders.length - index }}
                >

                    <Avatar
                    >
                        <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-xs">
                            {reader.user.firstname[0]}
                            {reader.user.lastname[0]}
                        </AvatarFallback>
                    </Avatar>
                </div>
            ))}

            {remainingCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-semibold text-gray-700 ring-2 ring-white">
                    +{remainingCount}
                </div>
            )}
        </div>
    );
};