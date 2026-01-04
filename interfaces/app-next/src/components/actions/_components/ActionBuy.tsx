"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Edit,
    Building2,
    Layers,
    Hash,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    LineChart as LineChartIcon,
    Pencil,
    ShoppingCart,
    Minus,
    Plus,
    Wallet,
    AlertCircle,
    Calculator,
    X,
} from "lucide-react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Action, ActionId, BuyAction } from "@infrastructure/types/action";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import Link from "next/link";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { AccountId } from "@infrastructure/types/account";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ButtonLoading } from "@/components/buttons/ButtonLoading";

export const ActionBuy = ({ action, buyOpen, setBuyOpen }: {
    action: Action, buyOpen: boolean, setBuyOpen: Dispatch<SetStateAction<boolean>>
}) => {
    const [buyAmount, setBuyAmount] = useState<BuyAction>({ quantity: 0, accountId: "" as AccountId });
    const query = useQuery(endpoints.accounts.getAllByMe())
    const buyMutation = useMutation(endpoints.actions.buy({ isin: action.ISIN }))
    const selectedAccount = query.data?.find(
        (acc) => acc.IBAN === buyAmount.accountId
    );
    const unitPrice = action.currentPrice.amount;

    const totalPrice = (unitPrice * buyAmount.quantity);

    const canAfford = selectedAccount
        ? selectedAccount.amount >= totalPrice
        : false;
    const handleBuy = () => {
        if (buyAmount.quantity <= 0 || buyAmount.quantity > action.totalNb) return;


        if (!buyAmount.accountId) {
            toast.error("Veuillez sélectionner un compte");
            return;
        }

        if (!canAfford) {
            toast.error("Solde insuffisant");
            return;
        }

        buyMutation.mutate({ payload: buyAmount }, {
            onSuccess: () => {

                toast.success(`Vous avez acheté ${buyAmount} actions de ${action.symbol}`);
                setBuyAmount({ quantity: 0, accountId: "" as AccountId });
            },
            onError: (error) => { toast.error(error.message || "Erreur lors de l'achat"); }
        })

    };
    const incrementQuantity = () => {
        if (buyAmount.quantity < action.totalNb) {
            setBuyAmount((prev) => ({ ...prev, quantity: prev.quantity + 1 }));
        }
    };

    const decrementQuantity = () => {
        if (buyAmount.quantity > 1) {
            setBuyAmount((prev) => ({ ...prev, quantity: prev.quantity - 1 }));
        }
    };

    return (
        <>
            {
                buyOpen && (
                    <Card className="overflow-hidden py-0 border-none bg-linear-to-br from-blue-50/50 to-indigo-50/30">
                        <CardHeader className="bg-linear-to-r from-blue-600 to-indigo-700 text-white py-4 flex justify-between items-center">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    Acheter des actions
                                </CardTitle>
                                <CardDescription className="text-sm text-white/80">
                                    {action.symbol} • {action.name}
                                </CardDescription>
                            </div>
                            <Button className="bg-gray-100/20 text-blue-300" onClick={() => setBuyOpen((prev) => !prev)} variant="secondary">
                                <X />
                            </Button>
                        </CardHeader>

                        <CardContent className="space-y-5 p-4 md:p-6">
                            {/* Prix actuel */}
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <TrendingUp className="w-4 h-4" />
                                        Prix unitaire
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {unitPrice.toLocaleString("fr-FR", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}{" "}
                                            {action.currentPrice.currency}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quantité */}
                            <div className="space-y-2">
                                <Label htmlFor="quantity" className="text-sm font-medium">
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
                                        max={action.totalNb}
                                        value={buyAmount.quantity}
                                        onChange={(e) =>
                                            setBuyAmount((prev) => ({
                                                ...prev,
                                                quantity: Math.min(
                                                    Math.max(1, Number(e.target.value)),
                                                    action.totalNb
                                                ),
                                            }))
                                        }
                                        className="text-center text-lg font-semibold h-10"
                                    />
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={incrementQuantity}
                                        disabled={buyAmount.quantity >= action.totalNb}
                                        className="h-10 w-10"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Disponible : {action.totalNb.toLocaleString("fr-FR")} actions
                                </p>
                            </div>

                            {/* Compte */}
                            <div className="space-y-2">
                                <Label htmlFor="account" className="text-sm font-medium flex items-center gap-2">
                                    <Wallet className="w-4 h-4" />
                                    Compte de débit
                                </Label>
                                {match(query)
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
                                            value={buyAmount.accountId}
                                            onValueChange={(value) =>
                                                setBuyAmount((prev) => ({ ...prev, accountId: value as AccountId }))
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
                                                            <span
                                                                className={`text-sm ${account.amount >= totalPrice
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                                    }`}
                                                            >
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
                                    Récapitulatif
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">
                                            {buyAmount.quantity} × {unitPrice.toFixed(2)} {action.currentPrice.currency}
                                        </span>
                                        <span className="font-medium">
                                            {(unitPrice * buyAmount.quantity).toLocaleString("fr-FR", {
                                                minimumFractionDigits: 2,
                                            })}{" "}
                                            {action.currentPrice.currency}
                                        </span>
                                    </div>


                                    <Separator />

                                    <div className="flex justify-between items-center pt-1">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-blue-600">
                                            {totalPrice.toLocaleString("fr-FR", {
                                                minimumFractionDigits: 2,
                                            })}{" "}
                                            {action.currentPrice.currency}
                                        </span>
                                    </div>
                                </div>

                                {selectedAccount && !canAfford && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-3">
                                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                        <div className="text-xs text-red-600">
                                            <p className="font-semibold">Solde insuffisant</p>
                                            <p className="mt-1">
                                                Il vous manque{" "}
                                                {(totalPrice - selectedAccount.amount).toLocaleString(
                                                    "fr-FR",
                                                    { minimumFractionDigits: 2 }
                                                )}{" "}
                                                {action.currentPrice.currency}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <ButtonLoading
                                loading={buyMutation.isPending}
                                onClick={handleBuy}
                                disabled={!buyAmount.accountId || !canAfford || buyAmount.quantity <= 0}
                                className="w-full bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 h-11 text-base font-semibold"
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Acheter {buyAmount.quantity} action{buyAmount.quantity > 1 ? "s" : ""}
                            </ButtonLoading>

                            <p className="text-xs text-center text-gray-500 mt-2">
                                L'ordre sera exécuté immédiatement au prix du marché
                            </p>
                        </CardContent>
                    </Card>
                )
            }
        </>
    )


}