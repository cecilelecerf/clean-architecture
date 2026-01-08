import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { transactionFactory } from '@infrastructure/adapters/db/mysql/factories/transaction';

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/accounts/[accountIban]/transactions/[transactionId]/users/[userId]'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { transactionId, userId } = await ctx.params;
    const transaction = await transactionFactory().getById.execute({
      transactionId: transactionId,
      userId,
      requestUserId: session.user.id,
    });
    if (transaction instanceof Error) {
      return NextResponse.json(
        { name: transaction.name, message: transaction.message },
        { status: transaction.statusCode ?? 404 },
      );
    }
    return NextResponse.json(transaction);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
