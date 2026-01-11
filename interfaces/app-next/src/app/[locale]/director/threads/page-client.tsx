"use client";

import { GoToAddPage } from "@/components/GoToAddPage";
import { SkeletonThread } from "@/components/threads/WrapperThread";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { endpoints } from "@/utils/endpoint";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import { useCallback } from "react";
import { useThreadSocket } from "@/app/hooks/useThreadSocket";
import { ThreadsList } from "@/components/threads/ThreadList";

type PropsOptimized = {
    translations: {
        not: string;
        title: string;
    };
};

export default function ClientsThreadsPageClientOptimized({ translations }: PropsOptimized) {
    const router = useRouter();
    const query = useQuery(endpoints.threads.getAll({ type: "internal" }));

    useThreadSocket(query.data);

    const handleThreadClick = useCallback(
        (threadId: string) => {
            router.push(`/director/threads/${threadId}`);
        },
        [router]
    );

    return (
        <>
            <TitleAdminPage title={translations.title} />
            {match(query)
                .with({ status: "error" }, () => (
                    <div className="text-red-500 text-center border border-red-300 p-6 rounded-lg">
                        Erreur lors du chargement des conversations
                    </div>
                ))
                .with({ status: "pending" }, () => <SkeletonThread />)
                .with({ status: "success" }, ({ data: threads }) => {
                    if (threads.length === 0) {
                        return (
                            <div className="text-gray-500 text-center border p-6 rounded-lg">
                                {translations.not}
                            </div>
                        );
                    }

                    return (
                        <ThreadsList
                            threads={threads}
                            onThreadClick={handleThreadClick}
                        />
                    );
                })
                .exhaustive()}
            <GoToAddPage path="/director/threads/new" />
        </>
    );
}
