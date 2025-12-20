import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { accountSchema } from '@infrastructure/types/account';
import { transactionSchema } from '@infrastructure/types/transaction';
import { accountFactory } from '@infrastructure/adapters/db/mysql/factories/account';
import z from 'zod';

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<'/api/accounts/[accountIban]/transfer'>,
){
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { accountIban } = await ctx.params;

    const body = await req.json();
    const payloadAccount = accountSchema.pick({ IBAN: true }).partial().parse(body);
    const payloadTransaction = transactionSchema.pick({ amount: true, currency: true, label: true, icon: true}).partial().parse(body);

    const account = await accountFactory().client.transfertBetweenAccount.execute({
      requestUserId: session.user.id,
      fromIbanString: accountIban,
      toIbanString: payloadAccount.IBAN,
      amountValue: payloadTransaction.amount,
      amountCurrency: payloadTransaction.currency,
      label: payloadTransaction.label,
      icon: payloadTransaction.icon
    });

    if (account instanceof Error) {
      return NextResponse.json(
        { name: account.name, message: account.message },
        { status: account.statusCode ?? 404 },
      );
    }

    return NextResponse.json(
        accountSchema
          .omit({ createdAt: true, updatedAt: true })
          .extend({
            createdAt: z.date(),
            updatedAt: z.date().optional(),
          })
          .parse(account),
    );
    
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}