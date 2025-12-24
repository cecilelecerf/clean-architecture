import { ThreadWithUser } from "@/utils/endpoint/threadEndpoints";
import { Card } from "../ui/card";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { Skeleton } from "../ui/skeleton";

type Props = { thread: ThreadWithUser, onClick: () => void }

export const ThreadCard = ({ thread, onClick }: Props) => (
    <Card
        className={`p-4 flex justify-between items-center rounded-xs border-0 bg-gray-50 hover:bg-gray-100 shadow-none transition-all duration-200 cursor-pointer flex-row mb-3`}
        onClick={onClick}
    >
        {/* Left side */}
        <div>
            <p className={`font-semibold text-lg leading-5`}>{thread.title}</p>
            <p className="text-sm text-gray-500">{thread.participants[0].firstname} {" "}{thread.participants[0].lastname}</p>
        </div>

        {/* Right side */}
        <div className="text-right">
            <p className={`text-xs font-medium mt-0.5`}>{formatDateFrench(thread.updatedAt ?? thread.createdAt)}</p>
        </div>
    </Card>
)

export const ThreadCardSkeleton = () => (
    <Card
        className="p-4 flex justify-between items-center rounded-xs border-0 bg-gray-50 shadow-none flex-row mb-3"
    >
        {/* Left side */}
        <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
        </div>

        {/* Right side */}
        <div className="text-right ml-4">
            <Skeleton className="h-3 w-20" />
        </div>
    </Card>
);