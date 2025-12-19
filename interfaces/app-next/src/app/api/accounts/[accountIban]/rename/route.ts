import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { accountSchema } from '@infrastructure/types/account';
import { accountFactory } from '@infrastructure/adapters/db/mysql/factories/account';

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<'/api/accounts/[accountIban]/rename'>,
){
  try{
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { accountIban } = await ctx.params;

    const body = await req.json();
    const payload = accountSchema.parse(body);

    const account = await accountFactory().client.renameAccount.execute(accountIban,session.user.id, payload.name);

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