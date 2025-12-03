import { ButtonLoading } from "@/components/ButtonLoading"
import { advisorEndpoint } from "@/utils/endpoint/advisor"
import { ThreadId } from "@infrastructure/types/thread"
import { useMutation } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"

export const JoinThread = ({ threadId }: { threadId: ThreadId }) => {
    const joinMutate = useMutation(advisorEndpoint.thread.client.join({ id: threadId }))

    return (
        <ButtonLoading loading={joinMutate.isPending} onClick={() => joinMutate.mutate()}>Rejoindre la conversation <ArrowRight />
        </ButtonLoading>
    )
}