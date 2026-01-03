"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { endpoints } from "@/utils/endpoint"
import { PostWithTagsAndUser } from "@/utils/endpoint/feedsEndpoint"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Bell } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { match } from "ts-pattern"

export const MenuPopover = () => {
    const query = useQuery(endpoints.feeds.posts.getUnread())

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => <SkeletonPopover />)
        .with({ status: "success" }, ({ data }) => <DisplayPopover posts={data} />)
        .exhaustive()
}

const DisplayPopover = ({ posts }: { posts: PostWithTagsAndUser[] }) => {
    const router = useRouter()
    const markAsReadMutation = useMutation(endpoints.feeds.posts.markAsRead())
    const postCount = posts.length
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Button variant="ghost">
                        <Bell className="text-gray-600" />
                    </Button>
                    {postCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1.5 -right-1.5 h-5 min-w-5 rounded-full px-1"
                        >
                            {postCount > 99 ? "99+" : postCount}
                        </Badge>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2 w-64 max-h-96 overflow-y-auto relative">
                {posts.map((post) => (
                    <div key={post.id}
                        onClick={() => { markAsReadMutation.mutate({ postId: post.id }); router.push(`/feeds/${post.id}`) }}
                        className="flex w-full items-center justify-between p-1.5 hover:bg-gray-100 transition-all rounded">
                        <p className="text-sm text-gray-800">{post.title}</p>
                    </div>
                )

                )}
                <div className="fixed bottom-0 flex w-full bg-white">
                    <Button asChild variant="link" className="w-full">
                        <Link href="/feeds">Voir +</Link>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
const SkeletonPopover = () => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Button variant="ghost" disabled>
                        <Bell className="text-gray-400" />
                    </Button>
                    <Skeleton className="absolute -top-1.5 -right-1.5 h-5 w-8 rounded-full" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-2 w-64 max-h-96 overflow-y-auto">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="flex w-full items-center justify-between p-1.5 rounded"
                    >
                        <Skeleton className="h-4 w-full" />
                    </div>
                ))}
                <div className="pt-2 border-t">
                    <Skeleton className="h-9 w-full" />
                </div>
            </PopoverContent>
        </Popover>
    )
}