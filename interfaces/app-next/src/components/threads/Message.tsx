import { formatDateFrench } from "@/utils/date/formatDateFrench"
import { MessageWithUser } from "@infrastructure/types/message"

type Props = { isCurrentUser: boolean } & MessageWithUser
export const MessageComponent = ({ sender, sentAt, content, isCurrentUser }: Props) => (
    <div
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
    >
        <div
            className={`max-w-xs px-4 py-2 rounded-lg ${isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                }`}
        >
            <div className="flex justify-between">
                <div className="text-sm font-semibold">
                    {sender.firstname} {sender.lastname}
                </div>
            </div>
            <div className="mt-1">{content}</div>
            <div className={
                `text-xs mt-1 text-right 
            ${isCurrentUser ? "  text-blue-100" : "text-gray-400"}`
            }>
                {formatDateFrench(sentAt)}
            </div>
        </div>
    </div>
)