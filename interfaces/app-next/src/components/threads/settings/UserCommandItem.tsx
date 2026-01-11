import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { UserId } from "@infrastructure/types/user"
import { Flex } from "@radix-ui/themes"
import { Check } from "lucide-react"

export const UserCommandItem = ({
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
);