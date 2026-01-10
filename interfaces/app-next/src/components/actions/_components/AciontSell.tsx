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
} from "lucide-react";
import { Action } from "@infrastructure/types/action";
import { useState } from "react";
import { toast } from "sonner";
import { AccountId } from "@infrastructure/types/account";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ButtonLoading } from "@/components/buttons/ButtonLoading";
import { BuyAction, PortfolioPosition } from "@infrastructure/types/order";

type Props = {
    action: Action;
    sellOpen: boolean;
    closeSell: () => void;
};

export const ActionSellContainer = ({ action, closeSell, sellOpen }: Props) => {
    const portfolioQuery = useQuery(endpoints.orders.actions.portfolio({ ISIN: action.ISIN }));

    return match(portfolioQuery)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with(
            { status: "success" },
            ({ data: portfolio }) => (
                <ActionSell
                    portfolioPosition={portfolio}
                    closeSell={closeSell}
                    sellOpen={sellOpen}
                    action={action}
                />
            )
        )
        .exhaustive();
};

const ActionSell = ({
    action,
    sellOpen,
    closeSell,
    portfolioPosition: position,
}: Props & { portfolioPosition: PortfolioPosition }) => {
    const [sellAmount, setSellAmount] = useState<BuyAction>({
        quantity: 1,
        IBAN: "" as AccountId,
        price: action.price,
    });

    const accountsQuery = useQuery(endpoints.accounts.getAllByMe());
    const sellMutation = useMutation(endpoints.orders.actions.placeOrder({ ISIN: action.ISIN, type: "sell" }));

    const totalSaleValue = sellAmount.price.amount * sellAmount.quantity;
    const costBasis = position.averagePrice * sellAmount.quantity;
    const estimatedGainLoss = totalSaleValue - costBasis;
    const estimatedGainLossPercent = (estimatedGainLoss / costBasis) * 100;

    const handleSell = () => {
        if (sellAmount.quantity <= 0 || sellAmount.quantity > position.quantity) {
            toast.error("Quantité invalide");
            return;
        }
        if (!sellAmount.IBAN) {
            toast.error("Veuillez sélectionner un compte");
            return;
        }
        sellMutation.mutate(
            { payload: sellAmount },
            {
                onSuccess: (data) => {
                    toast.success(`Vous avez vendu ${sellAmount.quantity} action(s) de ${action.symbol}`);
                    setSellAmount({ quantity: 1, IBAN: "" as AccountId, price: data.price });
                    closeSell();
                },
                onError: (error: any) => toast.error(error.message || "Erreur lors de la vente"),
            }
        );
    };

    const incrementQuantity = () => {
        if (sellAmount.quantity < position.quantity)
            setSellAmount((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
    };
    const decrementQuantity = () => {
        if (sellAmount.quantity > 1)
            setSellAmount((prev) => ({ ...prev, quantity: prev.quantity - 1 }));
    };
    const setMaxQuantity = () => setSellAmount((prev) => ({ ...prev, quantity: position.quantity }));

    return (
        <>
            {sellOpen && (
                <Card className="overflow-hidden py-0 border-none bg-linear-to-br from-green-50/50 to-emerald-50/30 dark:from-green-900/20 dark:to-emerald-900/20">
                    <CardHeader className="bg-linear-to-r from-green-600 to-emerald-700 dark:from-green-800 dark:to-emerald-800 text-white py-4">
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
                                className="bg-gray-100/20 text-white hover:bg-gray-100/30 dark:bg-gray-800/30 dark:hover:bg-gray-800/50"
                                onClick={closeSell}
                                variant="ghost"
                                size="icon"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5 p-4 md:p-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <TrendingUp className="w-4 h-4" />
                                    Prix de vente actuel
                                </div>
                                <div className="relative">
                                    <Input
                                        id="price"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={sellAmount.price.amount}
                                        onChange={(e) =>
                                            setSellAmount((prev) => ({
                                                ...prev,
                                                price: { amount: Number(e.target.value), currency: prev.price.currency },
                                            }))
                                        }
                                        className="w-full text-3xl font-bold text-green-600 dark:text-green-300 bg-white dark:bg-gray-900 border border-green-500 dark:border-green-700 rounded-xl px-4 py-3 pr-16 text-right focus:ring-2 focus:ring-green-800 focus:border-green-800 transition-all"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-green-600 dark:text-green-300 pointer-events-none">
                                        {action.price.currency}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-sm font-medium dark:text-gray-300">
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
                                            quantity: Math.min(Math.max(1, Number(e.target.value)), position.quantity),
                                        }))
                                    }
                                    className="text-center text-lg font-semibold h-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md"
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
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>Disponible: {position.quantity} actions</span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-green-600 dark:text-green-400"
                                    onClick={setMaxQuantity}
                                >
                                    Tout vendre
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="account" className="text-sm font-medium flex items-center gap-2 dark:text-gray-300">
                                <Wallet className="w-4 h-4" />
                                Compte de crédit
                            </Label>
                            {match(accountsQuery)
                                .with({ status: "error" }, () => (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                                        <AlertCircle className="w-4 h-4" />
                                        Erreur lors du chargement des comptes
                                    </div>
                                ))
                                .with({ status: "pending" }, () => (
                                    <div className="h-10 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg" />
                                ))
                                .with({ status: "success" }, ({ data: accounts }) => (
                                    <Select
                                        value={sellAmount.IBAN}
                                        onValueChange={(value) =>
                                            setSellAmount((prev) => ({ ...prev, IBAN: value as AccountId }))
                                        }
                                    >
                                        <SelectTrigger className="h-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md">
                                            <SelectValue placeholder="Sélectionnez un compte" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                                            {accounts.map((account) => (
                                                <SelectItem key={account.IBAN} value={account.IBAN}>
                                                    <div className="flex items-center justify-between w-full gap-4">
                                                        <span className="font-medium">{account.name}</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {account.balance.amount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {account.balance.currency}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ))
                                .exhaustive()}
                        </div>

                        <Separator className="border-gray-200 dark:border-gray-700" />

                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                <Calculator className="w-4 h-4" />
                                Récapitulatif de la vente
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {sellAmount.quantity} × {sellAmount.price.amount.toFixed(2)} {action.price.currency}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {totalSaleValue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {action.price.currency}
                                    </span>
                                </div>

                                <Separator className="border-gray-200 dark:border-gray-700" />

                                <div className="flex justify-between items-center pt-1">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">Montant à recevoir</span>
                                    <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                        {totalSaleValue.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {action.price.currency}
                                    </span>
                                </div>

                                {/* Plus-value estimée */}
                                {sellAmount.quantity > 0 && (
                                    <>
                                        <Separator className="border-gray-200 dark:border-gray-700" />
                                        <div className="flex justify-between items-center bg-white dark:bg-gray-900 rounded p-2">
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Plus-value estimée</span>
                                            <div className="text-right">
                                                <span className={`text-sm font-semibold ${estimatedGainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                    {estimatedGainLoss >= 0 ? "+" : ""}{estimatedGainLoss.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {action.price.currency}
                                                </span>
                                                <span className={`text-xs ml-2 ${estimatedGainLoss >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                    ({estimatedGainLoss >= 0 ? "+" : ""}{estimatedGainLossPercent.toFixed(2)}%)
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <ButtonLoading
                            loading={sellMutation.isPending}
                            onClick={handleSell}
                            disabled={!sellAmount.IBAN || sellAmount.quantity <= 0 || sellAmount.quantity > position.quantity}
                            className="w-full bg-linear-to-r from-green-600 to-emerald-700 dark:from-green-800 dark:to-emerald-800 hover:from-green-700 hover:to-emerald-900 h-11 text-base font-semibold dark:text-white"
                        >
                            <TrendingDown className="w-5 h-5 mr-2" />
                            Vendre maintenant
                        </ButtonLoading>

                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                            La vente sera exécutée si le prix atteint votre limite
                        </p>
                    </CardContent>
                </Card>
            )}
        </>
    );
};
