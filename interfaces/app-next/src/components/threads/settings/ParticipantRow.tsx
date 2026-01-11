import { ButtonLoading } from "@/components/buttons/ButtonLoading"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ThreadWithUser } from "@/utils/endpoint/threadEndpoints"
import { UserId } from "@infrastructure/types/user"
import { Flex } from "@radix-ui/themes"
import { Settings2, UserRoundX, UserStar } from "lucide-react"
import { useTranslations } from "next-intl"
export const ParticipantRow = ({
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
    const t = useTranslations("director.message");

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
                                {t("setting.choseAdmin")}
                            </ButtonLoading>
                        )}

                        <ButtonLoading
                            variant="ghost"
                            loading={removeLoading}
                            onClick={() => onRemove(participant.id)}
                            className="w-full justify-start text-gray-500"
                        >
                            <UserRoundX className="mr-2 h-4 w-4" />
                            {t("setting.delete")}
                        </ButtonLoading>
                    </PopoverContent>
                </Popover>
            )}
        </Flex>
    );
};