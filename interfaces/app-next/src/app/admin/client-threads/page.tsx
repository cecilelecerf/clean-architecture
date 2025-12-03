"use client"
import { Card } from "@/components/ui/card";
import { socket } from "@/lib/socket";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { advisorEndpoint } from "@/utils/endpoint/advisor";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { match } from "ts-pattern";

export default function ClientsThreadsPage() {
    const router = useRouter()
    const query = useQuery(advisorEndpoint.thread.client.getAll())
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
                    {threads.map((thread) => {
                        return <Card
                            key={thread.id}
                            className={`p-4 flex justify-between items-center rounded-lg border-0 bg-gray-50 hover:bg-gray-100 shadow-none transition-all duration-200 cursor-pointer flex-row mb-4`}
                            onClick={() => router.push(`/admin/client-threads/${thread.id}`)}
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
                    })}
                </div>
            })
            .exhaustive()


    )

}
