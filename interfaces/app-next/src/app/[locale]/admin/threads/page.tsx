"use client"
import { ThreadCardSkeleton } from "@/components/threads/ThreadCard";
import { ThreadsList } from "@/components/threads/ThreadList";
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
            <TitleAdminPage title="Messagerie" />
            {
                match(query)
                    .with({ status: "error" }, () => "error")
                    .with({ status: "pending" }, () =>
                        <div>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <ThreadCardSkeleton key={index} />
                            ))}
                        </div>)
                    .with({ status: "success" }, ({ data: threads }) => <ThreadsList onThreadClick={(id) => router.push(`/admin/threads/${id}`)} threads={threads} />)


                    .exhaustive()
            }
        </>


    )

}
