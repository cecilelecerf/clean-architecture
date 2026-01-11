import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { creditFactory } from '@infrastructure/adapters/db/mysql/factories/credit';
import { creditSchema } from '@infrastructure/types/credit';
import z from 'zod';

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/credits/[creditId]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { creditId } = await ctx.params;
    const result = await creditFactory().getCredit.execute({
      creditId: creditId,
      actorId: session.user.id,
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
