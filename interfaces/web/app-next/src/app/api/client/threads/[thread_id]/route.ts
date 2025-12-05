import { NextRequest, NextResponse } from 'next/server';
import { getThreadMessagesFactory } from '@infrastructure/adapters/db/mysql/factories/threads/getThreadMessagesFactory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { findThreadWithUserFactory } from '@infrastructure/adapters/db/mysql/factories/threads/findThreadWithUserFactory';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/client/threads/[thread_id]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { thread_id } = await ctx.params;

    const thread = await findThreadWithUserFactory().execute(thread_id, session.user.id);
    if (thread instanceof Error) {
      return NextResponse.json(
        { name: thread.name, message: thread.message },
        { status: thread.statusCode ?? 404 },
      );
    }
    const messages = await getThreadMessagesFactory().execute({
      userId: session.user.id,
      id: thread_id,
    });
    if (messages instanceof Error) {
      return NextResponse.json(
        { name: messages.name, message: messages.message },
        { status: messages.statusCode ?? 404 },
      );
    }

    return NextResponse.json({ ...thread, messages });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
