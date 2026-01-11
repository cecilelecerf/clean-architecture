import { UserId } from "@infrastructure/types/user";
import { UserInfo } from "@/components/users/UserInfo";
import { UserThreads } from "./_components/threads/UserThreads";
import { UserAccounts } from "./_components/accounts/UserAccounts";
import { AdminUserCredits } from "./_components/UserCredit";
import { Flex } from "@radix-ui/themes";
import { use } from "react";

export default function ClientPage({ params }: { params: Promise<{ userId: UserId }> }) {
    const { userId } = use(params);
    return (
        <>
            <Flex direction="column" gap="8" className="w-full">
                <UserInfo userId={userId} />
                <UserAccounts userId={userId} />
                <UserThreads userId={userId} />
                <AdminUserCredits userId={userId} />
            </Flex>
        </>
    )
}


