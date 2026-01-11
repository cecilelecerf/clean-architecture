"use client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AccountResumeWithUser } from "@infrastructure/types/account";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
export const AccountCard = ({ clickable, account, t }: { clickable?: boolean, account: AccountResumeWithUser, t: ReturnType<typeof useTranslations> }) => {
    const router = useRouter();

    return (
        <Card className="w-full md:flex-1 rounded-xl shadow-md border-2">
            <CardContent className="p-4">

                {account.user ? (
                    <>
                        <div
                            className={cn(
                                "flex items-center gap-3 mb-3",
                                clickable && "cursor-pointer hover:bg-gray-50  p-2 rounded-lg transition-colors"
                            )}
                            onClick={() => clickable && router.push(`/admin/users/${account.user.id}`)}
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gray-100 dark:bg-gray-100/10">
                                    {account.user.firstname?.[0]}
                                    {account.user.lastname?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                    {account.user.firstname} {account.user.lastname}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {account.user.email}
                                </p>
                            </div>
                        </div>
                        <div
                            className={cn(
                                `rounded-lg p-3 border-l-4 border-${account.color}-500 bg-gray-50 dark:bg-gray-50/10`,
                                clickable && "cursor-pointer hover:bg-gray-100 transition-colors"
                            )}
                            onClick={() => clickable && router.push(`/admin/accounts/${account.IBAN}`)}

                        >
                            <p className="text-xs text-gray-500 mb-1">{t("account")}</p>
                            <p className="font-medium text-sm">{account.name}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {account.type === "courant" ? "Compte courant" : "Compte épargne"}
                            </p>
                        </div></>
                ) : <p>{t("bank")}</p>}

            </CardContent>
        </Card>
    )
}