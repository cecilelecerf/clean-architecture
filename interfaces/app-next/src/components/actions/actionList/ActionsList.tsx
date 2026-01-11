"use client";

import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { match } from "ts-pattern";
import { TitleAdminPage } from "@/components/TitleAdminPage";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useCallback, memo } from "react";
import { GoToAddPage } from "@/components/GoToAddPage";
import { ActionCard } from "./ActionCard";
import { ActionsListSkeleton } from "./ActionsListSkeleton";
import { useTranslations } from "next-intl";
import { EmptyActionsState } from "./EmptyActionState";

interface ActionsListProps {
    isAdmin?: boolean;
    baseHref: string;
}

export const ActionsList = memo(({ isAdmin, baseHref }: ActionsListProps) => {
    const router = useRouter();
    const query = useQuery(endpoints.actions.getAll());
    const [searchTerm, setSearchTerm] = useState("");
    const t = useTranslations("director.stocks.list");

    const filteredActions = useMemo(() => {
        if (!query.data) return [];

        const term = searchTerm.toLowerCase();
        return query.data.filter(
            (action) =>
                action.name.toLowerCase().includes(term) ||
                action.symbol.toLowerCase().includes(term) ||
                action.ISIN.toLowerCase().includes(term)
        );
    }, [query.data, searchTerm]);

    const handleActionClick = useCallback((isin: string) => {
        router.push(`${baseHref}/actions/${isin}`);
    }, [router, baseHref]);

    const handleAddNew = useCallback(() => {
        router.push(`${baseHref}/actions/new`);
    }, [router, baseHref]);

    return (
        <div className="space-y-4 pb-20">
            <div className="pb-4 space-y-4">
                <TitleAdminPage title="Actions" />

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder={t("search")}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {match(query)
                .with({ status: "pending" }, () => <ActionsListSkeleton />)
                .with({ status: "error" }, () => (
                    <div className="text-red-500 text-center border border-red-300 p-6 rounded-lg">
                        Une erreur est survenue lors du chargement des actions
                    </div>
                ))
                .with({ status: "success" }, () => {
                    if (filteredActions.length === 0) {
                        return (
                            <EmptyActionsState
                                hasSearch={!!searchTerm}
                                isAdmin={isAdmin}
                                onAddNew={handleAddNew}
                                t={t}
                            />
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            {filteredActions.map((action) => (
                                <ActionCard
                                    withIsDispo={isAdmin}
                                    key={action.ISIN}
                                    action={action}
                                    onClick={() => handleActionClick(action.ISIN)}
                                />
                            ))}
                        </div>
                    );
                })
                .exhaustive()}

            {isAdmin && <GoToAddPage path={`${baseHref}/actions/new`} />}
        </div>
    );
});

ActionsList.displayName = 'ActionsList';