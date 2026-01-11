"use client"
import { ButtonLoading } from "@/components/buttons/ButtonLoading"
import { endpoints } from "@/utils/endpoint"
import { ThreadId } from "@infrastructure/types/thread"
import { useMutation } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"
import { useTranslations } from "next-intl"

export const JoinThread = ({ threadId }: { threadId: ThreadId }) => {
    const joinMutate = useMutation(endpoints.threads.join({ threadId }))
    const t = useTranslations("advisor.thread");
    return (
        <ButtonLoading loading={joinMutate.isPending} onClick={() => joinMutate.mutate()}>{t("join")} <ArrowRight />
        </ButtonLoading>
    )
}