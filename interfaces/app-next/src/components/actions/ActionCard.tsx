"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChevronRight,
    CheckCircle,
    XCircle,
    Building2,
} from "lucide-react";

interface ActionCardProps {
    action: any;
    onClick: () => void;
    withIsDispo?: boolean
}

export const ActionCard = ({ action, onClick, withIsDispo }: ActionCardProps) => {
    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98] hover:scale-105"
            onClick={onClick}
        >
            <CardContent>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-blue-600 text-lg">
                                {action.symbol}
                            </h3>
                            {withIsDispo && (
                                action.isAvailable ? (
                                    <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Dispo
                                    </Badge>
                                ) : (
                                    <Badge className="bg-red-100 text-red-800 text-xs px-2 py-0">
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Indispo
                                    </Badge>
                                )
                            )}
                        </div>

                        <p className="font-medium text-sm mb-2 truncate">
                            {action.name}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                                <Building2 className="w-3 h-3 mr-1" />
                                {action.market}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                {action.activitySector}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                            <p className="text-xl font-bold  ">
                                {action.price.amount.toLocaleString("fr-FR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                            <p className="text-xs text-gray-500">{action.price.currency}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>ISIN: {action.ISIN}</span>
                </div>
            </CardContent>
        </Card>
    );
}


export const ActionCardSkeleton = () => (
    <Card>
        <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-16" />
            </div>
        </CardContent>
    </Card>
)