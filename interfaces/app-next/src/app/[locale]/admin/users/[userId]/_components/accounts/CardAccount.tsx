import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fromColorClasses, textColorClasses, toColorClasses } from "@/utils/color";
import { AccountDTO } from "@infrastructure/types/account";
import { useTranslations } from "next-intl";
import Link from "next/link";

export const CardAccount = ({ acc }: { acc: AccountDTO }) => {
    const t = useTranslations("users.account");
    return (
        <Link href={`/admin/accounts/${acc.IBAN}`}>
            <Card
                key={acc.IBAN}
                className={`shadow border-0 bg-linear-to-br transition duration-200 hover:shadow-lg 
                hover:scale-105
                ${fromColorClasses[800][acc.color]}
                ${toColorClasses[500][acc.color]} 
                ${textColorClasses[50][acc.color]}
            `}

            >
                <CardHeader>
                    <CardTitle>{acc.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                    <p>Type : {acc.type === "courant" ? t("current") : t("saving")}</p>
                    <p>
                        {t("balance")} :{" "}
                        <span className="font-semibold">
                            {acc.balance.amount.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: acc.balance.currency,
                            })}
                        </span>
                    </p>
                </CardContent>
            </Card>
        </Link>
    )
}
export const AccountsSkeleton = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="shadow-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-44" />
                </CardContent>
            </Card>
        ))}
    </div>
)