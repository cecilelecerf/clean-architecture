import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { newTransactionSchema } from '@infrastructure/types/transaction';
import { safeParseWithLog } from '@/lib/zodUtils';
import { accountFactory } from '@infrastructure/adapters/db/mysql/factories/account';

export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/api/accounts/[accountIban]/transactions'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { accountIban } = await ctx.params;
    const transactions = [];
    if (transactions instanceof Error) {
      return NextResponse.json(
        { name: transactions.name, message: transactions.message },
        { status: transactions.statusCode ?? 404 },
      );
    }
    return NextResponse.json(transactions);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext<'/api/accounts/[accountIban]/transactions'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { accountIban } = await ctx.params;

    const json = await req.json();
    const data = safeParseWithLog(newTransactionSchema, json);
    const transaction = await accountFactory().transfertBetweenAccount.execute({
      requestUserId: session.user.id,
      fromAccountIban: accountIban,
      amountCurrency: data.currency,
      amountValue: data.amount,
      ...data,
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
