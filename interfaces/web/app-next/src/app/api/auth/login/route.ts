import { NextRequest, NextResponse } from 'next/server';
import { loginFactory } from '@infrastructure/factories/users/loginFactory';
import { userSchema } from '@infrastructure/types/user';
import z from 'zod';

const reqSchema = userSchema.pick({ email: true }).extend({ plainedPassword: z.string() });
export type LoginPayload = z.infer<typeof reqSchema>;

export type LoginResponse = z.infer<typeof userSchema>;

export async function POST(req: NextRequest) {
  try {
    const data = reqSchema.parse(req.json());
    const result = await loginFactory().execute(data);
    if (result instanceof Error)
      return NextResponse.json({ message: result.message }, { status: result.statusCode });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ message: err.message || 'Erreur' }, { status: 400 });
  }
}
