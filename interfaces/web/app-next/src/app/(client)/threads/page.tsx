"use client"
import { ButtonLink } from "@/components/ButtonLink";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { clientEndpoints } from "@/utils/clientEndpoint";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";

export default function ThreadsPage() {
    const router = useRouter()
    const query = useQuery(clientEndpoints.threads.getAll())

    return (
        <>
            {match(query)
                .with({ status: "error" }, () => "error")
                .with({ status: "pending" }, () => "loading")
                .with({ status: "success" }, ({ data: threads }) => {
                    if (threads.length === 0) return <>Pas de conversation</>
                    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {threads.map((thread) =>
                            <Card
                                key={thread.id}
                                className={`p-4 flex justify-between items-center rounded-lg border-0 bg-gray-50 hover:bg-gray-100 shadow-none transition-all duration-200 cursor-pointer flex-row`}
                                onClick={() => router.push(`/threads/${thread.id}`)}
                            >
                                {/* Left side */}
                                <div>
                                    <p className={`font-semibold text-lg leading-5`}>{thread.title}</p>
                                    <p className="text-sm text-gray-500">{thread.administrator.firstname} {" "}{thread.administrator.lastname}</p>
                                </div>

                                {/* Right side */}
                                <div className="text-right">
                                    <p className={`text-xs font-medium mt-0.5`}>{formatDateFrench(thread.updatedAt ?? thread.createdAt)}</p>
                                </div>
                            </Card>)}
                    </div>
                })
                .exhaustive()}
            <ButtonLink path="/threads/new">Contactez un conseillez</ButtonLink>

        </>)

}
