"use client";

import { useParams } from "next/navigation";
import { UserId } from "@infrastructure/types/user";
import { UserInfo } from "./UserInfo";
import { UserThreads } from "./UserThreads";
import { UserAccounts } from "./UserAccounts";



export default function ClientPage() {
    const { userId } = useParams<{ userId: UserId }>();
    const accounts = []
    return (
        <>
            <UserInfo userId={userId} />
            <UserAccounts userId={userId} />
            <UserThreads userId={userId} />
        </>
    )
}


