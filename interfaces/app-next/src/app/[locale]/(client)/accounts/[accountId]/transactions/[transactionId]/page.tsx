import { AccountId } from '@infrastructure/types/account';
import { TransactionId } from '@infrastructure/types/transaction';
import { use } from 'react';
import { TransactionDetail } from '@/components/accounts/transactions/transactionDetail';


export default function TransactionIdPage({ params }: { params: Promise<{ accountId: AccountId, transactionId: TransactionId }> }) {
  const { accountId, transactionId } = use(params)

  return (<TransactionDetail accountIban={accountId} transactionId={transactionId} />
  );
}
