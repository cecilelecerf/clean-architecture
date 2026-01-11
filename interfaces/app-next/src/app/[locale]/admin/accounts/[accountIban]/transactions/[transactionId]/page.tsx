import { AccountId } from '@infrastructure/types/account';
import { TransactionId } from '@infrastructure/types/transaction';
import { use } from 'react';
import { TransactionDetail } from '@/components/accounts/transactions/transactionDetail';

export default function TransactionIdPage({ params }: { params: Promise<{ accountIban: AccountId, transactionId: TransactionId }> }) {
    const { accountIban, transactionId } = use(params)

    return (<TransactionDetail transactionId={transactionId} accountIban={accountIban} clickable />);
}