"use client"
import { useMutation, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { endpoints } from "@/utils/endpoint";
import { UserDto, } from "@infrastructure/types/user";
import { match } from "ts-pattern";
import { Skeleton } from "@/components/ui/skeleton";
import FormWrapper, { DataInfo } from "@/components/FormWrapper";
import { NewThread, newThreadSchema } from "@infrastructure/types/thread";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";

export default function NewThreadPage() {
    const queries = useQueries({
        queries: [
            endpoints.users.getAll({ role: "conseiller" }),
            endpoints.users.getAll({ role: "directeur" })
        ]
    });

    const t = useTranslations("director.message");

    return match(queries)
        .when(
            (q) => q.some(({ status }) => status === "error"),
            () => (
                <div className="text-red-500 p-4 border border-red-300 rounded">
                    {t("error")}
                </div>
            )
        )
        .with(
            [{ status: "success" }, { status: "success" }],
            ([{ data: advisors }, { data: directors }]) => <Content
                participants={{ advisors, directors }}
                t={t} />
        )
        .otherwise(() => <SkeletonAddParticipant />)
}

const Content = ({ participants, t }: { participants: { advisors: UserDto[], directors: UserDto[] }, t: ReturnType<typeof useTranslations> }) => {
    const router = useRouter()
    const form = useForm<NewThread>({
        resolver: zodResolver(newThreadSchema)
    });

    const data: DataInfo<NewThread> = {
        title: {
            label: t("form.title"),
            type: "text"
        },
        participantsId: {
            label: t("form.participants"),
            type: "command",
            commandOption: [{ name: t("form.advisor"), infos: participants.advisors }, { name: t("form.director"), infos: participants.directors }]
        }
    }

    const mutate = useMutation(endpoints.threads.create({ type: 'internal' }))

    const onSubmit = (values: NewThread) => {
        mutate.mutate(values, { onSuccess: (data) => router.push(`/director/threads/${data.id}`) })
    }
    return (

        <FormWrapper<NewThread>
            title={t("new")}
            form={form}
            labelButton={t("button")}
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