"use client"
import FormWrapper, { Field } from "@/components/FromWrapper";
import { ButtonBack } from "@/components/buttons/ButtonBack";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react"; import { endpoints } from "@/utils/endpoint";
import { NewThread } from "@/app/api/threads/route";

export default function NewThreadPage() {
    const router = useRouter()
    const [field, setField] = useState<NewThread>({ title: "", messageContent: "" });
    const fields: Field[] = [
        {
            label: 'Titre de la conversation',
            get: field.title,
            set: (e) => setField((prev) => ({ ...prev, title: e })),
        },
        {
            label: 'Message',
            get: field.messageContent,
            set: (e) => setField((prev) => ({ ...prev, messageContent: e })),
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