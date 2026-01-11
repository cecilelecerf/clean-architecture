import { UserDto } from "@infrastructure/types/user";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { endpoints } from "@/utils/endpoint";
import { ButtonLoading } from "@/components/buttons/ButtonLoading";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
import { useTranslations } from "next-intl";


export const CardUserAction = ({ user, }: { user: UserDto }) => {
    const router = useRouter()
    const onBan = useMutation(endpoints.users.ban({ id: user.id }))
    const forgotPassword = useMutation(endpoints.auth.forgotPassword())
    const newThread = useMutation(endpoints.threads.create({ type: user.role === "client" ? "external" : "internal" }));
    const t = useTranslations("director.user.action");
    return (
        <Card className="p-6">
            <h2 className="font-semibold">{t("title")}</h2>
            <div className="flex gap-2 flex-col lg:flex-row">
                <ButtonLoading
                    variant="outline"
                    loading={newThread.isPending}
                    onClick={() =>
                        newThread.mutate({
                            title: `Conversation avec ${user.firstname} ${user.lastname}`, participantsId: [user.id],
                            messageContent: user.role === "client" ? "Débuter la conversation" : undefined
                        }, {
                            onSuccess: (data) => {
                                router.push(`/${user.role === "client" ? "admin" : "director"}/threads/${data.id}`)
                            }
                        })}>
                    {t("send")}
                </ButtonLoading>
                <ButtonLoading loading={forgotPassword.isPending}
                    onClick={() => forgotPassword.mutate(user.email)} variant="outline">
                    {t("reset")}
                </ButtonLoading >
                {
                    user.role !== "directeur" && (
                        user.isActiveField ? (
                            <ButtonLoading loading={onBan.isPending} onClick={() => onBan.mutate({ status: true })} variant="destructive">
                                {t("deactivate")}
                            </ButtonLoading>
                        ) : (
                            <ButtonLoading loading={onBan.isPending} onClick={() => onBan.mutate({ status: false })} variant="default">
                                {t("activate")}
                            </ButtonLoading>
                        )
                    )
                }

            </div>
        </Card >
    )
}

export const SkeletonCardUserAction = () =>
    <Card className="p-6">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
        </div>
    </Card>