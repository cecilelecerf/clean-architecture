import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/api/accounts/[accountIban]/transactions/[transactionId]'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { accountIban, transactionId } = await ctx.params;
    // const account = await accountFactory().client.getAccountByIBAN.execute({
    //   iban: accountIban,
    //   userId: session.user.id,
    // });
    const transaction = [];
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
