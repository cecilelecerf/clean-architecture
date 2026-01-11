
"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";
import { useTranslations } from "next-intl";

interface FormulesStatsProps {
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
    t: ReturnType<typeof useTranslations>;
}

export const FormulesStats = memo(({ stats, t }: FormulesStatsProps) => (
    <Card>
        <CardContent className="py-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {t("total")}
                    </p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline">
                        {stats.active} {t("active")}
                    </Badge>
                    <Badge variant="secondary">
                        {stats.inactive} {t("inactive")}
                    </Badge>
                </div>
            </div>
        </CardContent>
    </Card>
));

FormulesStats.displayName = 'FormulesStats';