import { Card, CardContent } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { AccountWithUserDTO } from "@infrastructure/types/account";
import { fromColorClasses, textColorClasses, toColorClasses } from "@/utils/color";
import { AccountDropdownMenu } from "./AccountDropdownMenue";
type Props = { account: AccountWithUserDTO }
export const AccountHero = ({ account }: Props) => (

    <Card
        className={`rounded-2xl text-white shadow-lg border-0 bg-linear-to-br ${fromColorClasses[800][account.color]} ${toColorClasses[500][account.color]} ${textColorClasses[50][account.color]}`}
    >
        <CardContent className="flex flex-col justify-between">
            <div className="flex justify-between items-center">
                <p className="text-lg font-medium">{account.name}</p>
                <AccountDropdownMenu
                    account={account}
                />
            </div>

            <div className="flex gap-2 my-4">
                <Copy className="cursor-pointer" onClick={() => navigator.clipboard.writeText(account.IBAN)} />
                <p>{account.IBAN}</p>
            </div>

            <div>
                <p className="text-xs opacity-75 mb-1">{account.type}</p>
                <p className="text-3xl font-bold">
                    {account.balance.amount.toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: account.balance.currency
                    })}
                </p>
            </div>
        </CardContent>
    </Card>
)