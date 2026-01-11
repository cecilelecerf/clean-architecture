import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { AccountWithUserDTO } from "@infrastructure/types/account";

import { useTranslations } from "next-intl";


type AccountCardProps = {
    account: AccountWithUserDTO;
    showUser?: boolean;
    onClickAccount?: (iban: string) => void;
    onClickUser?: (userId: string) => void;
};

export const AccountCard = ({
    account,
    showUser = false,
    onClickAccount,
    onClickUser,
}: AccountCardProps) => {
    const t = useTranslations("account");

    const handleAccountClick = () => {
        if (onClickAccount) onClickAccount(account.IBAN);
    };

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onClickUser && account.user?.id) onClickUser(account.user.id);
    };

    return (
        <Card
            key={account.IBAN}
            className="shadow hover:shadow-lg transition-all py-1 cursor-pointer"
            onClick={handleAccountClick}
        >
            <CardContent className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-lg">{account.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {account.type === "courant" ? t("current") : t("saving")}
                    </p>
                </div>

                <div className="py-3 px-4 bg-gray-50 dark:bg-gray-300/10 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("balance")}</p>
                    <p className="text-2xl font-bold">
                        {account.balance.amount.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: account.balance.currency,
                        })}
                    </p>
                </div>

                {showUser && account.user && (
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-xs">
                                {account.user.firstname?.[0]}
                                {account.user.lastname?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {account.user.firstname} {account.user.lastname}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {account.user.email}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {showUser && account.user && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUserClick}
                            className="flex items-center"
                        >
                            <User className="w-4 h-4 mr-2" />
                            {t("client")}
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={handleAccountClick}
                    >
                        {t("more")}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
