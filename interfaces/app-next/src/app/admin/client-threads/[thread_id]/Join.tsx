import { ButtonLoading } from "@/components/buttons/ButtonLoading"
import { endpoints } from "@/utils/endpoint"
import { ThreadId } from "@infrastructure/types/thread"
import { useMutation } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"

export const JoinThread = ({ threadId }: { threadId: ThreadId }) => {
    const joinMutate = useMutation(endpoints.threads.join({ threadId }))

    return (
        <ButtonLoading loading={joinMutate.isPending} onClick={() => joinMutate.mutate()}>Rejoindre la conversation <ArrowRight />
        </ButtonLoading>
    )
}