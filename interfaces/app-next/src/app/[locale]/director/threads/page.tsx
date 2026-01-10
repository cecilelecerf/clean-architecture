"use client"
import { GoToAddPage } from "@/components/GoToAddPage";
import { ThreadCard } from "@/components/threads/ThreadCard";
import { SkeletonThread } from "@/components/threads/WrapperThread";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { socket } from "@/lib/socket";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { match } from "ts-pattern";

export default function ClientsThreadsPage() {
    const router = useRouter()
    const query = useQuery(endpoints.threads.getAll({ type: "internal" }))
    useEffect(() => {
        if (query.status === "success") {
            query.data.forEach((thread) => {
                socket.emit("thread:join", { threadId: thread.id });
            });
        }
    }, [query.status, query.data]);

    return (
        <>
            <TitleAdminPage title="Conversations" />
            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () => <SkeletonThread />)
                .with({ status: "success" }, ({ data: threads }) => {
                    if (threads.length === 0) return <>Pas de conversation</>
                    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {threads.map((thread) => (
                            <ThreadCard
                                thread={thread}
                                key={thread.id}
                                onClick={() => router.push(`/director/threads/${thread.id}`)}
                            />
                        ))}
                    </div>
                })
                .exhaustive()}
            <GoToAddPage path="/director/threads/new" />
        </>


    )

}
