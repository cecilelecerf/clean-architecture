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

export default function AdminCreditDetailPage({
    params,
}: {
    params: Promise<{ creditId: CreditId }>;
}) {
    const { creditId } = use(params);
    const router = useRouter();
    const query = useQuery(endpoints.credits.getOneWithDetails({ creditId }));
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"accept" | "refuse">("accept");
    const [reason, setReason] = useState("");

    const grantMutation = useMutation(endpoints.credits.grant({ creditId }));

    const handleAccept = () => {
        setDialogAction("accept");
        setDialogOpen(true);
    };

    const handleRefuse = () => {
        setDialogAction("refuse");
        setDialogOpen(true);
    };

    const confirmAction = (userId: UserId) => {
        grantMutation.mutate({
            payload: {
                accept: dialogAction === "accept",
                reason: reason.trim() || null
            }, userId
        }, {
            onSuccess: () => {
                setDialogOpen(false);
                setReason("");
            },
        });
    };

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
                .with({ status: "success" }, ({ data: credit }) => {
                    const isFuture = new Date(credit.startDate) > new Date();
                    const config =
                        credit.status === "ACCEPTED" && isFuture
                            ? statusConfig.ACCEPTED_FUTURE
                            : statusConfig[credit.status];
                    const StatusIcon = config.icon;

                    // Calculer la progression
                    const totalAmount = credit.initialAmount.amount;
                    const remainingAmount = credit.remainingBalance.amount;
                    const paidAmount = totalAmount - remainingAmount;
                    const progressPercentage = Math.round((paidAmount / totalAmount) * 100);

                    const isPending = credit.status === "PENDING";

                    return (


                        <div className="space-y-6">
                            {/* Card principale - Statut */}
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
                                            <p className="text-sm text-gray-600 mb-1">
                                                Demande créée le {formatDateFrench(credit.createdAt)}
                                            </p>
                                        </div>
                                        <Badge variant={config.variant} className="text-base px-4 py-2">
                                            {config.label}
                                        </Badge>
                                    </div>

                                    {/* Actions pour les crédits en attente */}
                                    {isPending && (
                                        <div className="flex gap-3 mt-4 pt-4 border-t border-yellow-300">
                                            <Button
                                                className="flex-1"
                                                onClick={handleAccept}
                                                disabled={grantMutation.isPending}
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                Accepter la demande
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                className="flex-1"
                                                onClick={handleRefuse}
                                                disabled={grantMutation.isPending}
                                            >
                                                <X className="w-4 h-4 mr-2" />
                                                Refuser la demande
                                            </Button>
                                        </div>
                                    )}

                                    {/* Messages selon le statut */}
                                    {credit.status === "PENDING" && (
                                        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                ⏳ Cette demande est en attente de validation. Examinez les informations ci-dessous avant de prendre une décision.
                                            </p>
                                        </div>
                                    )}

                                    {isFuture && credit.status === "ACCEPTED" && (
                                        <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                                            <p className="text-sm text-blue-800 font-medium mb-1">
                                                📅 Ce crédit débutera le {formatDateFrench(credit.startDate)}
                                            </p>
                                            <p className="text-xs text-blue-700">
                                                Les prélèvements automatiques commenceront à cette date.
                                            </p>
                                        </div>
                                    )}

                                    {
                                        credit.status === "REFUSED" && credit.reason && (
                                            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                                                <p className="text-sm text-red-800 font-medium mb-1">
                                                    ❌ Refus
                                                </p>
                                                <p className="text-sm text-red-700">{credit.reason}</p>
                                            </div>
                                        )
                                    }
                                    {
                                        credit.status === "COMPLETED" && (
                                            <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                                                <p className="text-sm text-green-800">
                                                    ✅ Ce crédit est entièrement remboursé.
                                                </p>
                                            </div>
                                        )
                                    }
                                </CardContent >
                            </Card >



                            {/* Informations du client */}
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => router.push(`/admin/users/${credit.account.userId}`)}
                            >
                                <User className="w-5 h-5" /> Voir le profil client
                            </Button>
                            {
                                (credit.status === "ACCEPTED" && !isFuture) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5" />
                                                Progression du remboursement
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm text-gray-600">
                                                        {progressPercentage}% remboursé
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
                                                    <p className="text-xs text-gray-600 mb-1">Montant payé</p>
                                                    <p className="text-xl font-bold text-green-600">
                                                        {paidAmount.toLocaleString("fr-FR", {
                                                            style: "currency",
                                                            currency: credit.initialAmount.currency,
                                                        })}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>)}
                            {/* Progression du remboursement */}

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5" />
                                        Caractéristiques de la formule du  crédit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Type className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Type du crédit</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.formule.type}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Label du crédit</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.formule.label}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Percent className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Taux d'intérêt</p>
                                                    <p className="text-lg font-semibold">{credit.formule.interestRate}%</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Taux d'assurance</p>
                                                    <p className="text-lg font-semibold">{credit.formule.insuranceRate}%</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Montant minimum</p>
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
                                                    <p className="text-sm text-gray-600">Montant maximum</p>
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
                            {/* Détails du crédit */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5" />
                                        Caractéristiques du crédit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Montant emprunté</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.initialAmount.amount.toLocaleString("fr-FR", {
                                                            style: "currency",
                                                            currency: credit.initialAmount.currency,
                                                        })}
                                                    </p>
                                                </div>

                                                <div className="p-4 bg-orange-50 rounded-lg">
                                                    <p className="text-xs text-gray-600 mb-1">Reste à payer</p>
                                                    <p className="text-xl font-bold text-orange-600">
                                                        {remainingAmount.toLocaleString("fr-FR", {
                                                            style: "currency",
                                                            currency: credit.remainingBalance.currency,
                                                        })}
                                                    </p>
                                                </div>
                                            </div >
                                        </div >

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <CalendarClock className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Date de début</p>
                                                    <p className="text-lg font-semibold">
                                                        {formatDateFrench(credit.startDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Mensualité</p>
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
                                </CardContent>
                            </Card>


                            {/* Détails du crédit */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5" />
                                        Caractéristiques du crédit
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Montant emprunté</p>
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
                                                    <p className="text-sm text-gray-600">Durée du crédit</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.durationMonths} mois
                                                        ({Math.round(credit.durationMonths / 12)} ans)
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Percent className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Taux d'intérêt</p>
                                                    <p className="text-lg font-semibold">{credit.formule.interestRate}%</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Taux d'assurance</p>
                                                    <p className="text-lg font-semibold">{credit.formule.insuranceRate}%</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <CalendarClock className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Date de début</p>
                                                    <p className="text-lg font-semibold">
                                                        {formatDateFrench(credit.startDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Mensualité</p>
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

                            {/* Détails de l'utilisateur */}
                            < Card >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <UserCog className="w-5 h-5" />
                                        Détail sur l'utilisateur
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Nom</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.account.user.lastname}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <AtSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Email</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.account.user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Prénom</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.account.user.firstname}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* TODO: Ajouter le statut professionnel dans l'entité user */}
                                            <div className="flex items-start gap-3">
                                                <BriefcaseBusiness className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Statut professionnel</p>
                                                    <p className="text-lg font-semibold">
                                                        Employé
                                                        {/* {credit.account.user.profesionalStatus} */}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card >

                            {/* Détails du compte */}
                            < Card >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <WalletMinimal className="w-5 h-5" />
                                        Détail du compte
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">IBAN</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.account.IBAN}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <ArrowBigRight className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Nom</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.account.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <Type className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Type</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.account.type}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Balance actuelle</p>
                                                    <p className="text-lg font-semibold">
                                                        {credit.account.amount.toLocaleString("fr-FR", {
                                                            style: "currency",
                                                            currency: credit.account.currency,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card >

                            {/* Dialog de confirmation */}
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {dialogAction === "accept"
                                                ? "Accepter la demande de crédit"
                                                : "Refuser la demande de crédit"}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {dialogAction === "accept"
                                                ? "Êtes-vous sûr de vouloir accepter cette demande ? Le client sera notifié et le crédit sera activé."
                                                : "Veuillez indiquer la raison du refus. Le client recevra cette information."}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {dialogAction === "refuse" && (
                                        <Textarea
                                            placeholder="Raison du refus (ex: revenus insuffisants, taux d'endettement trop élevé...)"
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
                                            Annuler
                                        </Button>
                                        <Button
                                            variant={dialogAction === "accept" ? "default" : "destructive"}
                                            onClick={() => confirmAction(credit.account.userId)}
                                            disabled={
                                                grantMutation.isPending ||
                                                (dialogAction === "refuse" && !reason.trim())
                                            }
                                        >
                                            {grantMutation.isPending
                                                ? "En cours..."
                                                : dialogAction === "accept"
                                                    ? "Confirmer l'acceptation"
                                                    : "Confirmer le refus"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div >
                    )


                })
                .exhaustive()}

        </>
    );
}

const CreditDetailSkeleton = () => (
    <div className="space-y-6">
        <Card>
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-8 w-40" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-32 rounded-full" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    </div>
);