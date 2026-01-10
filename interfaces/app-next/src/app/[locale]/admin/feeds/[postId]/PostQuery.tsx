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
import { useEffect, useState } from "react";
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
    const [editValues, setEditValues] = useState<NewPost | null>(null);

    const editMutation = useMutation(endpoints.feeds.posts.edit({ id: postData.id }));
    const actionMutation = useMutation(endpoints.feeds.posts.status({ id: postData.id }));

    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;

    const isMine = session.user.id === postData.advisor.id;

    useEffect(() => {
        if (editValues) {
            console.log("✏️ Sync editValues avec postData");
            setEditValues({
                title: postData.title,
                content: postData.content,
                tagsId: postData.tagsId
            });
        }
    }, [postData.title, postData.content, postData.tagsId]);

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
        if (!editValues) return;
        setEditValues({ ...editValues, [field]: value });
    };

    const handleSave = () => {
        if (!editValues) return;
        editMutation.mutate(editValues, {
            onSuccess: (data) => {
                console.log("✅ Mutation réussie, data:", data);
                socket.emit("post:update", { post: data });
                setEditValues(null);
            }
        });
    };

    const handleEditToggle = () => {
        setEditValues((prev) => {
            if (prev) return null;
            return {
                title: postData.title,
                content: postData.content,
                tagsId: postData.tagsId
            };
        });
    };

    const toogleStatus = () => {
        actionMutation.mutate({
            status: postData.publishedAt ? "unpublish" : "publish"
        }, {
            onSuccess: (dataSuccess) => {
                console.log("✅ Status changé:", dataSuccess);
                socket.emit("post:status", { post: dataSuccess });
            }
        });
    };

    const currentValues = editValues ?? {
        title: postData.title,
        content: postData.content
    };

    return (
        <>
            <div className="flex justify-between items-center gap-3">
                {editValues && isMine ? (
                    <Input
                        value={currentValues.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className="text-md font-bold"
                    />
                ) : (
                    <h1 className="text-2xl font-bold">{postData.title}</h1>
                )}
                {isMine && (
                    <div className="flex gap-2">
                        {editValues ? (
                            <>
                                <ButtonLoading
                                    loading={editMutation.isPending}
                                    onClick={handleSave}
                                >
                                    <Save />
                                </ButtonLoading>
                                <Button variant="outline" onClick={handleEditToggle} size="icon">
                                    <X />
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleEditToggle} size="icon">
                                <Edit />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-6 mt-4">
                <div className="space-y-2">
                    <div className="flex gap-3">
                        {editValues ? (
                            <TagsFilters
                                setSelectedTagsId={(value) => setEditValues((prev) => {
                                    if (!prev) return null;
                                    return {
                                        ...prev,
                                        tagsId: typeof value === 'function'
                                            ? value(prev.tagsId as TagId[])
                                            : value
                                    };
                                })}
                                selectedTagsId={editValues.tagsId as TagId[]}
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
                                label="Publié"
                                checked={!!postData.publishedAt}
                                onChange={toogleStatus}
                            />
                        ) : (
                            <Badge
                                variant={postData.publishedAt ? "secondary" : "outline"}
                                className="h-fit ml-2"
                            >
                                {postData.publishedAt ? "Publié" : "Brouillon"}
                            </Badge>
                        )}
                    </div>

                    <p className="text-sm text-gray-500">
                        Par <strong>{postData.advisor.firstname} {postData.advisor.lastname}</strong> ·{' '}
                        {postData.publishedAt
                            ? `Publié le ${formatDateFrench(postData.publishedAt)}`
                            : `Brouillon créé le ${formatDateFrench(postData.createdAt)}`}
                    </p>
                </div>

                {editValues && isMine ? (
                    <Textarea
                        value={currentValues.content}
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