import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { newTransactionSchema } from '@infrastructure/types/transaction';
import { safeParseWithLog } from '@/lib/zodUtils';
import { transactionFactory } from '@infrastructure/adapters/db/mysql/factories/transaction';
import { accountFactory } from '@infrastructure/adapters/db/mysql/factories/account';
import { querySchema } from '@/utils/endpoint/transactionEndpoints';

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
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type');
    const filters = querySchema.parse({
      label: searchParams.get('label') ?? undefined,
      type: type && type !== 'all' ? (searchParams.get('type') as 'debit' | 'credit') : undefined,
      fromDate: searchParams.get('fromDate') ?? undefined,
      toDate: searchParams.get('toDate') ?? undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    const result = await transactionFactory().getAllByAccount.execute({
      iban: accountIban,
      clientId: session.user.id,
      filters,
    });
    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 404 },
      );
    }
    return NextResponse.json({ transactions: result.transactions, total: result.totalPages });
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
