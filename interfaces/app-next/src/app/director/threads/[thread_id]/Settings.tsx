"use client"
import { ButtonLoading } from "@/components/buttons/ButtonLoading"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { endpoints } from "@/utils/endpoint"
import { ThreadWithUser } from "@/utils/endpoint/threadEndpoints"
import { Flex } from "@radix-ui/themes"
import { useMutation, useQueries, useQuery } from "@tanstack/react-query"
import { Plus, Settings2, SettingsIcon, Trash, Trash2, TrashIcon, UserRoundX, UserStar, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { match } from "ts-pattern"
type Props = {} & ThreadWithUser
export const Settings = ({ administrator, participants, participantsId, isClose, id }: Props) => {
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    const transfer = useMutation(endpoints.threads.transfer({ threadId: id }))
    const removeParticipant = useMutation(endpoints.threads.participants.remove({ threadId: id }))
    const isAdmin = session.user.id === administrator.id
    return (
        <Dialog>
            <DialogTrigger asChild><Button size="icon" variant="ghost"><SettingsIcon /></Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Paramètre de discution</DialogTitle>
                    <DialogDescription>
                        Administrateur : {administrator.firstname}{" "}{administrator.lastname}
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
                            {isAdmin && (
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="ghost" size="icon-sm"><Settings2 /></Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-60">
                                        <>
                                            <ButtonLoading
                                                variant="ghost"
                                                loading={transfer.isPending}
                                                onClick={() => transfer.mutate({ newAdministratorId: participant.id })} className="text-gray-500
                                            ">
                                                <UserStar />
                                                Désigner admin
                                            </ButtonLoading>

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
                <AddParticipant administratorId={administrator.id} participantsId={participantsId} />
                <DialogFooter >
                    {isAdmin && (
                        <>
                            {!isClose &&
                                <ButtonLoading loading={false} variant="destructive"  >
                                    <Trash2 /> Cloturer la conversation ?
                                </ButtonLoading>
                            }
                        </>
                    )}</DialogFooter>
            </DialogContent>
        </Dialog >
    )
}


const AddParticipant = ({ participantsId, administratorId }: Pick<Props, "administratorId" | "participantsId">) => {
    const queries = useQueries({
        queries: [
            endpoints.users.getAll({ role: "conseiller" }),
            endpoints.users.getAll({ role: "directeur" })
        ]
    })

    return match(queries)
        .when((q) => q.some(({ status }) => status === "error"), () => "error")
        .with([{ status: "success" }, { status: "success" }], ([{ data: conseiller }, { data: director }]) => {
            const users = [...conseiller, ...director]
            useMemo(() => { users.filter((user) => !participantsId.includes(user.id) && user.id !== administratorId) }, [])
            return (
                <>
                    <Button variant="secondary">Ajouter un participant</Button>
                    {console.log(users)}
                </>
            )
        })
        .otherwise(() => "pending")

}