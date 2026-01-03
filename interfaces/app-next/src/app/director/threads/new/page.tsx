"use client"
import FormWrapper, { Field } from "@/components/FromWrapper";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { endpoints } from "@/utils/endpoint";
import { NewThread } from "@/app/api/threads/route";
import { useSession } from "next-auth/react";
import { UserId } from "@infrastructure/types/user";
import { match } from "ts-pattern";
import { cn } from "@/lib/utils";
import { Flex } from "@radix-ui/themes";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CommandInput, CommandList, Command, CommandDialog, CommandGroup, CommandItem, CommandSeparator, CommandEmpty } from "@/components/ui/command";

export default function NewThreadPage() {
    const router = useRouter()
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const [field, setField] = useState<NewThread>({ title: "", participantsId: [] });
    const fields: Field[] = [
        {
            label: 'Titre de la conversation',
            get: field.title,
            set: (e) => setField((prev) => ({ ...prev, title: Array.isArray(e) ? e[0] : e })),
        },

        {
            label: 'Participants',
            get: field.participantsId,
            set: () => { },
            type: "other",
            layout: <AddParticipant field={field} setField={setField} />
        },
    ];

    const mutate = useMutation(endpoints.threads.create({ type: 'internal' }))

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate.mutate(field, { onSuccess: (data) => router.push(`/director/threads/${data.id}`) })
    }

    return (

        <form onSubmit={(e) => onSubmit(e)} className="max-w-lg mx-auto mt-10" >
            <FormWrapper
                title="Nouvelle conversation"
                fields={fields}
                button="Démarrer"
                loading={mutate.isPending}
            />
        </form >

    );
}


const AddParticipant = ({
    field,
    setField
}: {
    field: NewThread;
    setField: Dispatch<SetStateAction<NewThread>>;
}) => {
    const queries = useQueries({
        queries: [
            endpoints.users.getAll({ role: "conseiller" }),
            endpoints.users.getAll({ role: "directeur" })
        ]
    });

    // ✅ FIX : Mutation immutable de l'état
    const handleToggleParticipant = (userId: UserId) => {
        setField((prev) => ({
            ...prev,
            participantsId: prev.participantsId.includes(userId)
                ? prev.participantsId.filter((id) => id !== userId)
                : [...prev.participantsId, userId]
        }));
    };

    // ✅ Vérifier si un participant est sélectionné
    const isSelected = (userId: UserId) => field.participantsId.includes(userId);

    return match(queries)
        .when(
            (q) => q.some(({ status }) => status === "error"),
            () => (
                <div className="text-red-500 p-4 border border-red-300 rounded">
                    Erreur lors du chargement des utilisateurs
                </div>
            )
        )
        .with(
            [{ status: "success" }, { status: "success" }],
            ([{ data: advisors }, { data: directors }]) => {
                const allUsers = [...advisors, ...directors];

                if (allUsers.length === 0) {
                    return (
                        <div className="text-center p-4 border rounded text-gray-500">
                            Aucun participant disponible
                        </div>
                    );
                }

                return (
                    <div className="border rounded-md">
                        <Command>
                            <CommandInput placeholder="Rechercher un utilisateur..." />
                            <CommandList>
                                <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>

                                {advisors.length > 0 && (
                                    <CommandGroup heading="Conseillers">
                                        {advisors.map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={`${user.firstname} ${user.lastname}`}
                                                onSelect={() => handleToggleParticipant(user.id)}
                                            >
                                                <Flex align="center" gap="2" className="flex-1">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {user.firstname[0]}{user.lastname[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>
                                                        {user.firstname} {user.lastname}
                                                    </span>
                                                </Flex>
                                                <Check
                                                    className={cn(
                                                        "ml-auto h-4 w-4",
                                                        isSelected(user.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}

                                {directors.length > 0 && (
                                    <CommandGroup heading="Directeurs">
                                        {directors.map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={`${user.firstname} ${user.lastname}`}
                                                onSelect={() => handleToggleParticipant(user.id)}
                                            >
                                                <Flex align="center" gap="2" className="flex-1">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {user.firstname[0]}{user.lastname[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>
                                                        {user.firstname} {user.lastname}
                                                    </span>
                                                </Flex>
                                                <Check
                                                    className={cn(
                                                        "ml-auto h-4 w-4",
                                                        isSelected(user.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </CommandList>
                        </Command>

                        {/* ✅ Afficher le nombre de participants sélectionnés */}
                        {field.participantsId.length > 0 && (
                            <div className="p-2 text-sm text-gray-600 border-t">
                                {field.participantsId.length} participant(s) sélectionné(s)
                            </div>
                        )}
                    </div>
                );
            }
        )
        .otherwise(() => <SkeletonAddParticipant />);
};

const SkeletonAddParticipant = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
    );
};