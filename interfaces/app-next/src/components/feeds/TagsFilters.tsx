import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { bgColorClasses, borderColorClasses, textColorClasses } from "@/utils/color";
import { feedsEndpoint, PostFiltersProps } from "@/utils/endpoint/feedsEndpoint";
import { TagId } from "@infrastructure/types/feed";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { match } from "ts-pattern";
type Props = {
    localFilters: PostFiltersProps
    setLocalFilters: Dispatch<SetStateAction<PostFiltersProps>>
}
export const TagsFilters = ({ localFilters, setLocalFilters }: Props) => {
    const tagsQuery = useQuery(feedsEndpoint.tags.getAll());

    const toggleTag = (tagId: TagId) => {
        setLocalFilters((prev) => {
            const currentTags = prev.tagsId || [];
            const isSelected = currentTags.includes(tagId);

            return {
                ...prev,
                tagsId: isSelected
                    ? currentTags.filter((id) => id !== tagId)
                    : [...currentTags, tagId],
            };
        });
    };

    const clearAllTags = () => {
        setLocalFilters((prev) => ({
            ...prev,
            tagsId: [],
        }));
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <Label>Tags</Label>
                {localFilters.tagsId && localFilters.tagsId.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllTags}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                    >
                        Tout effacer
                    </Button>
                )}
            </div>

            {match(tagsQuery)
                .with({ status: "pending" }, () => (
                    <div className="text-sm text-muted-foreground">Chargement...</div>
                ))
                .with({ status: "error" }, () => (
                    <div className="text-sm text-destructive">Erreur lors du chargement des tags</div>
                ))
                .with({ status: "success" }, ({ data: tags }) => (
                    <div className="flex flex-wrap gap-2">
                        {tags.length === 0 ? (
                            <div className="text-sm text-muted-foreground">Aucun tag disponible</div>
                        ) : (
                            tags.map((tag) => {
                                const isSelected = localFilters.tagsId?.includes(tag.id);
                                return (
                                    <Badge
                                        key={tag.id}
                                        variant={isSelected ? "default" : "outline"}
                                        className={cn(
                                            `cursor-pointer transition-all hover:scale-105 ${borderColorClasses[400][tag.color]}`,
                                            isSelected && `ring-2 ring-offset-1 ${bgColorClasses[400][tag.color]} `,
                                            isSelected ? "white " : textColorClasses[400][tag.color]
                                        )}
                                        onClick={() => toggleTag(tag.id)}
                                    >
                                        {tag.label}
                                        {isSelected && (
                                            <X className="ml-1 h-3 w-3" />
                                        )}
                                    </Badge>
                                );
                            })
                        )}
                    </div>
                ))
                .exhaustive()}
        </div>
    )
}