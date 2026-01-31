import { NewPostComponent } from "@/components/feeds/NewPost"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { UserDto } from "@infrastructure/types/user";
import { useTranslations } from "next-intl";
export const ModalAddNotification = ({ user }: { user: UserDto }) => {
    const t = useTranslations("users.action");

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild  >
                <Button variant="outline">{t("notification")}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                </AlertDialogHeader>
                <NewPostComponent user={user} />
            </AlertDialogContent>
        </AlertDialog>
    )
}