import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { orderFactory } from '@infrastructure/adapters/db/mysql/factories/orders';
import { buyActionSchema } from '@infrastructure/types/order';

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/orders/actions/[ISIN]/[type]'>,
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const { ISIN, type } = await ctx.params;

    const body = await request.json();
    const { IBAN, quantity, price } = buyActionSchema.parse(body);

    const result = await orderFactory().placeOrder.execute({
      userId: session.user.id,
      IBAN,
      ISIN,
      type: type as 'buy' | 'sell',
      quantity,
      price: price.amount,
    });

    if (result instanceof Error) {
      return NextResponse.json({ error: result.message }, { status: result.statusCode || 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error buying action:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
