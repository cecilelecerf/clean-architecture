'use client';

import { useSession } from 'next-auth/react';
import { ThreadId } from '@infrastructure/types/thread';
import { useQueries } from '@tanstack/react-query';
import { match } from 'ts-pattern';
import { UserDto } from '@infrastructure/types/user';
import { endpoints } from '@/utils/endpoint';
import { SkeletonThread, WrapperThread } from '@/components/threads/WrapperThread';


export default function ThreadPageClient({ threadId }: { threadId: ThreadId }) {
    const queries = useQueries({
        queries: [
            endpoints.threads.get({ threadId }),
            endpoints.threads.messages.getAll({ threadId })
        ]
    })
    const { data: session } = useSession();
    if (!session?.user?.id) return <div>Unauthorized</div>;
    return match(queries)
        .when((q) => q.some(({ status }) => status === "error"), () => "error")
        .with([{ status: "success" }, { status: "success" }], ([{ data: thread }, { data: messages }]) =>
            <WrapperThread
                thread={thread}
                defaultMessages={messages}
                userId={session.user.id as UserDto["id"]}
                withSetting
            />
        )
        .otherwise(() => <SkeletonThread />)
}