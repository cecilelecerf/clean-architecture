import { ButtonLink } from "@/components/ButtonLink";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateFrench } from "@/utils/date/formatDateFrench";
import { Thread } from "@infrastructure/types/thread";
import { Flex } from "@radix-ui/themes";
import { useTranslations } from "next-intl";

export const ThreadCard = ({ thread, haveAcceded }: { thread: Thread, haveAcceded: boolean }) => {
    const t = useTranslations("users.thread");

    return (
        <Card
            key={thread.id}
            className={`shadow-sm gap-0`}
        >
            <CardHeader>
                <Flex justify="between" gap="2">

                    <CardTitle>{thread.title}</CardTitle>
                    <Badge>{thread.isClose ? t("close") : t("open")}</Badge>
                </Flex>
            </CardHeader>
            <CardContent className="flex flex-col justify-center">
                {haveAcceded && <ButtonLink
                    variant="link"
                    href={`/admin/client-threads/${thread.id}`}>
                    {t("access")}
                </ButtonLink>}
                <p className="text-xs text-center">{formatDateFrench(thread.updatedAt)}</p>
            </CardContent>
        </Card>
    )
}
export const UserThreadsSkeleton = () => {
    const t = useTranslations("users.thread");

    return (
        <section>
            <h2 className="text-lg font-semibold mb-4">{t("title")}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="shadow-sm">
                        <CardHeader>
                            <Flex justify="between" gap="2" align="center">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </Flex>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-center items-center space-y-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-3 w-28" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}