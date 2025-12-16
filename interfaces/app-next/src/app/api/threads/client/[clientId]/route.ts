import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { threadsFactory } from '@infrastructure/adapters/db/mysql/factories/threads';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/threads/client/[clientId]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { clientId } = await ctx.params;

    const result = await threadsFactory().getThreadsByUserAndTypeUsecase.execute({
    userId:  clientId,
    type: "external",
    advisorId: session.user.id,
    });
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
