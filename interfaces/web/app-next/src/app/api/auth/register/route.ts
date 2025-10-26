import { NextRequest, NextResponse } from 'next/server';
import { registerFactory } from '@infrastructure/factories/users/registerFactory';
import { userSchema } from '@infrastructure/types/user';
import z from 'zod';

const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

const reqSchema = userSchema
  .pick({ firstname: true, lastname: true, email: true })
  .extend({ plainedPassword: z.string() });
export type RegisterPayload = z.infer<typeof reqSchema>;

export type RegisterResponse = z.infer<typeof userSchema>;
export async function POST(req: NextRequest) {
  try {
    const data: RegisterPayload = reqSchema.parse(await req.json());
    const result = await registerFactory().execute({
      ...data,
      confirmationUrl: clientUrl,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ message: err.message || 'Erreur' }, { status: 400 });
  }
}
