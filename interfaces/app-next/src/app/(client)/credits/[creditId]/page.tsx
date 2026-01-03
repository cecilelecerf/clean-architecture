"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { endpoints } from "@/utils/endpoint";
import { CreditId } from "@infrastructure/types/credit";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { match } from "ts-pattern";
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    Percent,
    TrendingUp,
    CalendarClock,
    DollarSign,
    Building2,
    User,
    Shield,
    Type,
    Tag,
    AtSign,
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { use } from "react";
import { CreditDetails, CreditDetailSkeleton } from "@/components/credits/CreditDetails";

const statusConfig = {
    PENDING: {
        label: "En attente",
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
    },
    ACCEPTED: {
        label: "Accepté",
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
    },
    ACCEPTED_FUTURE: {
        label: "Accepté - À venir",
        variant: "secondary" as const,
        icon: CalendarClock,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
    },
    REFUSED: {
        label: "Refusé",
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
    },
    COMPLETED: {
        label: "Terminé",
        variant: "outline" as const,
        icon: CheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
    },
};

export default function CreditDetailPage({
    params,
}: {
    params: Promise<{ creditId: CreditId }>;
}) {
    const { creditId } = use(params);
    const router = useRouter();
    const query = useQuery(endpoints.credits.get({ creditId }));

    return (
        <>
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold">Détail du crédit</h1>
            </div>

            {match(query)
                .with({ status: "error" }, () => ("error"
                ))
                .with({ status: "pending" }, () => <CreditDetailSkeleton />)
                .with({ status: "success" }, ({ data: credit }) => <CreditDetails credit={credit} account={credit.account} />)
                .exhaustive()}
        </>
    );
}
