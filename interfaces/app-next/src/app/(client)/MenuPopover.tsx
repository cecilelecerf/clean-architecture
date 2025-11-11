"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useNotificationStore } from "@/stores/notificationStore"
import { PostWithTagsAndUser } from "@/utils/endpoint/advisor/feedsEndpoint"
import { clientEndpoints } from "@/utils/endpoint/client"
import { UserId } from "@infrastructure/types/user"
import { useQuery } from "@tanstack/react-query"
import { Bell, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect } from "react"
import { match } from "ts-pattern"

export const MenuPopover = () => {
    const query = useQuery(clientEndpoints.feeds.posts.getAll({ filters: { limit: 4 } }))

    return match(query)
        .with({ status: "error" }, () => "error")
        .with({ status: "pending" }, () => "loading")
        .with({ status: "success" }, ({ data }) => <DisplayPopover posts={data.posts} />)
        .exhaustive()
}

const DisplayPopover = ({ posts }: { posts: PostWithTagsAndUser[] }) => {
    const { data: session } = useSession()
    const userId = session.user.id as UserId

    const { setNotifications, notifications, unreadCount } = useNotificationStore()

    useEffect(() => {
        if (posts.length > 0) setNotifications(posts)
    }, [posts, setNotifications])

    const unread = userId ? unreadCount(userId) : 0

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative">
                    <Button variant="ghost">
                        <Bell className="text-gray-600" />
                    </Button>
                    {unread > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1.5 -right-1.5 h-5 min-w-5 rounded-full px-1"
                        >
                            {unread > 99 ? "99+" : unread}
                        </Badge>
                    )}
                </div>
            </PopoverTrigger>

            <PopoverContent className="flex flex-col w-64 max-h-96 overflow-y-auto">
                {notifications.map((post) => {
                    const isUnread = userId ? !post.readBy.includes(userId) : false
                    return (
                        <div key={post.id}>
                            <div className="flex w-full items-center justify-between py-1.5 group transition-colors">
                                <p className="text-sm text-gray-800">{post.title}</p>
                                {isUnread && (
                                    <Button size="icon" variant="ghost">
                                        <Check className="text-gray-300 group-hover:text-gray-700" />
                                    </Button>
                                )}
                            </div>
                            <Separator />
                        </div>
                    )
                })}

                <Button asChild variant="link" className="mt-2">
                    <Link href="/feeds">Voir +</Link>
                </Button>
            </PopoverContent>
        </Popover>
    )
}
