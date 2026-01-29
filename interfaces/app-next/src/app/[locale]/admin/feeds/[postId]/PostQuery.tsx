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
import { socket } from "@/lib/socket";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { endpoints } from "@/utils/endpoint";
import { NewPost, PostWithTagsAndUser } from "@/utils/endpoint/feedsEndpoint";
import { PostId, TagId } from "@infrastructure/types/feed";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Save, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useMemo } from "react";
import { match } from "ts-pattern";

type Props = { postId: PostId }

export const PostQuery = ({ postId }: Props) => {
    const query = useQuery(endpoints.feeds.posts.get({ id: postId }));

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => <SkeletonPost />)
        .with({ status: "success" }, ({ data: post }) => <PostDisplay postData={post} />)
        .exhaustive()
}

const PostDisplay = ({ postData }: { postData: PostWithTagsAndUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValues, setEditValues] = useState<NewPost>({
        title: postData.title,
        content: postData.content,
        tagsId: postData.tagsId
    });

    const editMutation = useMutation(endpoints.feeds.posts.edit({ id: postData.id }));
    const actionMutation = useMutation(endpoints.feeds.posts.status({ id: postData.id }));

    const { data: session } = useSession();

    const isMine = session?.user?.id === postData.advisor.id;

    const t = useTranslations("advisor.feeds");

    const displayValues = useMemo(() => {
        if (isEditing) {
            return editValues;
        }
        return {
            title: postData.title,
            content: postData.content,
            tagsId: postData.tagsId
        };
    }, [isEditing, editValues, postData.title, postData.content, postData.tagsId]);

    useEffect(() => {
        if (!socket) return;
        const eventNameUpdate = `post:${postData.id}:update`;

        socket.on(eventNameUpdate, () => {
            console.log("💬 Post mis à jour via socket - query va se refetch");
        });

        return () => {
            socket.off(eventNameUpdate);
        };
    }, [postData.id]);

    const handleChange = (field: keyof NewPost, value: string) => {
        setEditValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        editMutation.mutate(editValues, {
            onSuccess: (data) => {
                console.log("✅ Mutation réussie, data:", data);
                socket.emit("post:update", { post: data });
                setIsEditing(false);
            }
        });
    };

    const handleEditStart = () => {
        setEditValues({
            title: postData.title,
            content: postData.content,
            tagsId: postData.tagsId
        });
        setIsEditing(true);
    };

    const handleEditCancel = () => {
        setIsEditing(false);
    };

    const toogleStatus = () => {
        actionMutation.mutate({
            status: postData.publishedAt ? "unpublish" : "publish"
        }, {
            onSuccess: (dataSuccess) => {
                 socket.emit("post:status", { post: dataSuccess });
            }
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
                    <h1 className="text-2xl font-bold">{postData.title}</h1>
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
                        ) : postData.tags && postData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {postData.tags.map((tag) => (
                                    <Tag tag={tag} key={tag.id} />
                                ))}
                            </div>
                        )}

                        {isMine ? (
                            <SwitchComponent
                                id="publie"
                                label={t("filters.publish")}
                                checked={!!postData.publishedAt}
                                onChange={toogleStatus}
                            />
                        ) : (
                            <Badge
                                variant={postData.publishedAt ? "secondary" : "outline"}
                                className="h-fit ml-2"
                            >
                                {postData.publishedAt ? t("filters.publish") : t("filters.unpublish")}
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-gray-500">
                        {t("by")} <strong>{postData.advisor.firstname} {postData.advisor.lastname}</strong> ·{' '}
                        {postData.publishedAt ? (
                            <>
                                {t("publish")} {formatDateFrench(postData.publishedAt)}
                            </>
                        ) : (
                            <>
                                {t("unpublish")} {formatDateFrench(postData.createdAt)}
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
                    <p className="whitespace-pre-wrap">{postData.content}</p>
                )}
            </div>
        </>
    );
};