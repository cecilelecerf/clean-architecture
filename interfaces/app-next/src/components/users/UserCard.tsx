import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { UserDto } from "@infrastructure/types/user";

type UserCardProps = {
    user: UserDto;
    onViewDetailsHref: string;
};

export const UserCard = ({
    user,
    onViewDetailsHref,
}: UserCardProps) => {
    const t = useTranslations("advisor.users");

    return (
        <Card className="flex items-center gap-4 p-4">
            <Avatar>
                <AvatarFallback>
                    {user.firstname?.[0]}{user.lastname?.[0]}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-semibold text-center">
                    {user.firstname} {user.lastname}
                </p>
                <p className="text-sm text-center text-gray-500">
                    {user.email}
                </p>
            </div>
            <ButtonLink href={onViewDetailsHref}  >
                {t("more")}
            </ButtonLink>
        </Card>
    );
};

import { Skeleton } from "@/components/ui/skeleton";
import { ButtonLink } from "../ButtonLink";
import { useTranslations } from "next-intl";

export const UsersSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 mx-auto" />
                    <Skeleton className="h-3 w-40 mx-auto" />
                </div>
                <Skeleton className="h-9 w-20" />
            </Card>
        ))}
    </div>
);
