"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    TrendingDown,
    TrendingUp,
    Minus,
    Plus,
    Wallet,
    AlertCircle,
    Calculator,
    X,
    Clock,
    DollarSign,
} from "lucide-react";
import { Action } from "@infrastructure/types/action";
import { useState } from "react";
import { toast } from "sonner";
import { AccountId } from "@infrastructure/types/account";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ButtonLoading } from "@/components/buttons/ButtonLoading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PortfolioPosition } from "@infrastructure/types/order";

type OrderMode = "immediate" | "scheduled" | "limit";

type SellAction = {
    quantity: number;
    accountId: AccountId;
    limitPrice?: { amount: number; currency: string };
    scheduledFor?: string;
};

type Props = {
    action: Action;
    sellOpen: boolean;
    closeSell: () => void;
}
export const ActionSellContainer = ({ action, closeSell, sellOpen }: Props) => {
    const portfolioQuery = useQuery(endpoints.orders.portfolio.getByISIN({ ISIN: action.ISIN }))
    return match(portfolioQuery)
        .with({ status: "error" }, () => "erro")
        .with(({ status: "pending" }), () => 'pending')
        .with(({ status: "success" }), ({ data: portfolio }) => <ActionSell portfolioPosition={portfolio} closeSell={closeSell} sellOpen={sellOpen} action={action} />)
        .exhaustive()

}
const ActionSell = ({
    action,
    sellOpen,
    closeSell,
    portfolioPosition: position
}: Props & { portfolioPosition: PortfolioPosition }) => {
    const [orderMode, setOrderMode] = useState<OrderMode>("immediate");
    const [sellAmount, setSellAmount] = useState<SellAction>({
        quantity: 1,
        accountId: "" as AccountId,
    });
    const [limitPrice, setLimitPrice] = useState<string>("");
    const [scheduledDate, setScheduledDate] = useState<string>("");
    const [scheduledTime, setScheduledTime] = useState<string>("09:00");

    const accountsQuery = useQuery(endpoints.accounts.getAllByMe());
    const sellMutation = useMutation(endpoints.actions.sell({ isin: action.ISIN }));

    const unitPrice = action.currentPrice.amount;
    const effectivePrice = orderMode === "limit" && limitPrice ? parseFloat(limitPrice) : unitPrice;
    const totalSaleValue = effectivePrice * sellAmount.quantity;

    const costBasis = position.averagePrice * sellAmount.quantity;
    const estimatedGainLoss = totalSaleValue - costBasis;
    const estimatedGainLossPercent = (estimatedGainLoss / costBasis) * 100;

    const handleSell = () => {
        if (sellAmount.quantity <= 0 || sellAmount.quantity > position.quantity) {
            toast.error("Quantité invalide");
            return;
        }

        if (!sellAmount.accountId) {
            toast.error("Veuillez sélectionner un compte");
            return;
        }

        if (orderMode === "limit" && !limitPrice) {
            toast.error("Veuillez spécifier un prix limite");
            return;
        }

        if (orderMode === "scheduled" && !scheduledDate) {
            toast.error("Veuillez spécifier une date");
            return;
        }

        const payload: SellAction = {
            quantity: sellAmount.quantity,
            accountId: sellAmount.accountId,
        };

        if (orderMode === "limit" && limitPrice) {
            payload.limitPrice = {
                amount: parseFloat(limitPrice),
                currency: action.currentPrice.currency,
            };
        }

        if (orderMode === "scheduled" && scheduledDate && scheduledTime) {
            const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`);
            payload.scheduledFor = scheduledDateTime.toISOString();
        }

        sellMutation.mutate(
            { payload },
            {
                onSuccess: () => {
                    if (orderMode === "immediate") {
                        toast.success(
                            `Vous avez vendu ${sellAmount.quantity} action(s) de ${action.symbol}`
                        );
                    } else if (orderMode === "limit") {
                        toast.success(
                            `Ordre de vente à cours limité créé. Il sera exécuté si le prix atteint ${limitPrice} ${action.currentPrice.currency}`
                        );
                    } else {
                        toast.success(
                            `Ordre de vente programmé créé pour le ${new Date(
                                `${scheduledDate}T${scheduledTime}`
                            ).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}`
                        );
                    }
                    setSellAmount({ quantity: 1, accountId: "" as AccountId });
                    setLimitPrice("");
                    setScheduledDate("");
                    setScheduledTime("09:00");
                    closeSell();
                },
                onError: (error) => {
                    toast.error(error.message || "Erreur lors de la vente");
                },
            }
        );
    };

    const incrementQuantity = () => {
        if (sellAmount.quantity < position.quantity) {
            setSellAmount((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
        }
    };

    const decrementQuantity = () => {
        if (sellAmount.quantity > 1) {
            setSellAmount((prev) => ({ ...prev, quantity: prev.quantity - 1 }));
        }
    };

    const setMaxQuantity = () => {
        setSellAmount((prev) => ({ ...prev, quantity: position.quantity }));
    };

    return (
        <>
            {sellOpen && (
                <Card className="overflow-hidden py-0 border-none bg-linear-to-br from-green-50/50 to-emerald-50/30">
                    <CardHeader className="bg-linear-to-r from-green-600 to-emerald-700 text-white py-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingDown className="w-5 h-5" />
                                    Vendre des actions
                                </CardTitle>
                                <CardDescription className="text-sm text-white/80">
                                    {action.symbol} • Position: {position.quantity} actions
                                </CardDescription>
                            </div>
                            <Button
                                className="bg-gray-100/20 text-white hover:bg-gray-100/30"
                                onClick={() => closeSell()}
                                variant="ghost"
                                size="icon"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5 p-4 md:p-6">
                        <Tabs value={orderMode} onValueChange={(v) => setOrderMode(v as OrderMode)}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="immediate" className="text-xs sm:text-sm">
                                    <TrendingDown className="w-4 h-4 mr-1 hidden sm:inline" />
                                    Immédiat
                                </TabsTrigger>
                                <TabsTrigger value="limit" className="text-xs sm:text-sm">
                                    <DollarSign className="w-4 h-4 mr-1 hidden sm:inline" />
                                    Prix limite
                                </TabsTrigger>
                                <TabsTrigger value="scheduled" className="text-xs sm:text-sm">
                                    <Clock className="w-4 h-4 mr-1 hidden sm:inline" />
                                    Programmé
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="immediate" className="space-y-4 mt-4">
                                <div className="bg-white rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <TrendingUp className="w-4 h-4" />
                                            Prix de vente actuel
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">
                                                {unitPrice.toLocaleString("fr-FR", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}{" "}
                                                {action.currentPrice.currency}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-xs text-green-700">
                                        ⚡ Votre ordre sera exécuté immédiatement au prix du marché
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="limit" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="limitPrice" className="text-sm font-medium">
                                        Prix limite de vente
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="limitPrice"
                                            type="number"
                                            step="0.01"
                                            value={limitPrice}
                                            onChange={(e) => setLimitPrice(e.target.value)}
                                            placeholder={`Ex: ${unitPrice.toFixed(2)}`}
                                            className="text-lg font-semibold"
                                        />
                                        <Badge variant="outline">{action.currentPrice.currency}</Badge>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Prix actuel: {unitPrice.toFixed(2)} {action.currentPrice.currency}
                                    </p>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                    <p className="text-xs text-orange-700">
                                        📊 L'ordre sera exécuté uniquement si le prix atteint{" "}
                                        {limitPrice || "___"} {action.currentPrice.currency} ou plus
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="scheduled" className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduledDate" className="text-sm font-medium">
                                            Date
                                        </Label>
                                        <Input
                                            id="scheduledDate"
                                            type="date"
                                            value={scheduledDate}
                                            onChange={(e) => setScheduledDate(e.target.value)}
                                            min={new Date().toISOString().split("T")[0]}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scheduledTime" className="text-sm font-medium">
                                            Heure
                                        </Label>
                                        <Input
                                            id="scheduledTime"
                                            type="time"
                                            value={scheduledTime}
                                            onChange={(e) => setScheduledTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                    <p className="text-xs text-purple-700">
                                        ⏰ L'ordre sera exécuté automatiquement à la date et l'heure spécifiées
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Quantité */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-sm font-medium">
                                Quantité à vendre
                            </Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={decrementQuantity}
                                    disabled={sellAmount.quantity <= 1}
                                    className="h-10 w-10"
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min={1}
                                    max={position.quantity}
                                    value={sellAmount.quantity}
                                    onChange={(e) =>
                                        setSellAmount((prev) => ({
                                            ...prev,
                                            quantity: Math.min(
                                                Math.max(1, Number(e.target.value)),
                                                position.quantity
                                            ),
                                        }))
                                    }
                                    className="text-center text-lg font-semibold h-10"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={incrementQuantity}
                                    disabled={sellAmount.quantity >= position.quantity}
                                    className="h-10 w-10"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">
                                    Disponible: {position.quantity} actions
                                </span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-green-600"
                                    onClick={setMaxQuantity}
                                >
                                    Tout vendre
                                </Button>
                            </div>
                        </div>

                        {/* Compte de crédit */}
                        <div className="space-y-2">
                            <Label htmlFor="account" className="text-sm font-medium flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                Compte de crédit
                            </Label>
                            {match(accountsQuery)
                                .with({ status: "error" }, () => (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                        <AlertCircle className="w-4 h-4" />
                                        Erreur lors du chargement des comptes
                                    </div>
                                ))
                                .with({ status: "pending" }, () => (
                                    <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
                                ))
                                .with({ status: "success" }, ({ data: accounts }) => (
                                    <Select
                                        value={sellAmount.accountId}
                                        onValueChange={(value) =>
                                            setSellAmount((prev) => ({ ...prev, accountId: value as AccountId }))
                                        }
                                    >
                                        <SelectTrigger className="h-10">
                                            <SelectValue placeholder="Sélectionnez un compte" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((account) => (
                                                <SelectItem key={account.IBAN} value={account.IBAN}>
                                                    <div className="flex items-center justify-between w-full gap-4">
                                                        <span className="font-medium">{account.name}</span>
                                                        <span className="text-sm text-gray-600">
                                                            {account.amount.toLocaleString("fr-FR", {
                                                                minimumFractionDigits: 2,
                                                            })}{" "}
                                                            {account.currency}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ))
                                .exhaustive()}
                        </div>

                        <Separator />

                        {/* Récapitulatif */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                <Calculator className="w-4 h-4" />
                                Récapitulatif de la vente
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">
                                        {sellAmount.quantity} × {effectivePrice.toFixed(2)}{" "}
                                        {action.currentPrice.currency}
                                    </span>
                                    <span className="font-medium">
                                        {totalSaleValue.toLocaleString("fr-FR", {
                                            minimumFractionDigits: 2,
                                        })}{" "}
                                        {action.currentPrice.currency}
                                    </span>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-center pt-1">
                                    <span className="font-semibold text-gray-900">Montant à recevoir</span>
                                    <span className="text-xl font-bold text-green-600">
                                        {totalSaleValue.toLocaleString("fr-FR", {
                                            minimumFractionDigits: 2,
                                        })}{" "}
                                        {action.currentPrice.currency}
                                    </span>
                                </div>

                                {/* Plus-value estimée */}
                                {sellAmount.quantity > 0 && (
                                    <>
                                        <Separator />
                                        <div className="flex justify-between items-center bg-white rounded p-2">
                                            <span className="text-xs text-gray-600">
                                                Plus-value estimée
                                            </span>
                                            <div className="text-right">
                                                <span
                                                    className={`text-sm font-semibold ${estimatedGainLoss >= 0
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                        }`}
                                                >
                                                    {estimatedGainLoss >= 0 ? "+" : ""}
                                                    {estimatedGainLoss.toLocaleString("fr-FR", {
                                                        minimumFractionDigits: 2,
                                                    })}{" "}
                                                    {action.currentPrice.currency}
                                                </span>
                                                <span
                                                    className={`text-xs ml-2 ${estimatedGainLoss >= 0
                                                        ? "text-green-600"
                                                        : "text-red-600"
                                                        }`}
                                                >
                                                    ({estimatedGainLoss >= 0 ? "+" : ""}
                                                    {estimatedGainLossPercent.toFixed(2)}%)
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Bouton de vente */}
                        <ButtonLoading
                            loading={sellMutation.isPending}
                            onClick={handleSell}
                            disabled={
                                !sellAmount.accountId ||
                                sellAmount.quantity <= 0 ||
                                sellAmount.quantity > position.quantity ||
                                (orderMode === "limit" && !limitPrice) ||
                                (orderMode === "scheduled" && !scheduledDate)
                            }
                            className="w-full bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 h-11 text-base font-semibold"
                        >
                            {match(orderMode)
                                .with("immediate", () => (
                                    <>
                                        <TrendingDown className="w-5 h-5 mr-2" />
                                        Vendre maintenant
                                    </>
                                ))
                                .with("limit", () => (
                                    <>
                                        <DollarSign className="w-5 h-5 mr-2" />
                                        Créer l'ordre de vente à cours limité
                                    </>
                                ))
                                .with("scheduled", () => (
                                    <>
                                        <Clock className="w-5 h-5 mr-2" />
                                        Programmer la vente
                                    </>
                                ))
                                .exhaustive()}
                        </ButtonLoading>

                        <p className="text-xs text-center text-gray-500 mt-2">
                            La vente sera exécutée{" "}
                            {orderMode === "immediate"
                                ? "immédiatement au prix du marché"
                                : orderMode === "limit"
                                    ? "si le prix atteint votre limite"
                                    : "à la date et l'heure programmées"}
                        </p>
                    </CardContent>
                </Card>
            )}
        </>
    );
};