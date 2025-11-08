import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { sendMessageFactory } from '@infrastructure/adapters/db/mysql/factories/messages/sendMessageFactory';
import { messageSchema } from '@infrastructure/types/message';
import z from 'zod';
export const newMessageSchema = messageSchema.pick({ content: true });
export type NewMessage = z.infer<typeof newMessageSchema>;
export async function POST(
  req: NextRequest,
  ctx: RouteContext<'/api/client/threads/[thread_id]/messages/new'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { thread_id } = await ctx.params;
    const json = await req.json();
    const data = newMessageSchema.parse(json);
    const message = await sendMessageFactory().execute({
      ...data,
      threadId: thread_id,
      senderId: session.user.id,
    });
    if (message instanceof Error) {
      return NextResponse.json(
        { name: message.name, message: message.message },
        { status: message.statusCode ?? 404 },
      );
    }

    return NextResponse.json(message);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
