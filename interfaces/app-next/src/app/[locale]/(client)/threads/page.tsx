"use client"
import { ButtonLink } from "@/components/buttons/ButtonLink";
import { ThreadCard, ThreadCardSkeleton } from "@/components/threads/ThreadCard";
import { Card } from "@/components/ui/card";
import { socket } from "@/lib/socket";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { match } from "ts-pattern";

export default function ThreadsPage() {
    const router = useRouter()
    const query = useQuery(endpoints.threads.getAll({ type: "external" }))
    useEffect(() => {
        if (query.status === "success") {
            query.data.forEach((thread) => {
                socket.emit("thread:join", { threadId: thread.id });
            });
        }
    }, [query.status, query.data]);
    const t = useTranslations("client.thread");
    return (
        <>
            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () =>
                    <div>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <ThreadCardSkeleton key={index} />
                        ))}
                    </div>)
                .with({ status: "success" }, ({ data: threads }) => {
                    if (threads.length === 0) return <>{t("none")}</>
                    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {threads.map((thread) => {
                            return (
                                <ThreadCard
                                    thread={thread}
                                    key={thread.id}
                                    onClick={() => router.push(`/threads/${thread.id}`)}
                                />)
                        })}
                    </div>
                })
                .exhaustive()}
            <ButtonLink path="/threads/new">{t("contact")}</ButtonLink>

        </>)

}
