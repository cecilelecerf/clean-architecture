import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { accountFactory } from '@infrastructure/adapters/db/mysql/factories/account';
import { accountSchema } from '@infrastructure/types/account';
import z from 'zod';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/accounts/[accountIban]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { accountIban } = await ctx.params;
    const account = await accountFactory().getAccountByIBAN.execute({
      iban: accountIban,
      userId: session.user.id,
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
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/accounts/[accountIban]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { accountIban } = await ctx.params;

    const account = await accountFactory().deleteAccount.execute(accountIban, session.user.id);

    if (account instanceof Error) {
      return NextResponse.json(
        { name: account.name, message: account.message },
        { status: account.statusCode ?? 404 },
      );
    }

    return NextResponse.json(account);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
