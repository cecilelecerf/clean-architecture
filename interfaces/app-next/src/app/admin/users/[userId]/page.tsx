"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { advisorEndpoint } from "@/utils/endpoint/advisor";
import { UserEntity } from "@domain/entities/UserEntity";
import { UserId } from "@infrastructure/types/user";
import { match } from "ts-pattern";

type UserRole = "client" | "conseiller" | "directeur";
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

interface Client {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    role: UserRole;
    isActiveField: boolean;
    createdAt: string;
    confirmedAt?: string;
    advisorId?: string;
}

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
    const [accounts, setAccounts] = useState<Account[]>([]);
    const query = useQuery(advisorEndpoint.users.get({ id: userId as UserId }))

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: 'pending' }, () => "pendign")
        .with({ status: "success" }, ({ data: client }) => <div className="p-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>
                            {client.firstname} {client.lastname}
                        </span>
                        <Badge variant={client.isActiveField ? "default" : "secondary"}>
                            {client.isActiveField ? "Actif" : "Inactif"}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                        <Mail size={16} /> {client.email}
                    </div>
                    <p>Rôle : {client.role}</p>
                    <p>Créé le : {new Date(client.createdAt).toLocaleDateString()}</p>
                    {client.confirmedAt && (
                        <p>Confirmé le : {new Date(client.confirmedAt).toLocaleDateString()}</p>
                    )}
                </CardContent>
            </Card>

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

            <div className="flex justify-end">
                <Button>
                    <Phone size={16} className="mr-2" /> Contacter le client
                </Button>
            </div>
        </div>
        ).exhaustive()


}
