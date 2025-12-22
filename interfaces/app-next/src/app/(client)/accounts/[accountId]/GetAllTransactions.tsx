import { PaginationComponent } from "@/components/PaginationComponent"
import { endpoints } from "@/utils/endpoint"
import { FiltersProps } from "@/utils/endpoint/transactionEndpoints"
import { AccountId } from "@infrastructure/types/account"
import { useQuery } from "@tanstack/react-query"
import clsx from "clsx"
import Link from "next/link"
import { match } from "ts-pattern"

type Props = {
    accountIban: AccountId,
    filters: FiltersProps,
    onPaginationChange: (pageNumber: number) => void
    hiddePagination?: boolean
}
export const GetAllTransactions = ({ accountIban, filters, onPaginationChange, hiddePagination }: Props) => {
    const query = useQuery(endpoints.accounts.transactions.getAll({ accountIban }))
    return match(query)
        .with({ status: "pending" }, () => "pending")
        .with({ status: "error" }, () => "error")
        .with({ status: "success" }, ({ data }) =>
            <>
                <div className="flex flex-col gap-3">
                    {data.transactions.slice(0, length).map((t) => (
                        <Link
                            href={`/accounts/${accountIban.toLowerCase()}/transactions/${t.id}`}
                            key={t.id}
                            className="flex justify-between items-center rounded-lg p-2 hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{t.icon}</span>
                                <div>
                                    <p className="font-medium">{t.label}</p>
                                    <p className="text-xs text-muted-foreground">{t.date.toLocaleString()}</p>
                                </div>
                            </div>
                            <div
                                className={clsx(
                                    'font-semibold',
                                    t.amount < 0 ? 'text-red-500' : 'text-green-500',
                                )}
                            >
                                {t.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
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