'use client';

import FormWrapper, { DataInfo } from "@/components/FormWrapper";
import { socket } from "@/lib/socket";
import { endpoints } from "@/utils/endpoint";
import { postSchema, Tag } from "@infrastructure/types/feed";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { match } from "ts-pattern";
import { NewPost, newPostSchema } from "@/utils/endpoint/feedsEndpoint";



export default function NewPostPage() {

    const tags = useQuery(endpoints.feeds.tags.getAll())

    return match(tags)
        .with(({ status: "error" }), () => "error")
        .with(({ status: "pending" }), () => "pending")
        .with(({ status: "success" }), ({ data: tags }) => <Content tags={tags} />)
        .exhaustive()
}


const Content = ({ tags }: { tags: Tag[] }) => {
    const router = useRouter();

    const form = useForm<NewPost>({
        resolver: zodResolver(newPostSchema),
        defaultValues: { title: "", content: "", tagsId: [] },
    });

    const mutate = useMutation(endpoints.feeds.posts.add());

    const onSubmit = (values: NewPost) => {
        const tagsId = values.tagsId.map((id) => id as z.infer<typeof postSchema.shape.tagsId.element>);
        mutate.mutate(
            { ...values, tagsId },
            {
                onSuccess: (post) => {
                    router.push("/admin/feeds");
                    if (post.publishedAt) socket.emit("post:status", { post });
                },
            }
        );
    };

    const data: DataInfo<NewPost> = {
        title: { label: "Titre", type: "text" },
        content: { label: "Contenu", type: "textarea" },
        tagsId: {
            label: "Tags",
            type: "tag",
            options: tags.map((tag) => ({ value: tag.id, label: tag.label, tagColor: tag.color }))
        }
    }
    return (
        <FormWrapper<NewPost>
            title="Nouveau post"
            form={form}
            data={data}
            onSubmit={onSubmit}
            labelButton="Publier"
            loading={mutate.isPending}
        />
    )
}