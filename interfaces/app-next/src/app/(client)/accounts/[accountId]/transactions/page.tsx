"use client"
import { use, useState } from "react";
import { FiltersProps } from "@/utils/endpoint/transactionEndpoints";
import { GetAllTransactions } from "../GetAllTransactions";
import { AccountId } from "@infrastructure/types/account";
import { TransactionFilters } from "../TransactionFilters";

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
            <TransactionFilters filters={filters} onChange={(f) => setFilters(f)} />
            <GetAllTransactions accountIban={accountId} filters={filters} onPaginationChange={(pageNumber) => setFilters((prev) => ({ ...prev, page: pageNumber }))} />
        </>
    )

}
