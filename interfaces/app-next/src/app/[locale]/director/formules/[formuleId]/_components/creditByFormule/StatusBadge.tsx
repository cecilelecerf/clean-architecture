"use client"
import { Badge } from "@/components/ui/badge";
import { CreditDTO } from "@infrastructure/types/credit";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

interface StatusBadgeProps {
    status: CreditDTO["status"];
    t: ReturnType<typeof useTranslations>;
}

export const StatusBadge = memo(({ status, t }: StatusBadgeProps) => {
    const config = useMemo(() => {
        const variants = {
            PENDING: {
                variant: "outline" as const,
                label: t("badge.waiting")
            },
            ACCEPTED: {
                variant: "default" as const,
                label: t("badge.accept")
            },
            REFUSED: {
                variant: "destructive" as const,
                label: t("badge.refuse")
            },
            COMPLETED: {
                variant: "secondary" as const,
                label: t("badge.end")
            },
        };

        return variants[status];
    }, [status, t]);

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    );
});

StatusBadge.displayName = 'StatusBadge';