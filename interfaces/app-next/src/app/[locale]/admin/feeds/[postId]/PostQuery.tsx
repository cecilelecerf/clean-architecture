"use client"
import { ButtonLoading } from "@/components/buttons/ButtonLoading";
import { SkeletonPost } from "@/components/feeds/Posts";
import { TagsFilters } from "@/components/feeds/TagsFilters";
import { SwitchComponent } from "@/components/SwitchComponent";
import { Tag } from "@/components/Tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { endpoints } from "@/utils/endpoint";
import { NewPost, PostWithTagsAndUser } from "@/utils/endpoint/feedsEndpoint";
import { PostId, TagId } from "@infrastructure/types/feed";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Save, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { match } from "ts-pattern";

type Props = { postId: PostId }

export const PostQuery = ({ postId }: Props) => {
    const query = useQuery(endpoints.feeds.posts.get({ id: postId }));

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => <SkeletonPost />)
        .with({ status: "success" }, ({ data: post }) => <PostDisplay post={post} />)
        .exhaustive()
}

const PostDisplay = ({ post }: { post: PostWithTagsAndUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<NewPost>({
        title: post.title,
        content: post.content,
        tagsId: post.tagsId
    });

    const editMutation = useMutation(endpoints.feeds.posts.edit({ id: post.id }));
    const actionMutation = useMutation(endpoints.feeds.posts.status({ id: post.id }));

    const { data: session } = useSession();

    const isMine = session?.user?.id === post.advisor.id;

    const t = useTranslations("advisor.feeds");

    const displayValues = useMemo(() => {
        if (isEditing) {
            return editValues;
        }
        return {
            title: post.title,
            content: post.content,
            tagsId: post.tagsId
        };
    }, [isEditing, editValues, post.title, post.content, post.tagsId]);

    const handleChange = (field: keyof NewPost, value: string) => {
        setEditValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        editMutation.mutate(editValues, {
            onSuccess: (data) => {
                setIsEditing(false);
            }
        });
    };

    const handleEditStart = () => {
        setEditValues({
            title: post.title,
            content: post.content,
            tagsId: post.tagsId
        });
        setIsEditing(true);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
    };

    const toogleStatus = () => {
        actionMutation.mutate({
            status: post.publishedAt ? "unpublish" : "publish"
        });
    };

    return (
        <>
            <div className="flex justify-between items-center gap-3">
                {isEditing && isMine ? (
                    <Input
                        value={displayValues.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="text-md font-bold"
                    />
                ) : (
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                )}
                {isMine && (
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <ButtonLoading
                                    loading={editMutation.isPending}
                                    onClick={handleSave}
                                >
                                    <Save />
                                </ButtonLoading>
                                <Button variant="outline" onClick={handleEditCancel} size="icon">
                                    <X />
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleEditStart} size="icon">
                                <Edit />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-2">
                    {post.client && <p className="text-gray-700 dark:text-gray-200 text-xs">Destiné à : {post.client.firstname} {post.client.lastname}</p>}

                    <div className="flex gap-3">
                        {isEditing ? (
                            <TagsFilters
                                setSelectedTagsId={(value) => {
                                    setEditValues((prev) => ({
                                        ...prev,
                                        tagsId: typeof value === 'function'
                                            ? value(prev.tagsId as TagId[])
                                            : value
                                    }));
                                }}
                                selectedTagsId={displayValues.tagsId as TagId[]}
                            />
                        ) : post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                    <Tag tag={tag} key={tag.id} />
                                ))}
                            </div>
                        )}

                        {isMine ? (
                            <SwitchComponent
                                id="publie"
                                label={t("filters.publish")}
                                checked={!!post.publishedAt}
                                onChange={toogleStatus}
                            />
                        ) : (
                            <Badge
                                variant={post.publishedAt ? "secondary" : "outline"}
                                className="h-fit ml-2"
                            >
                                {post.publishedAt ? t("filters.publish") : t("filters.unpublish")}
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-gray-500">
                        {t("by")} <strong>{post.advisor.firstname} {post.advisor.lastname}</strong> ·{' '}
                        {post.publishedAt ? (
                            <>
                                {t("publish")} {formatDateFrench(post.publishedAt)}
                            </>
                        ) : (
                            <>
                                {t("unpublish")} {formatDateFrench(post.createdAt)}
                            </>
                        )}
                    </p>
                </div>

                {isEditing && isMine ? (
                    <Textarea
                        value={displayValues.content}
                        onChange={(e) => handleChange('content', e.target.value)}
                        className="min-h-[200px]"
                    />
                ) : (
                    <p className="whitespace-pre-wrap">{post.content}</p>
                )}
            </div>
        </>
    );
};