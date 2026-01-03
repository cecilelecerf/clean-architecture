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
import { CreditDTOWithFormule, CreditId } from "@infrastructure/types/credit";
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
import { statusConfig } from "./constant";
import { Account, AccountWithUserDTO } from "@infrastructure/types/account";
import { useSession } from "next-auth/react";


export const CreditDetails = ({ credit, account }: { credit: CreditDTOWithFormule, account: AccountWithUserDTO }) => {
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;

    const router = useRouter()
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<"accept" | "refuse">("accept");
    const [reason, setReason] = useState("");

    const grantMutation = useMutation(endpoints.credits.grant({ creditId: credit.id }));

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
    const isAdmin = session.user.role !== "client"
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
                        <Badge variant={config.variant} className="text-xs px-2">
                            {config.label}
                        </Badge>
                    </div>

                    {/* Actions pour les crédits en attente */}
                    {isPending && isAdmin && (
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
                    {credit.status === "PENDING" && config.message && (
                        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                {!isAdmin ? config.message.client : config.message.advisor}
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
                                    {!isAdmin ? config.message.client : config.message.advisor}                                </p>
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

                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Reste à payer</p>
                                    <p className="text-xl font-bold text-orange-600">
                                        {remainingAmount.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: credit.remainingBalance.currency,
                                        })}
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Mensualité</p>
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

                        </div>

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
                </CardContent >
            </Card >

            {/* Détails de l'utilisateur */}
            {isAdmin && (
                <>
                    < Card >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="w-5 h-5" />
                                Détail sur l'utilisateur
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Nom</p>
                                            <p className="text-lg font-semibold">
                                                {account.user.lastname}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <AtSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
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
                                            <p className="text-sm text-gray-600">Prénom</p>
                                            <p className="text-lg font-semibold">
                                                {account.user.firstname}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <BriefcaseBusiness className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Statut professionnel</p>
                                            <p className="text-lg font-semibold">
                                                Employé
                                                {/* {account.user.profesionalStatus} */}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <Button variant='link' className="w-full" size="sm" onClick={() => router.push(`/admin/users/${account.user.id}`)}>Voir le client</Button>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">IBAN</p>
                                            <p className="text-lg font-semibold">
                                                {account.IBAN}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <ArrowBigRight className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Nom</p>
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
                                            <p className="text-sm text-gray-600">Type</p>
                                            <p className="text-lg font-semibold">
                                                {account.type}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-600">Balance actuelle</p>
                                            <p className="text-lg font-semibold">
                                                {account.amount.toLocaleString("fr-FR", {
                                                    style: "currency",
                                                    currency: account.currency,
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button variant='link' className="w-full" size="sm" onClick={() => router.push(`/admin/accounts/${account.IBAN}`)}>Voir le compte</Button>

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
                                    onClick={() => confirmAction(account.userId)}
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