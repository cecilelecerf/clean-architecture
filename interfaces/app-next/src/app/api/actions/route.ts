import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { actionSchema, newActionSchema } from '@infrastructure/types/action';
import { actionFactory } from '@infrastructure/adapters/db/mysql/factories/action';
import z from 'zod';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isAvailableParam = searchParams.get('isAvailable');

    const isAvailable: boolean | undefined =
      isAvailableParam !== null ? isAvailableParam === 'true' : true;

    const result = await actionFactory().getAllActionsByAvailability.execute({
      userId: session.user.id,
      isAvailable,
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
    const payload = newActionSchema.parse(body);

    const result = await actionFactory().admin.createAction.execute({
      userId: session.user.id,
      ...payload,
      priceAmount: payload.price.amount,
      priceCurrency: payload.price.currency,
      totalNb: payload.quantity,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );
    }

    return NextResponse.json(actionSchema.parse(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
