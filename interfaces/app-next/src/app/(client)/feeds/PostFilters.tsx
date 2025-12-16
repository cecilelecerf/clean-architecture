import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarFilter } from "../../../components/CalendarFilter";
import { Slider } from "@/components/ui/slider";
import { FiltersProps } from "@/utils/endpoint/feedsEndpoint";
 
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
                <PopoverContent align="end" className="w-65 md:w-90">
                    <div className="flex flex-col gap-4">


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
                        <div className="flex gap-3 flex-col md:flex-row">
                            <CalendarFilter
                                dateIso={filters.fromDate}
                                onDateChange={(date) => setLocalFilters((prev) => ({ ...prev, fromDate: date ? date.toISOString() : undefined }))}
                                label="Du"
                            />
                            <CalendarFilter
                                dateIso={filters.toDate}
                                onDateChange={(date) => setLocalFilters((prev) => ({ ...prev, toDate: date ? date.toISOString() : undefined }))}
                                label="Au"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between w-full">
                                <Label>Post par page</Label>
                                <p>{localFilters.limit}</p>
                            </div>
                            <Slider
                                defaultValue={[localFilters.limit]}
                                max={50}
                                step={1}
                                onValueCommit={(e) => setLocalFilters((prev) => ({
                                    ...prev,
                                    limit: e[0],
                                }))}
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </div >
    );
};
