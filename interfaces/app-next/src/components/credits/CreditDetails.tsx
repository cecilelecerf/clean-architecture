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
import { CreditDTOWithFormule } from "@infrastructure/types/credit";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
    Calendar,
    Percent,
    TrendingUp,
    CalendarClock,
    DollarSign,
    User,
    Shield,
    Check,
    X,
    Building2,
    Tag,
    UserCog,
    AtSign,
    WalletMinimal,
    BriefcaseBusiness,
    ArrowBigRight,
    Type
} from "lucide-react";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { useState } from "react";
import { statusConfig } from "./constant";
import { AccountWithUserDTO } from "@infrastructure/types/account";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";


export const CreditDetails = ({ credit, account }: { credit: CreditDTOWithFormule, account: AccountWithUserDTO }) => {
    const { data: session } = useSession();

    const router = useRouter()
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"accept" | "refuse">("accept");
    const [reason, setReason] = useState("");

    const grantMutation = useMutation(endpoints.credits.grant({ creditId: credit.id }));

    const t = useTranslations("credit.details");

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
            payload: {
                accept: dialogAction === "accept",
                reason: reason.trim() || null
            }
        }, {
            onSuccess: () => {
                setDialogOpen(false);
                setReason("");
            },
        });
    };
    const isFuture = new Date(credit.startDate) > new Date();
    const config =
        credit.status === "ACCEPTED" && isFuture
            ? statusConfig.ACCEPTED_FUTURE
            : statusConfig[credit.status];
    const StatusIcon = config.icon;

    const totalAmount = credit.initialAmount.amount;
    const remainingAmount = credit.remainingBalance.amount;
    const paidAmount = totalAmount - remainingAmount;
    const progressPercentage = Math.round((paidAmount / totalAmount) * 100);

    const isPending = credit.status === "PENDING";
    const isAdmin = session.user.role !== "client"
    return (
        <div className="space-y-6">
            <Card className={`${config.bgColor} border-2 ${config.borderColor}`}>
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <StatusIcon className={`w-6 h-6 ${config.color}`} />
                                <h2 className="text-2xl font-bold">
                                    {credit.initialAmount.amount.toLocaleString("fr-FR", {
                                        style: "currency",
                                        currency: credit.initialAmount.currency,
                                    })}
                                </h2>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-500 mb-1">
                                {t("request")} {formatDateFrench(credit.createdAt)}
                            </p>
                        </div>
                        <Badge variant={config.variant} className="text-xs px-2">
                            {config.label}
                        </Badge>
                    </div>

                    {isPending && isAdmin && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-yellow-300 dark:border-yellow-600">
                            <Button
                                className="flex-1"
                                onClick={handleAccept}
                                disabled={grantMutation.isPending}
                            >
                                <Check className="w-4 h-4 mr-2" />
                                {t("accept")}
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={handleRefuse}
                                disabled={grantMutation.isPending}
                            >
                                <X className="w-4 h-4 mr-2" />
                                {t("refuse")}
                            </Button>
                        </div>
                    )}

                    {/* Messages selon le statut */}
                    {credit.status === "PENDING" && config.message && (
                        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg  dark:bg-yellow-100/10 dark:border-yellow-600">
                            <p className="text-sm text-yellow-800 dark:text-yellow-600">
                                {!isAdmin ? config.message.client : config.message.advisor}
                            </p>
                        </div>
                    )}

                    {isFuture && credit.status === "ACCEPTED" && (
                        <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg dark:bg-blue-300/10 dark:border-blue-900">
                            <p className="text-sm text-blue-800 font-medium mb-1 dark:text-blue-500">
                                📅 {t("start")} {formatDateFrench(credit.startDate)}
                            </p>
                            <p className="text-xs text-blue-700 dark:text-blue-500">
                                {t("debits")}
                            </p>
                        </div>
                    )}

                    {
                        credit.status === "REFUSED" && credit.reason && (
                            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg dark:bg-red-300/10 dark:border-red-900">
                                <p className="text-sm text-red-800 font-medium mb-1">
                                    {!isAdmin ? config.message.client : config.message.advisor}
                                </p>
                                <p className="text-sm text-red-700">{credit.reason}</p>
                            </div>
                        )
                    }
                    {
                        credit.status === "COMPLETED" && (
                            <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                                <p className="text-sm text-green-800">
                                    {!isAdmin ? config.message.client : config.message.advisor}
                                </p>
                            </div>
                        )
                    }
                </CardContent >
            </Card >

            {
                (credit.status === "ACCEPTED" && !isFuture) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                {t("progress")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-500">
                                        {progressPercentage}% {t("refund")}
                                    </span>
                                    <span className="text-sm font-medium">
                                        {paidAmount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.initialAmount.currency,
                                        })}{" "}
                                        / {totalAmount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.initialAmount.currency,
                                        })}
                                    </span>
                                </div>
                                <Progress value={progressPercentage} className="h-3" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-500 mb-1">{t("amount")}</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {paidAmount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.initialAmount.currency,
                                        })}</p>
                                </div>

                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-500 mb-1">{t("still")}r</p>
                                    <p className="text-xl font-bold text-orange-600">
                                        {remainingAmount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.remainingBalance.currency,
                                        })}
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-500 mb-1">{t("monthly")}</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {credit.monthlyPayment.amount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.remainingBalance.currency,
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>)}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {t("formula.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Type className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("formula.type")}</p>
                                    <p className="text-lg font-semibold">
                                        {credit.formule.type}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("formula.label")}</p>
                                    <p className="text-lg font-semibold">
                                        {credit.formule.label}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Percent className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("formula.interest")}</p>
                                    <p className="text-lg font-semibold">{credit.formule.interestRate}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("formula.insurance")}</p>
                                    <p className="text-lg font-semibold">{credit.formule.insuranceRate}%</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("formula.minAmount")}</p>
                                    <p className="text-lg font-semibold">
                                        {credit.formule.minAmount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.formule.currency,
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("formula.maxAmount")}</p>
                                    <p className="text-lg font-semibold">
                                        {credit.formule.maxAmount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.formule.currency,
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {t("credit.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("credit.amount")}</p>
                                    <p className="text-lg font-semibold">
                                        {credit.initialAmount.amount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.initialAmount.currency,
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("credit.duration")}</p>
                                    <p className="text-lg font-semibold">
                                        {credit.durationMonths} {t("credit.month")}
                                        ({Math.round(credit.durationMonths / 12)} {t("credit.year")})
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CalendarClock className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("credit.start")}</p>
                                    <p className="text-lg font-semibold">
                                        {formatDateFrench(credit.startDate)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-500">{t("credit.monthly")}</p>
                                    <p className="text-lg font-semibold">
                                        {credit.monthlyPayment.amount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.monthlyPayment.currency,
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent >
            </Card >

            {isAdmin && (
                <>
                    < Card >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="w-5 h-5" />
                                {t("user.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-500">{t("user.lastname")}</p>
                                            <p className="text-lg font-semibold">
                                                {account.user.lastname}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <AtSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-500">{t("user.email")}</p>
                                            <p className="text-lg font-semibold">
                                                {account.user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-500">{t("user.firstname")}</p>
                                            <p className="text-lg font-semibold">
                                                {account.user.firstname}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <BriefcaseBusiness className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-500">{t("credit.status")}</p>
                                            <p className="text-lg font-semibold">
                                                Employé
                                                {/* {account.user.profesionalStatus} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <Button variant='link' className="w-full" size="sm" onClick={() => router.push(`/admin/users/${account.user.id}`)}>{t("user.more")}</Button>
                        </CardContent>
                    </Card >

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <WalletMinimal className="w-5 h-5" />
                                {t("account.title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-500">IBAN</p>
                                            <p className="text-lg font-semibold">
                                                {account.IBAN}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <ArrowBigRight className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-500">{t("account.name")}</p>
                                            <p className="text-lg font-semibold">
                                                {account.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Type className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-500">{t("account.type")}</p>
                                            <p className="text-lg font-semibold">
                                                {account.type}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-500">{t("account.balance")}</p>
                                            <p className="text-lg font-semibold">
                                                {account.balance.amount.toLocaleString("fr-FR", {
                                                    style: "currency",
                                                    currency: account.balance.currency,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button variant='link' className="w-full" size="sm" onClick={() => router.push(`/admin/accounts/${account.IBAN}`)}>{t("account.more")}</Button>

                        </CardContent>
                    </Card >

                    {/* Dialog de confirmation */}
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {dialogAction === "accept"
                                        ? t("dialog.accept.title")
                                        : t("dialog.refused.title")}
                                </DialogTitle>
                                <DialogDescription>
                                    {dialogAction === "accept"
                                        ? t("dialog.accept.description")
                                        : t("dialog.refused.description")}
                                </DialogDescription>
                            </DialogHeader>

                            {dialogAction === "refuse" && (
                                <Textarea
                                    placeholder={t("dialog.refused.placeholder")}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            )}

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setDialogOpen(false);
                                        setReason("");
                                    }}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    variant={dialogAction === "accept" ? "default" : "destructive"}
                                    onClick={() => confirmAction()}
                                    disabled={
                                        grantMutation.isPending ||
                                        (dialogAction === "refuse" && !reason.trim())
                                    }
                                >
                                    {grantMutation.isPending
                                        ? t("dialog.waiting")
                                        : dialogAction === "accept"
                                            ? t("dialog.accept.action")
                                            : t("dialog.refused.action")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div >
    )
}

export const CreditDetailSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-8 w-40" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-32 rounded-full" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-3 w-full" />
                <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                    <Skeleton className="h-20 rounded-lg" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);