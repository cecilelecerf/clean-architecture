import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { match } from "ts-pattern";
import { Slider } from "@/components/ui/slider";
import { TagsFilters } from "./TagsFilters";
import { CalendarFilter } from "../CalendarFilter";
import { PostFilters as TPostFIlters } from "@/utils/endpoint/feedsEndpoint";
import { useTranslations } from "next-intl";
;

type PostFiltersProps = {
    filters: TPostFIlters;
    isAdmin?: boolean
    onChange: (filters: TPostFIlters) => void;
};

export const PostFilters = ({ filters, onChange, isAdmin }: PostFiltersProps) => {
    const [localFilters, setLocalFilters] = useState<TPostFIlters>(filters);
    const t = useTranslations("advisor.feeds.filters");

    useEffect(() => {
        onChange(localFilters);
    }, [localFilters, onChange]);
    return (
        <div className="flex gap-6 mb-6">
            <Input
                className="w-full"
                placeholder={t("placeholder")}
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
                        {isAdmin && (

                            <div className="flex flex-col gap-1">
                                <Label>{t("publish")}</Label>
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
                                        <SelectValue placeholder={t("all")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("all")}</SelectItem>
                                        <SelectItem value="published">{t("publish")}</SelectItem>
                                        <SelectItem value="unpublished">{t("unpublish")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <TagsFilters setSelectedTagsId={(value) => setLocalFilters((prev) => ({
                            ...prev,
                            tagsId: typeof value === 'function' ? value(prev.tagsId) : value
                        }))} selectedTagsId={localFilters.tagsId} />
                        <div className="flex gap-3 flex-col md:flex-row">
                            <CalendarFilter
                                dateIso={filters.fromDate}
                                onDateChange={(date) => setLocalFilters((prev) => ({ ...prev, fromDate: date ? date.toISOString() : undefined }))}
                                label={t("calendar.from")}
                            />
                            <CalendarFilter
                                dateIso={filters.toDate}
                                onDateChange={(date) => setLocalFilters((prev) => ({ ...prev, toDate: date ? date.toISOString() : undefined }))}
                                label={t("calendar.to")}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between w-full">
                                <Label>{t("page")}</Label>
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
