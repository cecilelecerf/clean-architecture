'use client';

import FormWrapper, { DataInfo } from "@/components/FormWrapper";
import { endpoints } from "@/utils/endpoint";
import { newPostSchema, postSchema, Tag } from "@infrastructure/types/feed";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { match } from "ts-pattern";
import { useTranslations } from "next-intl";
import { UserDto } from "@infrastructure/types/user";

const newPostFormSchema = newPostSchema.omit({ userId: true })
export type NewPostForm = z.infer<typeof newPostFormSchema>

export const NewPostComponent = ({ user }: { user?: UserDto }) => {

    const tags = useQuery(endpoints.feeds.tags.getAll())

    return match(tags)
        .with(({ status: "error" }), () => "error")
        .with(({ status: "pending" }), () => "pending")
        .with(({ status: "success" }), ({ data: tags }) => <Content tags={tags} user={user} />)
        .exhaustive()
}


const Content = ({ tags, user }: { tags: Tag[], user?: UserDto }) => {
    const router = useRouter();

    const t = useTranslations("advisor.feeds.new");

    const form = useForm<NewPostForm>({
        resolver: zodResolver(newPostFormSchema),
        defaultValues: { title: "", content: "", tagsId: [] },
    });

    const mutate = useMutation(endpoints.feeds.posts.add());

    const onSubmit = (values: NewPostForm) => {
        const tagsId = values.tagsId.map((id) => id as z.infer<typeof postSchema.shape.tagsId.element>);
        mutate.mutate(
            { ...values, tagsId, userId: user.id },
            {
                onSuccess: () => {
                    router.push("/admin/feeds");
                },
            }
        );
    };

    const data: DataInfo<NewPostForm> = {
        title: { label: t("form.title"), type: "text" },
        content: { label: t("form.content"), type: "textarea" },
        tagsId: {
            label: t("form.tags"),
            type: "tag",
            options: tags.map((tag) => ({ value: tag.id, label: tag.label, tagColor: tag.color }))
        }
    }
    return (
        <FormWrapper<NewPostForm>
            title={`${t("title")} ${user && `pour ${user.firstname} ${user.lastname}`}`}
            form={form}
            data={data}
            onSubmit={onSubmit}
            labelButton={t("button")}
            loading={mutate.isPending}
            showBackButton={!user}
        />
    )
}