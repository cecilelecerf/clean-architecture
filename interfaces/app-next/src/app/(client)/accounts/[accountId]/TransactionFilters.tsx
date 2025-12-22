import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { FiltersProps } from "@/utils/endpoint/transactionEndpoints";
import { Transaction } from "@infrastructure/types/transaction";
import { CalendarFilter } from "@/components/CalendarFilter";
;

type TransactionFiltersProps = {
    filters: FiltersProps;
    isAdmin?: boolean
    onChange: (filters: FiltersProps) => void;
};

export const PostFilters = ({ filters, onChange, isAdmin }: TransactionFiltersProps) => {
    const [localFilters, setLocalFilters] = useState<FiltersProps>(filters);

    useEffect(() => {
        onChange(localFilters);
    }, [localFilters]);
    return (
        <div className="flex gap-6 mb-6">
            <Input
                className="w-full"
                placeholder="Rechercher par nom"
                value={localFilters.label || ""}
                onChange={(e) =>
                    setLocalFilters((prev) => ({ ...prev, label: e.target.value }))
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
                        {/* Statut publié */}
                        {isAdmin && (

                            <div className="flex flex-col gap-1">
                                <Label>Type</Label>
                                <Select
                                    value={localFilters.type}
                                    onValueChange={(val) => {
                                        setLocalFilters((prev) => ({
                                            ...prev,
                                            type: val as Transaction["type"]
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
                                        <SelectItem value="credit">Crédit</SelectItem>
                                        <SelectItem value="debit">Débit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
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
                                <Label>Transaction par page</Label>
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
