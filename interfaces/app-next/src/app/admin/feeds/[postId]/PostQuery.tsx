"use client"
import { ButtonLoading } from "@/components/ButtonLoading";
import { SwitchComponent } from "@/components/SwitchComponent";
import { Tag } from "@/components/Tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { advisorEndpoint } from "@/utils/endpoint/advisor";
import { NewPost, PostWithTagsAndUser } from "@/utils/endpoint/advisor/feedsEndpoint";
import { PostId } from "@infrastructure/types/feed";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Save, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { match } from "ts-pattern";

type Props = { postId: PostId }

export const PostQuery = ({ postId }: Props) => {

    const query = useQuery(advisorEndpoint.feeds.posts.get({ id: postId }));

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with({ status: "success" }, ({ data: post }) => <PostDisplay post={post} />
        ).exhaustive()

}


const PostDisplay = ({ post }: { post: PostWithTagsAndUser }) => {
    const [editValues, setEditValues] = useState<NewPost | null>(null);

    const editMutation = useMutation(advisorEndpoint.feeds.posts.edit({ id: post.id }));
    const actionMutation = useMutation(advisorEndpoint.feeds.posts.status({ id: post.id }));

    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const isMine = session.user.id === post.advisor.id;


    const handleChange = (field: keyof NewPost, value: string) => {
        if (!editValues) return;
        setEditValues({ ...editValues, [field]: value });
    };

    const handleSave = () => {
        editMutation.mutate(editValues);
    };

    const handleEditToggle = () => {
        setEditValues((prev) => {
            if (prev) return null
            return { title: post.title, content: post.content, tagsId: post.tagsId }
        });
    };
    const currentValues = editValues ?? { title: post.title, content: post.content };

    return <>
        <div className="flex justify-between items-center gap-3">
            {editValues && isMine ? (
                <Input
                    value={currentValues.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    className="text-md font-bold"
                />
            ) : (
                <h1 className="text-2xl font-bold">{post.title}</h1>
            )}
            {isMine &&
                <div className="flex gap-2">
                    {editValues ? (
                        <>
                            <ButtonLoading loading={editMutation.isPending} >
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
                </div>}
        </div>

        <div className="space-y-6 mt-4">
            <div className="space-y-2">
                <div className="flex gap-3">
                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <Tag tag={tag} key={tag.id} />
                            ))}
                        </div>
                    )}
                    {isMine ?
                        <SwitchComponent id="publie" label="Publié" checked={!!post.publishedAt} onChange={() => actionMutation.mutate({ status: post.publishedAt ? "unpublish" : "publish" })} />
                        : <Badge variant={post.publishedAt ? "secondary" : "outline"} className="h-fit ml-2">
                            {post.publishedAt ? "Publié" : "Brouillon"}
                        </Badge>}
                </div>
                <p className="text-sm text-gray-500">
                    Par <strong>{post.advisor.firstname} {post.advisor.lastname}</strong> ·{' '}
                    {post.publishedAt
                        ? `Publié le ${new Date(post.publishedAt).toLocaleDateString()}`
                        : `Brouillon créé le ${new Date(post.createdAt).toLocaleDateString()}`}
                </p>
            </div>

            {editValues && isMine ? (
                <Textarea
                    value={currentValues.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    className="min-h-[200px]"
                />
            ) : (
                <p> {post.content}
                </p>
            )}


        </div>
    </>
}