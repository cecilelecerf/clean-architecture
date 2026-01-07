"use client"
import { useMutation, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { endpoints } from "@/utils/endpoint";
import { useSession } from "next-auth/react";
import { UserDto, } from "@infrastructure/types/user";
import { match } from "ts-pattern";
import { Skeleton } from "@/components/ui/skeleton";
import FormWrapper, { DataInfo } from "@/components/erfer";
import { NewThread, newThreadSchema } from "@infrastructure/types/thread";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function NewThreadPage() {
    const router = useRouter()
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;

    const queries = useQueries({
        queries: [
            endpoints.users.getAll({ role: "conseiller" }),
            endpoints.users.getAll({ role: "directeur" })
        ]
    });

    match(queries)
        .when(
            (q) => q.some(({ status }) => status === "error"),
            () => (
                <div className="text-red-500 p-4 border border-red-300 rounded">
                    Erreur lors du chargement des utilisateurs
                </div>
            )
        )
        .with(
            [{ status: "success" }, { status: "success" }],
            ([{ data: advisors }, { data: directors }]) => <Content participants={{ advisors, directors }} />
        )
        .otherwise(() => <SkeletonAddParticipant />)
}

const Content = ({ participants }: { participants: { advisors: UserDto[], directors: UserDto[] } }) => {
    const router = useRouter()
    const form = useForm<NewThread>({
        resolver: zodResolver(newThreadSchema)
    });

    const data: DataInfo<NewThread> = {
        title: {
            label: 'Titre de la conversation',
            type: "text"
        },
        participantsId: {
            label: "Participants",
            type: "command",
            commandOption: [{ name: "Conseiller", infos: participants.advisors }, { name: "Directeurs", infos: participants.directors }]
        }
    }

    const mutate = useMutation(endpoints.threads.create({ type: 'internal' }))

    const onSubmit = (values: NewThread) => {
        mutate.mutate(values, { onSuccess: (data) => router.push(`/director/threads/${data.id}`) })
    }
    return (

        <FormWrapper<NewThread>
            title="Nouvelle conversation"
            form={form}
            labelButton="Démarrer"
            data={data}
            loading={mutate.isPending}
            onSubmit={onSubmit}
        />
    )
}


const SkeletonAddParticipant = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    );
};