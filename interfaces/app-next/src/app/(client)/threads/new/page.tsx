'use client';

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";
import FormWrapper, { DataInfo } from "@/components/FormWrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { endpoints } from "@/utils/endpoint";
import { NewExternalThread, newExternalThreadSchema } from "@infrastructure/types/thread";


export default function NewThreadPage() {
    const router = useRouter();
    const { data: session } = useSession();

    if (!session?.user?.id) return <div>Unauthorized</div>;

    const form = useForm<Omit<NewExternalThread, "participantsId">>({
        resolver: zodResolver(newExternalThreadSchema.omit({ participantsId: true })),
        defaultValues: { title: "", messageContent: "" },
    });

    const mutate = useMutation(endpoints.threads.create({ type: "external" }));

    const onSubmit = (values: Omit<NewExternalThread, "participantsId">) => {
        mutate.mutate(
            { ...values, participantsId: [session.user.id] },
            { onSuccess: () => router.push("/threads") }
        );
    };

    const data: DataInfo<Omit<NewExternalThread, "participantsId">> = {
        title: { label: "Titre de la conversation", type: "text" },
        messageContent: { label: "Message", type: "textarea" },
    };

    return (
        <FormWrapper<Omit<NewExternalThread, "participantsId">>
            title="Nouvelle conversation"
            form={form}
            data={data}
            onSubmit={onSubmit}
            labelButton="Contacter"
            loading={mutate.isPending}
        />
    );
}
