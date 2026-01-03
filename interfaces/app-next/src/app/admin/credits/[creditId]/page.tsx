"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { endpoints } from "@/utils/endpoint";
import { CreditId } from "@infrastructure/types/credit";
import { useQuery, useMutation } from "@tanstack/react-query";
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
    FileText,
    User,
    Shield,
    Check,
    X,
    Building2,
    NotebookPen,
    Tag,
    UserCog,
    AtSign,
    WalletMinimal,
    BriefcaseBusiness,
    ArrowBigRight,
    Type
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { use, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserId } from "@infrastructure/types/user";
import { CreditDetails, CreditDetailSkeleton } from "@/components/credits/CreditDetails";


export default function AdminCreditDetailPage({
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
                <h1 className="text-2xl font-bold">Détail de la demande de crédit</h1>
            </div>

            {match(query)
                .with({ status: "error" }, () => ("error"))
                .with({ status: "pending" }, () => <CreditDetailSkeleton />)
                .with({ status: "success" }, ({ data: credit }) => <CreditDetails credit={credit} account={credit.account} />)
                .exhaustive()}

        </>
    );
}
