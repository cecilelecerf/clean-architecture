"use client"
import FormWrapper, { Field } from "@/components/FromWrapper";
import { ButtonBack } from "@/components/buttons/ButtonBack";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react"; import { endpoints } from "@/utils/endpoint";
import { NewExternalThread } from "@/app/api/threads/route";
import { useSession } from "next-auth/react";

export default function NewThreadPage() {
    const router = useRouter()
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const [field, setField] = useState<NewExternalThread>({ title: "", messageContent: "", participantsId: [session.user.id] });
    const fields: Field[] = [
        {
            label: 'Titre de la conversation',
            get: field.title,
            set: (e) => setField((prev) => ({ ...prev, title: Array.isArray(e) ? e[0] : e })),
        },
        {
            label: 'Message',
            get: field.messageContent,
            set: (e) => setField((prev) => ({ ...prev, messageContent: Array.isArray(e) ? e[0] : e })),
            type: "textarea"
        },
    ];

    const mutate = useMutation(endpoints.threads.create({ type: "external" }))

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate.mutate(field, { onSuccess: () => router.push("/threads") })
    }

    return (
        <>
            <ButtonBack />
            <form onSubmit={(e) => onSubmit(e)} className="max-w-lg mx-auto mt-10" >
                <FormWrapper
                    title="Nouvelle conversation"
                    fields={fields}
                    button="Contacter"
                    loading={mutate.isPending}
                />
            </form >
        </>
    );
}