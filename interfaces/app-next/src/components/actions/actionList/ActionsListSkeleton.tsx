import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ActionsListSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-6 w-28 rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-20" />
                            <Skeleton className="h-4 w-12" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-32 mt-3" />
                </CardContent>
            </Card>
        ))}
    </div>
);