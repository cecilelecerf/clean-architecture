import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const SkeletonAccount = () => (
    <>
        <Card className="rounded-2xl shadow-lg border-0">
            <CardContent className="flex flex-col justify-between p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="flex gap-2 my-4">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <div>
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-9 w-40" />
                </div>
            </CardContent>
        </Card>
        <Skeleton className="h-20 w-full mx-1 mt-10" />
    </>
);