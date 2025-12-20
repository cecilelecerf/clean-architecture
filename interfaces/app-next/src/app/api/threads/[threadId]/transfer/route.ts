import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { threadsFactory } from '@infrastructure/adapters/db/mysql/factories/threads';
import z from 'zod';
import { userIdSchema } from '@infrastructure/types/user';
import { safeParseWithLog } from '@/lib/zodUtils';

const addParticipantSchema = z.object({ newAdministratorId: userIdSchema });
export type AddParticipant = z.infer<typeof addParticipantSchema>;
export async function POST(
  req: NextRequest,
  ctx: RouteContext<'/api/threads/[threadId]/transfer'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { threadId } = await ctx.params;
    const body = await req.json();
    const payload = safeParseWithLog(addParticipantSchema, body);

    const thread = await threadsFactory().transferThread.execute({
      id: threadId,
      administratorId: session.user.id,
      newAdministratorId: payload.newAdministratorId,
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
