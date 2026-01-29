import { ThreadWithUserAndLastMsg } from "@/utils/endpoint/threadEndpoints";
import { Card } from "../ui/card";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { Skeleton } from "../ui/skeleton";
import { UserId } from "@infrastructure/types/user";

type Props = { thread: ThreadWithUserAndLastMsg, onClick: () => void, userId: UserId }

export const ThreadCard = ({ thread, onClick, userId }: Props) => (
    <Card
        className={`p-4 rounded-lg shadow-md transition-all duration-200 cursor-pointer mb-3 hover:scale-105 relative`}
        onClick={onClick}
    >
        {thread.id === "319878bf-53ce-4025-930f-b1fb379d6a4c" && console.log(thread.lastMessage.readBy)}
        <p className={`font-semibold text-lg`}>{thread.title}</p>
        <div className="bg-gray-100 dark:bg-gray-100/5 flex justify-between dark:text-gray-400 text-gray-800 text-sm p-2 rounded">
            <p>{thread.lastMessage.content}</p> <p className="text-xs">{formatDateFrench(thread.lastMessage.sentAt)}</p>
        </div>
        {thread.lastMessage && thread.lastMessage.readBy && !thread.lastMessage.readBy.includes(userId) && <div className="absolute w-3 h-3 rounded-full bg-red-700 right-1.5 top-1.5"></div>}

    </Card>
)

export const ThreadCardSkeleton = () => (
    <Card
        className="p-4 flex justify-between items-center rounded-xs border-0 bg-gray-50 shadow-none flex-row mb-3"
    >
        <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
        </div>

        <div className="text-right ml-4">
            <Skeleton className="h-3 w-20" />
        </div>
    </Card>
);