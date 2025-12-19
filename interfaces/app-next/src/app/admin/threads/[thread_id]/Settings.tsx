"use client"
import { ButtonLoading } from "@/components/buttons/ButtonLoading"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { endpoints } from "@/utils/endpoint"
import { ThreadWithUser } from "@/utils/endpoint/threadEndpoints"
import { ThreadId } from "@infrastructure/types/thread"
import { User } from "@infrastructure/types/user"
import { Flex } from "@radix-ui/themes"
import { useMutation, useQuery } from "@tanstack/react-query"
import { SettingsIcon, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { match } from "ts-pattern"
type Props = {} & ThreadWithUser
export const Settings = ({ administrator, participants }: Props) => {

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

                <p>Participants</p>
                <Flex direction="column" gap="2">
                    {participants.map((participant) =>
                        <Flex align='center' gap="2" key={participant.id}>
                            <Avatar>
                                <AvatarFallback>{participant.firstname[0]}{participant.lastname[0]}</AvatarFallback>
                            </Avatar>
                            <p>
                                {participant.firstname} {participant.lastname}
                            </p>
                        </Flex>
                    )}
                </Flex>
            </DialogContent>
        </Dialog>
    )
}

const AdvisorsList = ({ threadId }: { threadId: ThreadId }) => {
    const router = useRouter()
    const { data: session } = useSession()
    const query = useQuery(endpoints.users.getAll({ role: "conseiller" }))
    const [advisorId, setAdvisorId] = useState<User["id"] | null>(null)
    const transfer = useMutation(endpoints.threads.transfer({ threadId }))
    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "pending")
        .with({ status: "success" }, ({ data: users }) => (
            <>
                <Select value={advisorId} onValueChange={(value: User["id"]) => setAdvisorId(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selectionner un conseiller" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Conseiller</SelectLabel>
                            {users.filter((user) => user.id !== session.user.id).map((user) =>
                                <SelectItem key={user.id} value={user.id}>{user.firstname + " " + user.lastname}</SelectItem>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {advisorId && (
                    <ButtonLoading loading={transfer.isPending} onClick={() => transfer.mutate({ newAdministratorId: advisorId, }, { onSuccess: () => router.push("/admin/client-threads") })}>Transférer</ButtonLoading>
                )}
            </>
        ))
        .exhaustive()
}