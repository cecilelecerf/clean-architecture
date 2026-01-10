"use client";

import { useState } from "react";
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

export function PendingOrderCard({
    order,
    actionSymbol = "ACTION",
    actionName = "Action"
}: PendingOrderCardProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    const cancelOrderMutation = useMutation(endpoints.orders.cancelled({ orderId: order.id }));

    const isBuy = order.type === "buy";

    return (
        <>
            <Card className={` border-l-4 gap-2 ${isBuy ? "border-l-green-500" : "border-l-red-500"
                } hover:shadow-md transition-shadow`}>
                <CardHeader  >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isBuy ? "bg-green-100" : "bg-red-100"
                                }`}>
                                {isBuy ? (
                                    <TrendingUp className={`w-5 h-5 text-green-600`} />
                                ) : (
                                    <TrendingDown className={`w-5 h-5 text-red-600`} />
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

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setShowCancelDialog(true)}
                            disabled={cancelOrderMutation.isPending}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Type</p>
                            <p className={`text-sm font-semibold ${isBuy ? "text-green-600" : "text-red-600"
                                }`}>
                                {isBuy ? "Achat" : "Vente"}
                            </p>
                        </div>

                        <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Quantité</p>
                            <p className="text-sm font-semibold">
                                {order.quantity} action{order.quantity > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <DollarSign className="w-4 h-4" />
                                Prix {isBuy ? "maximum" : "minimum"}
                            </div>

                            <div className="text-right flex-col md:flex-row flex md:items-baseline md:gap-2">
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {order.price.amount}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {order.price.currency}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Total estimé */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Total estimé</span>
                        <span className="text-lg font-semibold">
                            {(order.price.amount * order.quantity).toFixed(2)} {order.price.currency}
                        </span>
                    </div>

                    {/* Date de création */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        Créé le {formatDateFrench(order.createdAt)}
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de confirmation d'annulation */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
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
                            <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                                <p><strong>Action :</strong> {actionSymbol}</p>
                                <p><strong>Type :</strong> {isBuy ? "Achat" : "Vente"}</p>
                                <p><strong>Quantité :</strong> {order.quantity} action{order.quantity > 1 ? "s" : ""}</p>
                                <p><strong>Prix :</strong> {order.price.amount} {order.price.currency}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Cette action est irréversible.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={cancelOrderMutation.isPending}>
                            Non, conserver
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => cancelOrderMutation.mutate({}, {
                                onSuccess: () => {
                                    toast.success("Ordre annulé avec succès");
                                    setShowCancelDialog(false);
                                },
                                onError: () => {
                                    toast.error("Erreur lors de l'annulation de l'ordre");
                                },
                            })}
                            disabled={cancelOrderMutation.isPending}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {cancelOrderMutation.isPending ? "Annulation..." : "Oui, annuler"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}