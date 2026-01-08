import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { creditFactory } from '@infrastructure/adapters/db/mysql/factories/credit';
import { creditSchema } from '@infrastructure/types/credit';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const result = await creditFactory().getCreditsByUser.execute({
      clientId: session.user.id,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const payload = creditSchema
      .pick({
        accountId: true,
        formuleCreditId: true,
        initialAmount: true,
        durationMonths: true,
        startDate: true,
      })
      .partial()
      .parse(body);

    const result = await creditFactory().requestCredit.execute({
      clientId: session.user.id,
      accountId: payload.accountId,
      formuleCreditId: payload.formuleCreditId,
      amount: payload.initialAmount.amount,
      currency: payload.initialAmount.currency,
      durationMonths: payload.durationMonths,
      startDate: payload.startDate,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );
    }

    return NextResponse.json(creditSchema.parse(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
