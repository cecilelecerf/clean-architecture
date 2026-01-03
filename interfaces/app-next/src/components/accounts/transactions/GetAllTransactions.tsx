import { PaginationComponent } from "@/components/PaginationComponent"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateFrench } from "@/utils/date/formatDateFrench"
import { endpoints } from "@/utils/endpoint"
import { TransactionFilters as TTransactionFilters } from "@/utils/endpoint/transactionEndpoints"
import { AccountId } from "@infrastructure/types/account"
import { useQuery } from "@tanstack/react-query"
import clsx from "clsx"
import Link from "next/link"
import { match } from "ts-pattern"

type Props = {
    accountIban: AccountId,
    filters: TTransactionFilters,
    onPaginationChange: (pageNumber: number) => void
    hiddePagination?: boolean
    baseHref: string
}
export const GetAllTransactions = ({ accountIban, filters, onPaginationChange, hiddePagination, baseHref }: Props) => {
    const query = useQuery(endpoints.accounts.transactions.getAll({ accountIban, filters }))
    return match(query)
        .with({ status: "pending" }, () => <TransactionsSkeleton />)
        .with({ status: "error" }, () => "error")
        .with({ status: "success" }, ({ data }) =>
            <>
                <div className="flex flex-col gap-3">
                    {data.transactions.slice(0, filters.limit).map((t) => (
                        <Link
                            href={`${baseHref}/${t.id}`}
                            key={t.id}
                            className="flex justify-between items-center rounded-lg p-2 hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{t.icon}</span>
                                <div>
                                    <p className="font-medium">{t.label}</p>
                                    <p className="text-xs text-muted-foreground">{formatDateFrench(t.date)}</p>
                                </div>
                            </div>
                            <div
                                className={clsx(
                                    'font-semibold',
                                    match(t).with({ type: "credit" }, () => 'text-emerald-500').with({ type: "debit" }, () => 'text-red-500').otherwise(() => 'text-gray-600')
                                )}
                            >
                                {t.type === "debit" && "-"}   {t.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </div>
                        </Link>
                    ))}
                </div>
                {!hiddePagination && (
                    <PaginationComponent onPaginationChange={onPaginationChange} totalPage={data.total} filters={{ ...filters }} />
                )}
            </>
        ).exhaustive()

}

const TransactionsSkeleton = () => (
    <Skeleton className="flex items-center space-x-4 rounded-lg">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    </Skeleton>
)