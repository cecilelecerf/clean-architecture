"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserId } from "@infrastructure/types/user";
import { UserInfo } from "./UserInfo";
import { UserThread } from "./UserThread";

type AccountType = "courant" | "epargne";
type AccountColor =
    | "yellow"
    | "red"
    | "blue"
    | "green"
    | "purple"
    | "orange"
    | "pink"
    | "teal"
    | "brown"
    | "cyan"
    | "grey";


interface Account {
    id: string;
    userId: string;
    name: string;
    type: AccountType;
    color: AccountColor;
    balance: number;
    createdAt: string;
}

export default function ClientPage() {
    const { userId } = useParams<{ userId: UserEntity["id"] }>();
    const accounts: Account[] = []
    return (
        <>
            <UserInfo userId={userId as UserId} />
            <section>
                <h2 className="text-lg font-semibold mb-4">Comptes bancaires</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {accounts.map((acc) => (
                        <Card
                            key={acc.id}
                            className={`border-t-4 border-${acc.color}-500 shadow-sm`}
                        >
                            <CardHeader>
                                <CardTitle>{acc.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm">
                                <p>Type : {acc.type === "courant" ? "Compte courant" : "Compte épargne"}</p>
                                <p>
                                    Solde :{" "}
                                    <span className="font-semibold">
                                        {acc.balance.toLocaleString("fr-FR", {
                                            style: "currency",
                                            currency: "EUR",
                                        })}
                                    </span>
                                </p>
                                <p>Ouvert le : {new Date(acc.createdAt).toLocaleDateString()}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            <UserThread userId={userId as UserId} />
        </>
    )
}


