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
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { Check, Plus, Settings2, SettingsIcon, Trash2, UserRoundX, UserStar } from "lucide-react"
import { useSession } from "next-auth/react"
import { memo, useCallback, useMemo, useState } from "react"
import { match } from "ts-pattern"
import { Skeleton } from "../ui/skeleton"
import { useRouter } from "next/navigation"

type Props = {} & ThreadWithUser

export const Settings = ({ administrator, participants, participantsId, isClose, id, type }: Props) => {
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const transfer = useMutation(endpoints.threads.transfer({ threadId: id }))
    const removeParticipant = useMutation(endpoints.threads.participants.remove({ threadId: id }))
    const closeThread = useMutation(endpoints.threads.close({ threadId: id }))
    const isAdmin = administrator ? session.user.id === administrator.id : false
    const handleTransfer = useCallback((newAdministratorId: UserId) => {
        transfer.mutate({ newAdministratorId });
    }, [transfer, id]);

    const handleRemoveParticipant = useCallback((userId: UserId) => {
        removeParticipant.mutate({ userId });
    }, [removeParticipant, id]);

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
                        <ParticipantRow
                            key={participant.id}
                            participant={participant}
                            isAdmin={isAdmin}
                            isClose={isClose}
                            type={type}
                            currentUserRole={session.user.role}
                            onTransfer={handleTransfer}
                            onRemove={handleRemoveParticipant}
                            transferLoading={transfer.isPending}
                            removeLoading={removeParticipant.isPending}
                        />
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

const ParticipantRow = memo(({
    participant,
    isAdmin,
    isClose,
    type,
    currentUserRole,
    onTransfer,
    onRemove,
    transferLoading,
    removeLoading
}: {
    participant: ThreadWithUser['participants'][0];
    isAdmin: boolean;
    isClose: boolean;
    type: ThreadWithUser['type'];
    currentUserRole: string;
    onTransfer: (userId: UserId) => void;
    onRemove: (userId: UserId) => void;
    transferLoading: boolean;
    removeLoading: boolean;
}) => {
    return (
        <Flex justify="between" className="mb-2">
            <Flex align='center' gap="2">
                <Avatar>
                    <AvatarFallback>
                        {participant.firstname[0]}{participant.lastname[0]}
                    </AvatarFallback>
                </Avatar>
                <p className="ml-2">
                    {participant.firstname} {participant.lastname}
                </p>
            </Flex>

            {isAdmin && type === "internal" && !isClose && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                            <Settings2 />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                        {participant.role === currentUserRole && (
                            <ButtonLoading
                                variant="ghost"
                                loading={transferLoading}
                                onClick={() => onTransfer(participant.id)}
                                className="w-full justify-start text-gray-500"
                            >
                                <UserStar className="mr-2 h-4 w-4" />
                                Désigner admin
                            </ButtonLoading>
                        )}

                        <ButtonLoading
                            variant="ghost"
                            loading={removeLoading}
                            onClick={() => onRemove(participant.id)}
                            className="w-full justify-start text-gray-500"
                        >
                            <UserRoundX className="mr-2 h-4 w-4" />
                            Supprimer
                        </ButtonLoading>
                    </PopoverContent>
                </Popover>
            )}
        </Flex>
    );
});
ParticipantRow.displayName = 'ParticipantRow';

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

    const availableUsers = useMemo(() => {
        const allUsers = [...conseillers, ...directors];
        return allUsers.filter(
            (user) => !participantsId.includes(user.id) && user.id !== administratorId
        );
    }, [conseillers, directors, participantsId, administratorId]);

    const handleAddParticipant = useCallback(() => {
        if (selectedUserId) {
            addParticipant.mutate({ userId: selectedUserId });
        }
    }, [selectedUserId, addParticipant]);


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
                                            <UserCommandItem
                                                key={user.id}
                                                user={user}
                                                isSelected={selectedUserId === user.id}
                                                onSelect={setSelectedUserId}
                                            />
                                        ))}
                                </CommandGroup>
                                <CommandGroup heading="Directeurs">
                                    {availableUsers
                                        .filter((user) => user.role === "directeur")
                                        .map((user) => (
                                            <UserCommandItem
                                                key={user.id}
                                                user={user}
                                                isSelected={selectedUserId === user.id}
                                                onSelect={setSelectedUserId}
                                            />
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                        {selectedUserId && (
                            <div className="border-t p-2">
                                <ButtonLoading
                                    loading={addParticipant.isPending}
                                    onClick={handleAddParticipant}
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


const UserCommandItem = memo(({
    user,
    isSelected,
    onSelect
}: {
    user: { id: UserId; firstname: string; lastname: string };
    isSelected: boolean;
    onSelect: (id: UserId) => void;
}) => (
    <CommandItem
        value={`${user.firstname} ${user.lastname}`}
        onSelect={() => onSelect(user.id)}
    >
        <Flex align="center" gap="2" className="flex-1">
            <Avatar className="h-8 w-8">
                <AvatarFallback>
                    {user.firstname[0]}{user.lastname[0]}
                </AvatarFallback>
            </Avatar>
            <span>{user.firstname} {user.lastname}</span>
        </Flex>
        <Check
            className={cn(
                "ml-auto h-4 w-4",
                isSelected ? "opacity-100" : "opacity-0"
            )}
        />
    </CommandItem>
));

UserCommandItem.displayName = 'UserCommandItem';

const TransferToAdvisor = ({ id }: Pick<Props, "id">) => {
    const { data: session } = useSession();
    const queryClient = useQueryClient();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const [selectedUserId, setSelectedUserId] = useState<UserId | null>(null);
    const [open, setOpen] = useState(false);
    const router = useRouter()

    const queries = useQuery(endpoints.users.getAll({ role: "conseiller" }))
    const transferTo = useMutation(endpoints.threads.transfer({ threadId: id }));

    const handleTransfer = useCallback(() => {
        if (selectedUserId) {
            transferTo.mutate({ newAdministratorId: selectedUserId }, {
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
            })
        }
    }, [selectedUserId, transferTo]);


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
                                            <UserCommandItem
                                                key={user.id}
                                                user={user}
                                                isSelected={selectedUserId === user.id}
                                                onSelect={setSelectedUserId}
                                            />
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                        {selectedUserId && (
                            <div className="border-t p-2">
                                <ButtonLoading
                                    loading={transferTo.isPending}
                                    onClick={handleTransfer}
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