"use client"
import { endpoints } from "@/utils/endpoint"
import { UserId } from "@infrastructure/types/user"
import { useQuery } from "@tanstack/react-query"
import { match } from "ts-pattern"
import { AccountsSkeleton, CardAccount } from "./CardAccount"
import { useTranslations } from "next-intl"

export const UserAccounts = ({ userId }: { userId: UserId }) => {
    const query = useQuery(endpoints.accounts.getAllByClient({ userId }))
    const t = useTranslations("users.account");

    return (
        <section>
            <h2 className="text-lg font-bold mb-4">{t("title")}</h2>
            {match(query)
                .with({ status: "error" }, () => ("error"))
                .with({ status: "pending" }, () => <AccountsSkeleton />)
                .with({ status: "success" }, ({ data: accounts }) => {
                    if (accounts.length === 0) {
                        return (
                            <div className="text-gray-500 text-center border p-6 rounded-lg">
                                {t("none")}
                            </div>
                        )
                    }

                    return (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((acc) => (
                                <CardAccount acc={acc} key={acc.IBAN} />
                            ))}
                        </div>
                    )
                })
                .exhaustive()}
        </section>
    )
}
