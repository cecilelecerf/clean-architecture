"use client";

import { useParams } from "next/navigation";
import { UserId } from "@infrastructure/types/user";
import { UserInfo } from "./UserInfo";
import { UserThreads } from "./UserThreads";
import { UserAccounts } from "./UserAccounts";
import { AdminUserCredits } from "./UserCredit";
import { Flex } from "@radix-ui/themes";

export default function ClientPage() {
    const { userId } = useParams<{ userId: UserId }>();
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


