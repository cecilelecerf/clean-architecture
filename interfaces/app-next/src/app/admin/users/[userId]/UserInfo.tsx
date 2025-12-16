"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { UserId } from "@infrastructure/types/user";
import { match } from "ts-pattern";

export const UserInfo = ({ userId }: { userId: UserId }) => {
    const query = useQuery(endpoints.users.get({ id: userId }))
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



            <div className="flex justify-end">
                <Button>
                    <Phone size={16} className="mr-2" /> Contacter le client
                </Button>
            </div>
        </div>
        ).exhaustive()
}