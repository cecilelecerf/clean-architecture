import { NextRequest, NextResponse } from 'next/server';
import { getThreadMessagesFactory } from '@infrastructure/adapters/db/mysql/factories/messages/getThreadMessagesFactory';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/advisor/client-threads/[threadId]/messages'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { threadId } = await ctx.params;

    const messages = await getThreadMessagesFactory().execute({
      userId: session.user.id,
      id: threadId,
    });
    console.log(messages);
    if (messages instanceof Error) {
      return NextResponse.json(
        { name: messages.name, message: messages.message },
        { status: messages.statusCode ?? 404 },
      );
    }

    return NextResponse.json(messages);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
