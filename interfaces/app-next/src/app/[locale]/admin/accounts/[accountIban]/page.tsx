
import { AccountId } from '@infrastructure/types/account';
import { use } from 'react';
import { TitleAdminPage } from '@/components/TitleAdminPage';
import { AccountDetail } from '@/components/accounts/AccountDetail';


export default function AccountIdPage({
  params
}: {
  params: Promise<{ accountIban: AccountId }>
}) {
  const { accountIban } = use(params)

  return (
    <>
      <TitleAdminPage />
      <AccountDetail accountIban={accountIban} withUserInfo basePath='/admin/accounts' />
    </>
  );
}

