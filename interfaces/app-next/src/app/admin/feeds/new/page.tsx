"use client"
import { ButtonBack } from "@/components/buttons/ButtonBack";
import FormWrapper, { Field } from "@/components/FromWrapper";
import { socket } from "@/lib/socket";
import { advisorEndpoint } from "@/utils/endpoint/advisor";
import { NewPost } from "@/utils/endpoint/advisor/feedsEndpoint";
import { Post } from "@infrastructure/types/feed";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function PostsPage() {
    const router = useRouter()
    const [field, setField] = useState<NewPost>({ title: "", content: "", tagsId: [] });
    const fields: Field[] = [
        {
            label: 'Titre',
            get: field.title,
            set: (e) => setField((prev) => ({ ...prev, title: e })),
        },
        {
            label: 'Contenu',
            get: field.content,
            set: (e) => setField((prev) => ({ ...prev, content: e })),
            type: "textarea"
        },
    ];

    const mutate = useMutation<Post, Error, NewPost>(advisorEndpoint.feeds.posts.add())

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate.mutate(field, {
            onSuccess: (post) => {
                router.push("/admin/feeds");
                if (post.publishedAt)
                    socket.emit("post:status", { post })
            }

        })
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
