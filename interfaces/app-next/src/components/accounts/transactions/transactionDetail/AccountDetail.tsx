import { TransactionWithAccountDTO } from "@infrastructure/types/transaction";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { AccountCard } from "./AccountCard";

type Props = { clickable?: boolean, transaction: TransactionWithAccountDTO }
export const AccountTransactionDetail = ({ clickable, transaction }: Props) => {
    const t = useTranslations("account.transactions.details");
    return (
        <div className="flex flex-col md:flex-row items-center gap-4 my-6">
            <AccountCard clickable={clickable} account={transaction.fromAccount} t={t} />

            <div className="shrink-0">
                <ArrowDown className="w-6 h-6 text-gray-400 md:hidden" />
                <ArrowRight className="w-6 h-6 text-gray-400 hidden md:block" />
            </div>

            <AccountCard clickable={clickable} account={transaction.toAccount} t={t} />
        </div>
    )
}

