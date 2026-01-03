import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { formuleFactory } from '@infrastructure/adapters/db/mysql/factories/formules';
import { formuleSchema } from '@infrastructure/types/formule';
import z from 'zod';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/formules/[formuleId]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { formuleId } = await ctx.params;

    const result = await formuleFactory().getFormule.execute({
      userId: session.user.id,
      formuleId: formuleId,
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

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/formules/[formuleId]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { formuleId } = await ctx.params;

    const body = await req.json();
    const payload = formuleSchema
      .pick({
        interestRate: true,
        insuranceRate: true,
        type: true,
        label: true,
        description: true,
        isActive: true,
        accountId: true,
        minAmount: true,
        maxAmount: true,
        currency: true,
      })
      .partial()
      .parse(body);

    const result = await formuleFactory().updateFormule.execute({
      userId: session.user.id,
      id: formuleId,
      interestRate: payload.interestRate,
      insuranceRate: payload.insuranceRate,
      label: payload.label,
      type: payload.type,
      description: payload.description,
      isActive: payload.isActive,
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

    return NextResponse.json(formuleSchema.parse(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
