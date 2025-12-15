import { Card } from "../ui/card";
import { ThreadWithUser } from "@/utils/endpoint/client/threadEndpoints";
import { formatDateFrench } from "@/utils/date/formatDateFrench";

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