import { Card, CardContent } from '@/components/ui/card';
import { fromColorClasses, textColorClasses, toColorClasses } from '@/utils/color';
import { formatDateFrench } from '@/utils/date/formatDateFrench';
import { TransactionWithAccountDTO } from '@infrastructure/types/transaction';
import { useTranslations } from 'next-intl';
type Props = { transaction: TransactionWithAccountDTO }
export const TransactionCardContent = ({ transaction }: Props) => {
    const t = useTranslations("account.transactions.details");

    return (

        <Card
            className={`rounded-2xl text-white shadow-lg border-0 bg-linear-to-br ${fromColorClasses[800]['blue']} ${toColorClasses[500]['blue']} ${textColorClasses[50]['blue']}`}
        >
            <CardContent className="flex flex-col justify-between">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-lg font-medium">
                        {transaction.icon && <span className="mr-3">{transaction.icon}</span>}
                        {transaction.label}
                    </p>
                    <p className="opacity-80 text-sm">{formatDateFrench(transaction.date)}</p>
                </div>
                <div>
                    <p className="text-xs opacity-75 mb-1">{t("amount")}</p>
                    <p className="text-3xl font-bold">    {transaction.amount.amount.toLocaleString('fr-FR', { style: 'currency', currency: transaction.amount.currency })}
                    </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                    <p className="text-xs opacity-75">{t("type")}</p>
                    <p className="text-sm font-medium capitalize mt-1">{transaction.type}</p>
                </div>
            </CardContent>
        </Card>
    )
}