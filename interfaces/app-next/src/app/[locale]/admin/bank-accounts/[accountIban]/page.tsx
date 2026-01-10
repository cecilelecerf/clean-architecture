
import { AccountId } from '@infrastructure/types/account';
import { use } from 'react';
import { AccountDetail } from '@/components/accounts/AccountDetail';
import { TitleAdminPage } from '@/components/TitleAdminPage';

export default function AccountIdPage({
  params
}: {
  params: Promise<{ accountIban: AccountId }>
}) {
  const { accountIban } = use(params)
  return (
    <>
      <TitleAdminPage title='Compte de la banque' />
      <AccountDetail accountIban={accountIban} basePath='/admin/bank-accounts' />
    </>

  );
}
