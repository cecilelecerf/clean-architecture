"use client";

import { Card, CardContent, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { endpoints } from "@/utils/endpoint";
import { UserId } from "@infrastructure/types/user";
import { CreditDTOWithFormule } from "@infrastructure/types/credit";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    Eye,
    Check,
    X,
    Calendar,
    DollarSign,
    Percent,
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { useState } from "react";
import { statusConfig } from "@/components/credits/constant";
import { CreditDialog } from "@/components/credits/CreditRow";



export const CreditCardMobile = ({ credit, userId, basePath }: { credit: CreditDTOWithFormule; userId: UserId, basePath: string }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"accept" | "refuse">("accept");
    const [refusalReason, setRefusalReason] = useState("");

    const config = statusConfig[credit.status];
    const StatusIcon = config.icon;
    const isPending = credit.status === "PENDING";

    const grantMutation = useMutation({
        ...endpoints.credits.grant({ creditId: credit.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["credits", userId] });
            setDialogOpen(false);
            setRefusalReason("");
        },
    });

    const handleAccept = () => {
        setDialogAction("accept");
        setDialogOpen(true);
    };

    const handleRefuse = () => {
        setDialogAction("refuse");
        setDialogOpen(true);
    };

    const confirmAction = () => {
        grantMutation.mutate({
            accept: dialogAction === "accept",
        });
    };

    return (
        <>
            <Card >
                <CardContent className="p-4 space-y-3 py-0">
                    {/* Header: Status + Montant */}
                    <div className="flex justify-between items-start">
                        <div>
                            <Badge variant={config.variant} className="flex items-center gap-1 w-fit mb-2">
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                            </Badge>
                            <p className="text-xl font-bold">
                                {credit.initialAmount.amount.toLocaleString("fr-FR", {
                                    style: "currency",
                                    currency: credit.initialAmount.currency,
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Infos principales */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{credit.durationMonths} mois</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{credit.formule.interestRate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                                {credit.monthlyPayment.amount.toLocaleString("fr-FR", {
                                    style: "currency",
                                    currency: credit.monthlyPayment.currency,
                                })}
                            </span>
                        </div>
                        <div className="text-gray-500 text-xs">
                            {formatDateFrench(credit.createdAt)}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`${basePath}/credits/${credit.id}`)}
                        >
                            <Eye className="w-4 h-4 mr-1" />
                            Détails
                        </Button>
                        {isPending && (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleAccept}
                                    disabled={grantMutation.isPending}
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    Accepter
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleRefuse}
                                    disabled={grantMutation.isPending}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog partagé */}
            <CreditDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                action={dialogAction}
                refusalReason={refusalReason}
                setRefusalReason={setRefusalReason}
                onConfirm={confirmAction}
                isPending={grantMutation.isPending}
            />
        </>
    );
};
