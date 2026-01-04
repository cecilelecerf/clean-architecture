"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { useRouter } from "next/navigation";
import {
    Plus,
    Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { GoToAddPage } from "@/components/GoToAddPage";
import { ActionCard, ActionCardSkeleton } from "./ActionCard";

export const ActionsList = ({ isAdmin, baseHref }: { isAdmin?: boolean, baseHref: string }) => {
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

                                    {!searchTerm && isAdmin && (
                                        <Button
                                            onClick={() => router.push(`${baseHref}/actions/new`)}
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
                                    onClick={() => router.push(`${baseHref}/actions/${action.ISIN}`)}
                                />
                            ))}
                        </div>
                    );
                })
                .exhaustive()}

            {isAdmin && (<GoToAddPage path={`${baseHref}/actions/new`} />)}
        </div>
    );
}


function ActionsListSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <ActionCardSkeleton key={i} />
            ))}
        </div>
    );
}