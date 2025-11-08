import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { threadsFactory } from '@infrastructure/adapters/db/mysql/factories/threads';
import { threadSchema } from '@infrastructure/types/thread';
import z from 'zod';
import { messageSchema } from '@infrastructure/types/message';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const result = await threadsFactory().clientGetAllThread.execute(session.user.id);
    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 404 },
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

const newThreadSchmea = threadSchema
  .pick({ title: true })
  .extend({ messageContent: messageSchema.shape.content });
export type NewThread = z.infer<typeof newThreadSchmea>;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const json = await req.json();
    const data = newThreadSchmea.parse(json);
    const thread = await threadsFactory().startExternalThread.execute({
      ...data,
      clientId: session.user.id,
    });
    if (thread instanceof Error) {
      return NextResponse.json(
        { name: thread.name, message: thread.message },
        { status: thread.statusCode ?? 404 },
      );
    }
    return NextResponse.json(thread);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
