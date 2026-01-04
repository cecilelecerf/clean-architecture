import { ButtonLoading } from "@/components/buttons/ButtonLoading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/utils/endpoint";
import { AccountId } from "@infrastructure/types/account";
import { Action, ActionId } from "@infrastructure/types/action";
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Skeleton } from "@radix-ui/themes";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Wallet, Badge, TrendingUp, TrendingDown, X, Minus, Plus, AlertCircle, Calculator } from "lucide-react";
import { useState } from "react";
import { Button, Select } from "react-day-picker";
import { Label } from "recharts";
import { toast } from "sonner";
import { match } from "ts-pattern";

const UserActionPosition = ({ isin, action }: { isin: ActionId; action: Action }) => {
    const [sellOpen, setSellOpen] = useState(false);
    const [sellQuantity, setSellQuantity] = useState(0);
    const [selectedAccount, setSelectedAccount] = useState<AccountId>("" as AccountId);

    const positionQuery = useQuery(endpoints.orders.getAllByAction({ actionId: isin }));
    const accountsQuery = useQuery(endpoints.accounts.getAllByMe());
    const sellMutation = useMutation(endpoints.actions.sell({ isin }));

    const handleSell = () => {
        if (!positionQuery.data) return;

        if (sellQuantity <= 0 || sellQuantity > positionQuery.data.quantity) {
            toast.error("Quantité invalide");
            return;
        }

        if (!selectedAccount) {
            toast.error("Veuillez sélectionner un compte");
            return;
        }

        sellMutation.mutate(
            {
                payload: {
                    quantity: sellQuantity,
                    accountId: selectedAccount,
                },
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Vous avez vendu ${sellQuantity} action(s) ${action.symbol}`
                    );
                    setSellQuantity(0);
                    setSelectedAccount("" as AccountId);
                    setSellOpen(false);
                },
                onError: (error) => {
                    toast.error(error.message || "Erreur lors de la vente");
                },
            }
        );
    };

    const incrementSellQuantity = () => {
        if (positionQuery.data && sellQuantity < positionQuery.data.quantity) {
            setSellQuantity((prev) => prev + 1);
        }
    };

    const decrementSellQuantity = () => {
        if (sellQuantity > 1) {
            setSellQuantity((prev) => prev - 1);
        }
    };

    return (
        <>
            {match(positionQuery)
                .with({ status: "pending" }, () => (
                    <Card>
                        <CardContent className="p-4">
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))
                .with({ status: "error" }, () => null)
                .with({ status: "success" }, ({ data: order }) => {
                    if (!order || order.quantity === 0) return null;

                    const totalValue = order.quantity * order.currentPrice;
                    const gainLoss = totalValue - order.totalInvested;
                    const gainLossPercent = (gainLoss / order.totalInvested) * 100;

                    return (
                        <>
                            <Card className="overflow-hidden border-2 border-green-100 bg-gradient-to-br from-green-50/30 to-emerald-50/20">
                                <CardHeader className="pb-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-5 h-5" />
                                            <CardTitle className="text-base">Votre position</CardTitle>
                                        </div>
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white">
                                            {order.quantity} action{order.quantity > 1 ? "s" : ""}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 space-y-4">
                                    {/* Statistiques de position */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                            <p className="text-xs text-gray-600 mb-1">Prix moyen d'achat</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {order.averagePrice.toFixed(2)}{" "}
                                                <span className="text-sm text-gray-600">
                                                    {order.currency}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                            <p className="text-xs text-gray-600 mb-1">Valeur actuelle</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                {totalValue.toLocaleString("fr-FR", {
                                                    minimumFractionDigits: 2,
                                                })}{" "}
                                                <span className="text-sm text-gray-600">
                                                    {order.currency}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Gain/Perte */}
                                    <div
                                        className={`rounded-lg p-4 ${gainLoss >= 0
                                            ? "bg-green-50 border border-green-200"
                                            : "bg-red-50 border border-red-200"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {gainLoss >= 0 ? (
                                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                                ) : (
                                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                                )}
                                                <span className="text-sm font-medium text-gray-700">
                                                    Plus-value
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`text-xl font-bold ${gainLoss >= 0 ? "text-green-600" : "text-red-600"
                                                        }`}
                                                >
                                                    {gainLoss >= 0 ? "+" : ""}
                                                    {gainLoss.toLocaleString("fr-FR", {
                                                        minimumFractionDigits: 2,
                                                    })}{" "}
                                                    {order.currency}
                                                </p>
                                                <p
                                                    className={`text-sm font-semibold ${gainLoss >= 0 ? "text-green-600" : "text-red-600"
                                                        }`}
                                                >
                                                    {gainLoss >= 0 ? "+" : ""}
                                                    {gainLossPercent.toFixed(2)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bouton Vendre */}
                                    <Button
                                        onClick={() => setSellOpen(true)}
                                        variant="outline"
                                        className="w-full border-green-600 text-green-700 hover:bg-green-50 font-semibold"
                                    >
                                        <TrendingDown className="w-4 h-4 mr-2" />
                                        Vendre des actions
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Modal de vente */}
                            {sellOpen && (
                                <Card className="overflow-hidden border-2 border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/30">
                                    <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 flex justify-between items-center">
                                        <div>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <TrendingDown className="w-5 h-5" />
                                                Vendre des actions
                                            </CardTitle>
                                            <CardDescription className="text-sm text-white/80">
                                                {action.symbol} • Position: {order.quantity} actions
                                            </CardDescription>
                                        </div>
                                        <Button
                                            className="bg-gray-100/20 text-green-300"
                                            onClick={() => setSellOpen(false)}
                                            variant="secondary"
                                            size="icon"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </CardHeader>

                                    <CardContent className="space-y-5 p-4 md:p-6">
                                        {/* Prix actuel */}
                                        <div className="bg-white rounded-lg p-4 border border-green-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <TrendingUp className="w-4 h-4" />
                                                    Prix de vente
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {order.currentPrice.toFixed(2)}{" "}
                                                        {order.currency}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantité */}
                                        <div className="space-y-2">
                                            <Label htmlFor="sellQuantity" className="text-sm font-medium">
                                                Quantité à vendre
                                            </Label>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={decrementSellQuantity}
                                                    disabled={sellQuantity <= 1}
                                                    className="h-10 w-10"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <Input
                                                    id="sellQuantity"
                                                    type="number"
                                                    min={1}
                                                    max={order.quantity}
                                                    value={sellQuantity}
                                                    onChange={(e) =>
                                                        setSellQuantity(
                                                            Math.min(
                                                                Math.max(1, Number(e.target.value)),
                                                                order.quantity
                                                            )
                                                        )
                                                    }
                                                    className="text-center text-lg font-semibold h-10"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={incrementSellQuantity}
                                                    disabled={sellQuantity >= order.quantity}
                                                    className="h-10 w-10"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-500">
                                                    Disponible: {order.quantity} actions
                                                </span>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-auto p-0 text-xs text-green-600"
                                                    onClick={() => setSellQuantity(order.quantity)}
                                                >
                                                    Tout vendre
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Compte de crédit */}
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="creditAccount"
                                                className="text-sm font-medium flex items-center gap-2"
                                            >
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
                                                        value={selectedAccount}
                                                        onValueChange={(value) =>
                                                            setSelectedAccount(value as AccountId)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-10">
                                                            <SelectValue placeholder="Sélectionnez un compte" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {accounts.map((account) => (
                                                                <SelectItem key={account.IBAN} value={account.IBAN}>
                                                                    <div className="flex items-center justify-between w-full gap-4">
                                                                        <span className="font-medium">
                                                                            {account.name}
                                                                        </span>
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
                                                        {sellQuantity} × {order.currentPrice.toFixed(2)}{" "}
                                                        {order.currency}
                                                    </span>
                                                    <span className="font-medium">
                                                        {(
                                                            order.currentPrice * sellQuantity
                                                        ).toLocaleString("fr-FR", {
                                                            minimumFractionDigits: 2,
                                                        })}{" "}
                                                        {order.currency}
                                                    </span>
                                                </div>

                                                <Separator />

                                                <div className="flex justify-between items-center pt-1">
                                                    <span className="font-semibold text-gray-900">
                                                        Montant à recevoir
                                                    </span>
                                                    <span className="text-xl font-bold text-green-600">
                                                        {(
                                                            order.currentPrice * sellQuantity
                                                        ).toLocaleString("fr-FR", {
                                                            minimumFractionDigits: 2,
                                                        })}{" "}
                                                        {order.currency}
                                                    </span>
                                                </div>

                                                {/* Plus-value sur cette vente */}
                                                {sellQuantity > 0 && (
                                                    <>
                                                        <Separator />
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-gray-600">
                                                                Plus-value estimée
                                                            </span>
                                                            <span
                                                                className={`text-sm font-semibold ${order.currentPrice > order.averagePrice
                                                                    ? "text-green-600"
                                                                    : "text-red-600"
                                                                    }`}
                                                            >
                                                                {order.currentPrice > order.averagePrice
                                                                    ? "+"
                                                                    : ""}
                                                                {(
                                                                    (order.currentPrice - order.averagePrice) *
                                                                    sellQuantity
                                                                ).toLocaleString("fr-FR", {
                                                                    minimumFractionDigits: 2,
                                                                })}{" "}
                                                                {order.currency}
                                                            </span>
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
                                                !selectedAccount || sellQuantity <= 0 || sellQuantity > order.quantity
                                            }
                                            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 h-11 text-base font-semibold"
                                        >
                                            <TrendingDown className="w-5 h-5 mr-2" />
                                            Vendre {sellQuantity} action{sellQuantity > 1 ? "s" : ""}
                                        </ButtonLoading>

                                        <p className="text-xs text-center text-gray-500 mt-2">
                                            La vente sera exécutée immédiatement au prix du marché
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    );
                })
                .exhaustive()}
        </>
    );
};