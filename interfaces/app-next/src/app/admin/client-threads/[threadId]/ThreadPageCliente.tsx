'use client';

import { useSession } from 'next-auth/react';
import { ThreadId } from '@infrastructure/types/thread';
import { useQueries } from '@tanstack/react-query';
import { match } from 'ts-pattern';
import { Button } from '@/components/ui/button';
import { UserDto } from '@infrastructure/types/user';
import { useRouter } from 'next/navigation';
import { endpoints } from '@/utils/endpoint';
import { SkeletonThread, WrapperThread } from '@/components/threads/WrapperThread';


export default function ThreadPageClient({ threadId }: { threadId: ThreadId }) {
    const queries = useQueries({
        queries: [
            endpoints.threads.get({ threadId }),
            endpoints.threads.messages.getAll({ threadId })
        ]
    })
    const router = useRouter()
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    return match(queries)
        .when((q) => q.some(({ status }) => status === "error"), () => "error")
        .with([{ status: "success" }, { status: "success" }], ([{ data: thread }, { data: messages }]) => (
            <WrapperThread
                thread={thread}
                defaultMessages={messages}
                userId={session.user.id as UserDto["id"]}
                withSetting
                addElementInTop={
                    <span className="text-sm text-gray-500">
                        Client:
                        <Button
                            className='ml-2'
                            variant='outline'
                            onClick={() =>
                                router.push(`/admin/users/${thread.participants[0].id}`)}>
                            {thread.participants[0].firstname}
                            {thread.participants[0].lastname}
                        </Button>
                    </span>}
            />)
        )
        .otherwise(() => <SkeletonThread />)
}

