"use client"
import { ThreadCard } from "@/components/threads/ThreadCard";
import { Card } from "@/components/ui/card";
import { socket } from "@/lib/socket";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { match } from "ts-pattern";

export default function ThreadsPage() {
    const router = useRouter()
    const query = useQuery(endpoints.threads.getAll({type:"external"}))
    useEffect(() => {
        if (query.status === "success") {
            query.data.forEach((thread) => {
                socket.emit("thread:join", { threadId: thread.id });
            });
        }
    }, [query.status, query.data]);

    return (
        match(query)
            .with({ status: "error" }, () => "error")
            .with({ status: "pending" }, () => "loading")
            .with({ status: "success" }, ({ data: threads }) => {
                if (threads.length === 0) return <>Pas de conversation</>
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
            .exhaustive()


    )

}
