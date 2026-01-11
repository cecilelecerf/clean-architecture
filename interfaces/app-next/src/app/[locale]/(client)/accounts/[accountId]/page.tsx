import { AccountId } from '@infrastructure/types/account';
import { use } from 'react';
import { AccountDetail } from '@/components/accounts/accountDetail';
import { TitleAdminPage } from '@/components/TitleAdminPage';


export default function AccountIdPage({
  params
}: {
  params: Promise<{ accountId: AccountId }>
}) {
  const { accountId } = use(params)

  return (
    <>
      <TitleAdminPage />
      <AccountDetail accountIban={accountId} withTransferButton basePath='/accounts' />
    </>
  );
}
