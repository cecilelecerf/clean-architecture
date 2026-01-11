"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { endpoints } from "@/utils/endpoint";
import { CreditDTOWithFormule } from "@infrastructure/types/credit";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    Eye,
    Check,
    X,
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { statusConfig } from "./constant";
import { useTranslations } from "next-intl";

type Props = { credit: CreditDTOWithFormule, isAdmin?: boolean, basePath: string }

export const CreditRow = ({ credit, isAdmin, basePath }: Props) => {
    const router = useRouter();
    const t = useTranslations("credit.row");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"accept" | "refuse">("accept");
    const [refusalReason, setRefusalReason] = useState("");

    const config = statusConfig[credit.status];
    const StatusIcon = config.icon;
    const isPending = credit.status === "PENDING";

    const grantMutation = useMutation(endpoints.credits.grant({ creditId: credit.id }));

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
            payload: { accept: dialogAction === "accept", reason: refusalReason },
        }, {
            onSuccess: () => {
                setDialogOpen(false);
                setRefusalReason("");
            },
        });
    };
    return (
        <>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-200/10 transition-colors">
                <td className="p-4">
                    <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                    </Badge>
                </td>
                <td className="p-4 font-semibold">
                    {credit.initialAmount.amount.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: credit.initialAmount.currency,
                    })}
                </td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{credit.durationMonths} mois</td>
                <td className="p-4 text-gray-600 dark:text-gray-400">{credit.formule.interestRate}%</td>
                <td className="p-4 font-medium">
                    {credit.monthlyPayment.amount.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: credit.monthlyPayment.currency,
                    })}
                </td>
                <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDateFrench(credit.createdAt)}
                </td>
                <td className="p-4">
                    <div className="flex items-center justify-end gap-2 flex-col xl:flex-row">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`${basePath}/credits/${credit.id}`)}
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                        {isPending && isAdmin && (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleAccept}
                                    disabled={grantMutation.isPending}
                                >
                                    <Check className="w-4 h-4 mr-1" />
                                    {t("accept")}
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleRefuse}
                                    disabled={grantMutation.isPending}
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    {t("refused")}
                                </Button>
                            </>
                        )}
                    </div>
                </td>
            </tr>

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
        </>)
}


export const CreditDialog = ({
    open,
    onOpenChange,
    action,
    refusalReason,
    setRefusalReason,
    onConfirm,
    isPending
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    action: "accept" | "refuse";
    refusalReason: string;
    setRefusalReason: (reason: string) => void;
    onConfirm: () => void;
    isPending: boolean;
}) => {
    const t = useTranslations("credit.row");
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {action === "accept"
                            ? t("dialog.accept.title")
                            : t("dialog.refused.title")}
                    </DialogTitle>
                    <DialogDescription>
                        {action === "accept"
                            ? t("dialog.accept.description")
                            : t("dialog.refused.description")}
                    </DialogDescription>
                </DialogHeader>

                {action === "refuse" && (
                    <Textarea
                        placeholder={t("dialog.refused.placeholder")}
                        value={refusalReason}
                        onChange={(e) => setRefusalReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            setRefusalReason("");
                        }}
                    >
                        {t("cancel")}
                    </Button>
                    <Button
                        variant={action === "accept" ? "default" : "destructive"}
                        onClick={onConfirm}
                        disabled={isPending || (action === "refuse" && !refusalReason.trim())}
                    >
                        {isPending
                            ? t("dialog.waiting")
                            : action === "accept"
                                ? t("dialog.accept.action")
                                : t("dialog.refused.action")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};