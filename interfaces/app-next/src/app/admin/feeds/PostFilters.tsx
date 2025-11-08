import { useState, useEffect } from "react";
import { FiltersProps } from "@/utils/endpoint/advisor/feedsEndpoint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { match } from "ts-pattern";
;

type PostFiltersProps = {
    filters: FiltersProps;
    onChange: (filters: FiltersProps) => void;
};

export const PostFilters = ({ filters, onChange }: PostFiltersProps) => {
    const [localFilters, setLocalFilters] = useState<FiltersProps>(filters);


    useEffect(() => {
        console.log(localFilters)
        onChange(localFilters);
    }, [localFilters]);

    return (
        <div className="flex gap-6 mb-6">
            <Input
                className="w-full"
                placeholder="Rechercher par titre"
                value={localFilters.title || ""}
                onChange={(e) =>
                    setLocalFilters((prev) => ({ ...prev, title: e.target.value }))
                }
            />
            <Popover>
                <PopoverTrigger asChild>
                    <Button>
                        <SlidersHorizontal />
                    </Button>
                </PopoverTrigger>
                <PopoverContent>

                    <div className="flex flex-col gap-4">
                        {/* Statut publié */}
                        <div className="flex flex-col">
                            <Label>Publié</Label>
                            <Select
                                value={match(localFilters.status).with(true, () => "published").with(false, () => "unpublished").otherwise(() => "all")

                                }
                                onValueChange={(val) => {
                                    const status = match(val).with("published", () => true).with("unpublished", () => false).otherwise(() => undefined)
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        status
                                    }))
                                    return val
                                }
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Tous" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous</SelectItem>
                                    <SelectItem value="published">Publié</SelectItem>
                                    <SelectItem value="unpublished">Brouillon</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tags */}
                        {/* <div className="flex flex-col">
                <Label>Tags</Label>
                <Multi
                    value={localFilters.tags || []}
                    onValueChange={(val) => setLocalFilters((prev) => ({ ...prev, tags: [...prev.tags, val] }))}
                    multiple
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Tous les tags" />
                    </SelectTrigger>
                    <SelectContent>
                        {tagsQuery.data?.map((tag) => (
                            <SelectItem key={tag.id} value={tag.id}>
                                {tag.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div> */}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <Label>De</Label>
                                <Input
                                    type="date"
                                    value={localFilters.fromDate || ""}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            fromDate: e.target.value || undefined,
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col">
                                <Label>À</Label>
                                <Input
                                    type="date"
                                    value={localFilters.toDate || ""}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            toDate: e.target.value || undefined,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <Label>Page</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={localFilters.page || 1}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            page: Number(e.target.value),
                                        }))
                                    }
                                />
                            </div>
                            <div className="flex flex-col">
                                <Label>Par page</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={localFilters.limit || 10}
                                    onChange={(e) =>
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            limit: Number(e.target.value),
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div >
    );
};
