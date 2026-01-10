"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    TrendingUp,
    ShoppingCart,
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
import { AccountDTO, AccountId } from "@infrastructure/types/account";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ButtonLoading } from "@/components/buttons/ButtonLoading";
import { BuyAction } from "@infrastructure/types/order";

export const ActionBuy = ({
    action,
    buyOpen,
    closeBuy,
}: {
    action: Action;
    buyOpen: boolean;
    closeBuy: () => void;
}) => {
    const [buyAmount, setBuyAmount] = useState<BuyAction>({
        quantity: 1,
        IBAN: "" as AccountId,
        price: action.price
    });

    const query = useQuery(endpoints.accounts.getAllByMe());
    const buyMutation = useMutation(endpoints.orders.actions.placeOrder({ ISIN: action.ISIN, type: "buy" }));

    const selectedAccount: AccountDTO | undefined = query.data?.find((acc) => acc.IBAN === buyAmount.IBAN);
    const totalPrice = buyAmount.price.amount * buyAmount.quantity;

    const handleBuy = () => {
        if (!buyAmount.IBAN) {
            toast.error("Veuillez sélectionner un compte");
            return;
        }
        buyMutation.mutate(
            { payload: buyAmount },
            {
                onSuccess: (data) => {
                    setBuyAmount({ quantity: 1, IBAN: "" as AccountId, price: data.price });
                    closeBuy();
                },
                onError: (error: any) => {
                    toast.error(error.message || "Erreur lors de l'achat");
                },
            }
        );
    };

    const incrementQuantity = () => setBuyAmount(prev => ({ ...prev, quantity: prev.quantity + 1 }));
    const decrementQuantity = () => buyAmount.quantity > 1 && setBuyAmount(prev => ({ ...prev, quantity: prev.quantity - 1 }));

    return (
        <>
            {buyOpen && (
                <Card className="overflow-hidden py-0 border-none bg-linear-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-700 text-white dark:from-blue-800 dark:to-indigo-800 py-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Acheter des actions
                                </CardTitle>
                                <CardDescription className="text-sm text-white/80">
                                    {action.symbol} • {action.name}
                                </CardDescription>
                            </div>
                            <Button
                                className="bg-gray-100/20 text-white hover:bg-gray-100/30 dark:bg-gray-800/30 dark:hover:bg-gray-800/50"
                                onClick={closeBuy}
                                variant="ghost"
                                size="icon"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-5 p-4 md:p-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <TrendingUp className="w-4 h-4" />
                                    Prix unitaire
                                </div>

                                <div className="relative">
                                    <Input
                                        id="price"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        onChange={(e) => {
                                            setBuyAmount((prev) => ({
                                                ...prev,
                                                price: {
                                                    amount: Number(e.target.value),
                                                    currency: prev.price.currency
                                                }
                                            }))
                                        }}
                                        className="w-full text-3xl font-bold text-blue-600 dark:text-blue-300 bg-white dark:bg-gray-900 border border-blue-500 dark:border-blue-700 rounded-xl px-4 py-3 pr-16 text-right focus:ring-2 focus:ring-blue-800 focus:border-blue-800 transition-all"
                                        placeholder="0.00"
                                        value={buyAmount.price.amount}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-blue-600 dark:text-blue-300 pointer-events-none">
                                        {action.price.currency}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantity" className="text-sm font-medium dark:text-gray-300">
                                Quantité
                            </Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={decrementQuantity}
                                    disabled={buyAmount.quantity <= 1}
                                    className="h-10 w-10"
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min={1}
                                    value={buyAmount.quantity}
                                    onChange={(e) =>
                                        setBuyAmount((prev) => ({
                                            ...prev,
                                            quantity: Math.min(Math.max(1, Number(e.target.value))),
                                        }))
                                    }
                                    className="text-center text-lg font-semibold h-10 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-md"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={incrementQuantity}
                                    className="h-10 w-10"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="account" className="text-sm font-medium flex items-center gap-2 dark:text-gray-300">
                                <Wallet className="w-4 h-4" />
                                Compte de débit
                            </Label>
                            {match(query)
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
                                        value={buyAmount.IBAN}
                                        onValueChange={(value) =>
                                            setBuyAmount((prev) => ({ ...prev, IBAN: value as AccountId }))
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
                                                        <span
                                                            className={`text-sm ${account.balance.amount >= totalPrice
                                                                ? "text-green-600 dark:text-green-400"
                                                                : "text-red-600 dark:text-red-400"
                                                                }`}
                                                        >
                                                            {account.balance.amount.toLocaleString("fr-FR", {
                                                                minimumFractionDigits: 2,
                                                            })}{" "}
                                                            {account.balance.currency}
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
                                Récapitulatif
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {buyAmount.quantity} × {buyAmount.price.amount.toFixed(2)} {buyAmount.price.currency}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {totalPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {buyAmount.price.currency}
                                    </span>
                                </div>

                                <Separator className="border-gray-200 dark:border-gray-700" />

                                <div className="flex justify-between items-center pt-1">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">Total estimé</span>
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
                                        {totalPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {buyAmount.price.currency}
                                    </span>
                                </div>
                            </div>

                            {selectedAccount && totalPrice - selectedAccount.balance.amount > 0 && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mt-3">
                                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                                    <div className="text-xs text-red-600 dark:text-red-400">
                                        <p className="font-semibold">Solde insuffisant</p>
                                        <p className="mt-1">
                                            Il vous manque {(totalPrice - selectedAccount.balance.amount).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {action.price.currency}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <ButtonLoading
                            loading={buyMutation.isPending}
                            onClick={handleBuy}
                            disabled={!buyAmount.IBAN || buyAmount.quantity <= 0}
                            className="w-full bg-linear-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-800 hover:from-blue-700 hover:to-indigo-900 h-11 text-base font-semibold dark:text-white"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Acheter maintenant
                        </ButtonLoading>
                    </CardContent>
                </Card>
            )}
        </>
    );
};
