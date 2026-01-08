import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { formuleFactory } from '@infrastructure/adapters/db/mysql/factories/formules';
import { formuleSchema } from '@infrastructure/types/formule';
import z from 'zod';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const result = await formuleFactory().getAll.execute({ userId: session.user.id });

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
    const payload = formuleSchema
      .pick({
        interestRate: true,
        insuranceRate: true,
        label: true,
        type: true,
        description: true,
        accountId: true,
        minAmount: true,
        maxAmount: true,
        currency: true,
      })
      .partial()
      .parse(body);

    const result = await formuleFactory().createFormule.execute({
      userId: session.user.id,
      interestRate: payload.interestRate,
      insuranceRate: payload.insuranceRate,
      label: payload.label,
      type: payload.type,
      description: payload.description,
      accountId: payload.accountId,
      minAmount: payload.minAmount,
      maxAmount: payload.maxAmount,
      currency: payload.currency,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );
    }

    return NextResponse.json(
      formuleSchema
        .omit({ createdAt: true, updatedAt: true })
        .extend({
          createdAt: z.date(),
          updatedAt: z.date().optional(),
        })
        .parse(result),
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
