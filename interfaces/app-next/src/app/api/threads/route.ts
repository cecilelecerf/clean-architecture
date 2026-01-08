import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { threadsFactory } from '@infrastructure/adapters/db/mysql/factories/threads';
import { newExternalThreadSchema, newThreadSchema } from '@infrastructure/types/thread';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'external' | 'internal' | null;
    const thread = await threadsFactory().getThreadsByUserAndTypeUsecase.execute({
      userId: session.user.id,
      type: type ?? undefined,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'external' | 'internal' | null;
    if (type === 'external') {
      const json = await req.json();
      const data = newExternalThreadSchema.parse(json);
      const result = await threadsFactory().startExternalThread.execute({
        clientId: data.participantsId[0],
        ...data,
        actorId: session.user.id,
      });
      if (result instanceof Error) {
        return NextResponse.json(
          { name: result.name, message: result.message },
          { status: result.statusCode ?? 404 },
        );
      }
      return NextResponse.json(result, { status: 201 });
    } else if (type === 'internal') {
      const json = await req.json();
      const data = newThreadSchema.parse(json);
      const result = await threadsFactory().startInternalThread.execute({
        administratorId: session.user.id,
        ...data,
        participantsId: data.participantsId ?? [],
      });
      if (result instanceof Error) {
        return NextResponse.json(
          { name: result.name, message: result.message },
          { status: result.statusCode ?? 404 },
        );
      }
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json({ message: 'Invalid thread type' }, { status: 400 });
    }
  } catch (err) {
    console.error('Error in POST /api/threads:', err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
