import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { buyActionSchema, newActionSchema } from '@infrastructure/types/action';
import { actionFactory } from '@infrastructure/adapters/db/mysql/factories/action';

export async function POST(request: NextRequest, ctx: RouteContext<'/api/actions/[ISIN]/buy'>) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { ISIN } = await ctx.params;

    const body = await request.json();
    const { accountId, quantity } = buyActionSchema.parse(body);

    const result = await actionFactory().buy.execute({
      userId: session.user.id,
      accountId,
      isin: ISIN,
      quantity,
    });

    if (result instanceof Error) {
      return NextResponse.json({ error: result.message }, { status: result.statusCode || 400 });
    }

    return NextResponse.json({
      order: result.order,
      transaction: result.transaction.toDTO(),
    });
  } catch (error) {
    console.error('Error buying action:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
