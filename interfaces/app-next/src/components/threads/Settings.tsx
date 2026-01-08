"use client"
import { ButtonLoading } from "@/components/buttons/ButtonLoading"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { endpoints } from "@/utils/endpoint"
import { ThreadWithUser } from "@/utils/endpoint/threadEndpoints"
import { UserId } from "@infrastructure/types/user"
import { Flex } from "@radix-ui/themes"
import { useMutation, useQueries, useQuery } from "@tanstack/react-query"
import { Check, Plus, Settings2, SettingsIcon, Trash2, UserRoundX, UserStar } from "lucide-react"
import { useSession } from "next-auth/react"
import { useMemo, useState } from "react"
import { match } from "ts-pattern"
import { Skeleton } from "../ui/skeleton"
import { useRouter } from "next/navigation"
import { queryClient } from "@/lib/queryClient"

type Props = {} & ThreadWithUser

export const Settings = ({ administrator, participants, participantsId, isClose, id, type }: Props) => {
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const transfer = useMutation(endpoints.threads.transfer({ threadId: id }))
    const removeParticipant = useMutation(endpoints.threads.participants.remove({ threadId: id }))
    const closeThread = useMutation(endpoints.threads.close({ threadId: id }))
    const isAdmin = administrator ? session.user.id === administrator.id : false
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                    <SettingsIcon />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Paramètre de discution</DialogTitle>
                    <DialogDescription>
                        {administrator && (
                            <>
                                Administrateur : {administrator.firstname}{" "}{administrator.lastname}
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <Flex direction="column" gap="2">
                    {participants.map((participant) =>
                        <Flex justify="between" key={participant.id} className="mb-2">
                            <Flex align='center' gap="2" key={participant.id} >
                                <Avatar>
                                    <AvatarFallback>{participant.firstname[0]}{participant.lastname[0]}</AvatarFallback>
                                </Avatar>
                                <p className="ml-2">
                                    {participant.firstname} {participant.lastname}
                                </p>
                            </Flex>
                            {isAdmin && type === "internal" && !isClose && (
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="ghost" size="icon-sm"><Settings2 /></Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60">
                                        <>
                                            {participant.role === session.user.role && (
                                                <ButtonLoading
                                                    variant="ghost"
                                                    loading={transfer.isPending}
                                                    onClick={() => transfer.mutate({ newAdministratorId: participant.id }, {
                                                        onSuccess: () => {
                                                            queryClient.invalidateQueries({
                                                                queryKey: ['threads', id]
                                                            });
                                                            queryClient.invalidateQueries({
                                                                queryKey: ['threads', 'list']
                                                            });
                                                        }
                                                    })} className="text-gray-500
                                            ">
                                                    <UserStar />
                                                    Désigner admin
                                                </ButtonLoading>
                                            )}

                                            <ButtonLoading
                                                variant="ghost"
                                                loading={transfer.isPending}
                                                onClick={() => removeParticipant.mutate({ userId: participant.id })} className="text-gray-500
                                            ">
                                                <UserRoundX />
                                                Supprimer
                                            </ButtonLoading>
                                        </>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </Flex>
                    )}
                </Flex>
                {isAdmin && type === "internal" && !isClose && (
                    <AddParticipant administratorId={administrator.id} participantsId={participantsId} id={id} />
                )}
                {isAdmin && type === 'external' && !isClose && (
                    <TransferToAdvisor id={id} />
                )}
                <DialogFooter >
                    {isAdmin && !isClose && (
                        <ButtonLoading loading={false} variant="destructive" onClick={() => closeThread.mutate()}>
                            <Trash2 /> Cloturer la conversation ?
                        </ButtonLoading>

                    )}</DialogFooter>
            </DialogContent>
        </Dialog >
    )
}


const AddParticipant = ({ participantsId, administratorId, id }: Pick<Props, "administratorId" | "participantsId" | "id">) => {
    const [selectedUserId, setSelectedUserId] = useState<UserId | null>(null);
    const [open, setOpen] = useState(false);

    const queries = useQueries({
        queries: [
            endpoints.users.getAll({ role: "conseiller" }),
            endpoints.users.getAll({ role: "directeur" })
        ]
    })
    const addParticipant = useMutation(endpoints.threads.participants.add({ threadId: id }));
    const conseillers = queries[0].status === "success" ? queries[0].data : [];
    const directors = queries[1].status === "success" ? queries[1].data : [];
    const allUsers = [...conseillers, ...directors];

    const availableUsers = useMemo(
        () => allUsers.filter(
            (user) => !participantsId.includes(user.id) && user.id !== administratorId
        ),
        [allUsers, participantsId, administratorId]
    );

    return match(queries)
        .when((q) => q.some(({ status }) => status === "error"), () => "error")
        .with([{ status: "success" }, { status: "success" }], () => {
            if (availableUsers.length === 0) {
                return (
                    <Button variant="secondary" disabled>
                        <Plus className="mr-2 h-4 w-4" />
                        Aucun participant disponible
                    </Button>
                );
            }

            return (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="secondary">
                            <Plus className="mr-2 h-4 w-4" />
                            Ajouter un participant
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Rechercher un utilisateur..." />
                            <CommandList>
                                <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                                <CommandGroup heading="Conseillers">
                                    {availableUsers
                                        .filter((user) => user.role === "conseiller")
                                        .map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={`${user.firstname} ${user.lastname}`}
                                                onSelect={() => setSelectedUserId(user.id)}
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
                                                        selectedUserId === user.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                                <CommandGroup heading="Directeurs">
                                    {availableUsers
                                        .filter((user) => user.role === "directeur")
                                        .map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={`${user.firstname} ${user.lastname}`}
                                                onSelect={() => setSelectedUserId(user.id)}
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
                                                        selectedUserId === user.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                        {selectedUserId && (
                            <div className="border-t p-2">
                                <ButtonLoading
                                    loading={addParticipant.isPending}
                                    onClick={() => addParticipant.mutate({ userId: selectedUserId }, {
                                        onSuccess: () => {
                                            setSelectedUserId(null)
                                            setOpen(false)
                                        }
                                    })}
                                    className="w-full"
                                >
                                    Ajouter
                                </ButtonLoading>
                            </div>
                        )}
                    </PopoverContent>
                </Popover >

            )
        })
        .otherwise(() => <SkeletonAddParticipant />)

}



const TransferToAdvisor = ({ id }: Pick<Props, "id">) => {
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const [selectedUserId, setSelectedUserId] = useState<UserId | null>(null);
    const [open, setOpen] = useState(false);
    const router = useRouter()

    const queries = useQuery(endpoints.users.getAll({ role: "conseiller" }))
    const transferTo = useMutation(endpoints.threads.transfer({ threadId: id }));


    return match(queries)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with({ status: 'success' }, ({ data: users }) => {
            if (users.length === 0) {
                return (
                    <Button variant="secondary" disabled>
                        <Plus className="mr-2 h-4 w-4" />
                        Aucun participant disponible
                    </Button>
                );
            }

            return (
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="secondary">
                            <Plus className="mr-2 h-4 w-4" />
                            Transférer la conversation
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Rechercher un utilisateur..." />
                            <CommandList>
                                <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
                                <CommandGroup heading="Conseillers">
                                    {users
                                        .filter((user) => user.id !== session.user.id)
                                        .map((user) => (
                                            <CommandItem
                                                key={user.id}
                                                value={`${user.firstname} ${user.lastname}`}
                                                onSelect={() => setSelectedUserId(user.id)}
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
                                                        selectedUserId === user.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                        {selectedUserId && (
                            <div className="border-t p-2">
                                <ButtonLoading
                                    loading={transferTo.isPending}
                                    onClick={() => transferTo.mutate({ newAdministratorId: selectedUserId }, {
                                        onSuccess: () => {
                                            router.push("/admin/client-threads");
                                            setTimeout(() => {
                                                queryClient.invalidateQueries({
                                                    queryKey: ['threads', id]
                                                });
                                                queryClient.invalidateQueries({
                                                    queryKey: ['threads', 'list']
                                                });
                                            }, 100);
                                        }
                                    })}
                                    className="w-full"
                                >
                                    Transférer
                                </ButtonLoading>
                            </div>
                        )}
                    </PopoverContent>
                </Popover >

            )
        })
        .exhaustive()

}

const SkeletonAddParticipant = () => {
    return (
        <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
        </div>
    );
};