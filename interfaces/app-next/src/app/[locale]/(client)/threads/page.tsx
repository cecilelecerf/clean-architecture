"use client"
import { ButtonLink } from "@/components/buttons/ButtonLink";
import { ThreadCardSkeleton } from "@/components/threads/ThreadCard";
import { ThreadsList } from "@/components/threads/ThreadList"; 
import { endpoints } from "@/utils/endpoint";
 import { useQuery } from "@tanstack/react-query";
 import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";

export default function ThreadsPage() {
    const router = useRouter()
    const query = useQuery(endpoints.threads.getAll({ type: "external" }))
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
                .with({ status: "success" }, ({ data: threads }) => (
                    <ThreadsList
                        threads={threads}
                        onThreadClick={(id) => router.push(`/threads/${id}`)}
                     />
                )
                )
                .exhaustive()}
            <ButtonLink path="/threads/new">{t("contact")}</ButtonLink>

        </>)

}
