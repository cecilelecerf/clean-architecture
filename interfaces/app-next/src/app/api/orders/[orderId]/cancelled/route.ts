import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { orderFactory } from '@infrastructure/adapters/db/mysql/factories/orders';

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<'/api/orders/[orderId]/cancelled'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { orderId } = await ctx.params;

    const result = await orderFactory().cancelledOrder.execute({
      userId: session.user.id,
      orderId,
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
