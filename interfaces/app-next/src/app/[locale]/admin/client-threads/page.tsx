"use client"
import { ThreadCard, ThreadCardSkeleton } from "@/components/threads/ThreadCard";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { socket } from "@/lib/socket";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { match } from "ts-pattern";

export default function ThreadsPage() {
    const router = useRouter()
    const query = useQuery(endpoints.threads.advisorGetAll())
    const t = useTranslations("advisor.thread");

    useEffect(() => {
        if (query.status === "success") {
            query.data.forEach((thread) => {
                socket.emit("thread:join", { threadId: thread.id });
            });
        }
    }, [query.status, query.data]);

    return (
        <>
            <TitleAdminPage title={t("title")} />
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
                    return <div className="">
                        {threads.map((thread) => (
                            <ThreadCard
                                thread={thread}
                                key={thread.id}
                                onClick={() => router.push(`/admin/client-threads/${thread.id}`)}
                            />
                        ))}
                    </div>
                })
                .exhaustive()}
        </>
    )
}
