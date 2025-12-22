"use client"
import { use, useState } from "react";
import { PostFilters } from "@/components/feeds/PostFilters";
import { FiltersProps } from "@/utils/endpoint/transactionEndpoints";
import { GetAllTransactions } from "../GetAllTransactions";
import { AccountId } from "@infrastructure/types/account";

export default function TransactionsPage({ params }: { params: Promise<{ accountId: AccountId }> }) {
    const { accountId } = use(params)
    const [filters, setFilters] = useState<FiltersProps>({
        label: undefined,
        fromDate: undefined,
        toDate: undefined,
        limit: 20,
        page: 1,
        type: undefined
    })
    return (
        <>
            <PostFilters filters={filters} onChange={(f) => setFilters(f)} />
            <GetAllTransactions accountIban={accountId} filters={filters} onPaginationChange={(pageNumber) => setFilters((prev) => ({ ...prev, page: pageNumber }))} />
        </>
    )

}
