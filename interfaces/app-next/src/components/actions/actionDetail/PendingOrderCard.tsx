"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    TrendingUp,
    TrendingDown,
    X,
    AlertCircle,
    Calendar,
    DollarSign
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Order } from "@infrastructure/types/order";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { endpoints } from "@/utils/endpoint";


interface PendingOrderCardProps {
    order: Order;
    actionSymbol?: string;
    actionName?: string;
}

export const PendingOrderCard = memo(({
    order,
    actionSymbol = "ACTION",
    actionName = "Action"
}: PendingOrderCardProps) => {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const isBuy = order.type === "buy";

    const cancelOrderMutation = useMutation(endpoints.orders.cancelled({ orderId: order.id }));
    const orderData = useMemo(() => ({
        typeLabel: isBuy ? "Achat" : "Vente",
        priceLabel: isBuy ? "maximum" : "minimum",
        totalEstimated: (order.price.amount * order.quantity).toFixed(2),
        quantityLabel: `${order.quantity} action${order.quantity > 1 ? "s" : ""}`,
        formattedDate: formatDateFrench(order.createdAt),
        borderColor: isBuy ? "border-l-green-500" : "border-l-red-500",
        bgColor: isBuy ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20",
        textColor: isBuy ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
    }), [isBuy, order.price.amount, order.quantity, order.createdAt]);

    const handleOpenDialog = useCallback(() => {
        setShowCancelDialog(true);
    }, []);


    const handleCancelOrder = useCallback(() => {
        cancelOrderMutation.mutate({}, {
            onSuccess: () => {
                toast.success("Ordre annulé avec succès");
                setShowCancelDialog(false);
            },
            onError: () => {
                toast.error("Erreur lors de l'annulation de l'ordre");
            },
        },)
    }, [cancelOrderMutation])

    return (
        <>
            <Card className={`border-l-4 ${orderData.borderColor} hover:shadow-md transition-shadow`}>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <OrderHeader
                            actionSymbol={actionSymbol}
                            actionName={actionName}
                            isBuy={isBuy}
                            bgColor={orderData.bgColor}
                            textColor={orderData.textColor}
                        />

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={handleOpenDialog}
                            disabled={cancelOrderMutation.isPending}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    <OrderTypeGrid
                        typeLabel={orderData.typeLabel}
                        quantityLabel={orderData.quantityLabel}
                        textColor={orderData.textColor}
                    />

                    <PriceSection
                        priceLabel={orderData.priceLabel}
                        amount={order.price.amount}
                        currency={order.price.currency}
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-muted-foreground">Total estimé</span>
                        <span className="text-lg font-semibold">
                            {orderData.totalEstimated} {order.price.currency}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        Créé le {orderData.formattedDate}
                    </div>
                </CardContent>
            </Card>

            <CancelOrderDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                onConfirm={handleCancelOrder}
                isPending={cancelOrderMutation.isPending}
                order={order}
                actionSymbol={actionSymbol}
                typeLabel={orderData.typeLabel}
                quantityLabel={orderData.quantityLabel}
                isBuy={isBuy}
            />
        </>
    );
})


const OrderHeader = memo(({
    actionSymbol,
    actionName,
    isBuy,
    bgColor,
    textColor
}: {
    actionSymbol: string;
    actionName: string;
    isBuy: boolean;
    bgColor: string;
    textColor: string;
}) => (
    <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
            {isBuy ? (
                <TrendingUp className={`w-5 h-5 ${textColor}`} />
            ) : (
                <TrendingDown className={`w-5 h-5 ${textColor}`} />
            )}
        </div>
        <div>
            <CardTitle className="text-lg flex items-center gap-2">
                {actionSymbol}
                <Badge variant="outline" className="ml-1">
                    <Clock className="w-3 h-3 mr-1" />
                    En attente
                </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
                {actionName}
            </p>
        </div>
    </div>
));

OrderHeader.displayName = 'OrderHeader';

const OrderTypeGrid = memo(({
    typeLabel,
    quantityLabel,
    textColor
}: {
    typeLabel: string;
    quantityLabel: string;
    textColor: string;
}) => (
    <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Type</p>
            <p className={`text-sm font-semibold ${textColor}`}>
                {typeLabel}
            </p>
        </div>

        <div className="bg-muted/50 dark:bg-muted/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Quantité</p>
            <p className="text-sm font-semibold">
                {quantityLabel}
            </p>
        </div>
    </div>
));

OrderTypeGrid.displayName = 'OrderTypeGrid';

const PriceSection = memo(({
    priceLabel,
    amount,
    currency
}: {
    priceLabel: string;
    amount: number;
    currency: string;
}) => (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <DollarSign className="w-4 h-4" />
                Prix {priceLabel}
            </div>

            <div className="text-right flex-col md:flex-row flex md:items-baseline md:gap-2">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {amount}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currency}
                </p>
            </div>
        </div>
    </div>
));

PriceSection.displayName = 'PriceSection';

const CancelOrderDialog = memo(({
    open,
    onOpenChange,
    onConfirm,
    isPending,
    order,
    actionSymbol,
    typeLabel,
    quantityLabel,
    isBuy
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending: boolean;
    order: Order;
    actionSymbol: string;
    typeLabel: string;
    quantityLabel: string;
    isBuy: boolean;
}) => (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Annuler l'ordre ?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                    <p>
                        Êtes-vous sûr de vouloir annuler cet ordre {isBuy ? "d'achat" : "de vente"} ?
                    </p>
                    <div className="bg-muted p-3 rounded-lg text-sm space-y-1 dark:bg-muted/50">
                        <p className="text-gray-900 dark:text-gray-100">
                            <strong>Action :</strong> {actionSymbol}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">
                            <strong>Type :</strong> {typeLabel}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">
                            <strong>Quantité :</strong> {quantityLabel}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">
                            <strong>Prix :</strong> {order.price.amount} {order.price.currency}
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Cette action est irréversible.
                    </p>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                    Non, conserver
                </AlertDialogCancel>
                <AlertDialogAction
                    onClick={onConfirm}
                    disabled={isPending}
                    className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                >
                    {isPending ? "Annulation..." : "Oui, annuler"}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
));

CancelOrderDialog.displayName = 'CancelOrderDialog';