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
            <UserInfo userId={userId} />
            <Flex direction="column" gap="8" className="w-full">
                <UserAccounts userId={userId} />
                <UserThreads userId={userId} />
                <AdminUserCredits userId={userId} />
            </Flex>
        </>
    )
}


