"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { useRouter } from "next/navigation";
import {
    Plus,
    ChevronRight,
    CheckCircle,
    XCircle,
    Building2,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { GoToAddPage } from "@/components/GoToAddPage";

export default function ActionsPage() {
    const router = useRouter();
    const query = useQuery(endpoints.actions.getAll());
    const [searchTerm, setSearchTerm] = useState("");

    const filteredActions = query.data?.filter(
        (action) =>
            action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            action.ISIN.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4 pb-20">
            <div className="sticky top-0 z-10 bg-white pb-4 space-y-4">
                <TitleAdminPage title="Actions" />

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Rechercher une action..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {match(query)
                .with({ status: "pending" }, () => <ActionsListSkeleton />)
                .with({ status: "error" }, () => ("error"))
                .with({ status: "success" }, () => {
                    if (!filteredActions || filteredActions.length === 0) {
                        return (
                            <Card>
                                <CardContent className="p-8 text-center space-y-4">
                                    <p className="text-sm text-gray-500">
                                        {searchTerm
                                            ? "Aucune action trouvée"
                                            : "Aucune action enregistrée"}
                                    </p>
                                    {!searchTerm && (
                                        <Button
                                            onClick={() => router.push("/director/actions/new")}
                                            variant="outline"
                                            size="sm"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Ajouter la première action
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {filteredActions.map((action) => (
                                <ActionCard
                                    key={action.ISIN}
                                    action={action}
                                    onClick={() => router.push(`/director/actions/${action.ISIN}`)}
                                />
                            ))}
                        </div>
                    );
                })
                .exhaustive()}

            <GoToAddPage path="/director/actions/new" />
        </div>
    );
}

interface ActionCardProps {
    action: any;
    onClick: () => void;
}

function ActionCard({ action, onClick }: ActionCardProps) {
    return (
        <Card
            className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
            onClick={onClick}
        >
            <CardContent>
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-blue-600 text-lg">
                                {action.symbol}
                            </h3>
                            {action.isAvailable ? (
                                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Dispo
                                </Badge>
                            ) : (
                                <Badge className="bg-red-100 text-red-800 text-xs px-2 py-0">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Indispo
                                </Badge>
                            )}
                        </div>

                        <p className="font-medium text-gray-900 text-sm mb-2 truncate">
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
                            <p className="text-xl font-bold text-gray-900">
                                {action.currentPrice.amount.toLocaleString("fr-FR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </p>
                            <p className="text-xs text-gray-500">{action.currentPrice.currency}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>ISIN: {action.ISIN}</span>
                    <span>{action.totalNb.toLocaleString("fr-FR")} actions</span>
                </div>
            </CardContent>
        </Card>
    );
}

function ActionsListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
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
            ))}
        </div>
    );
}