import { NextRequest, NextResponse } from 'next/server';
import { clientSchema, userSchema } from '@infrastructure/types/user';
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';
import z from 'zod';

const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

const reqSchema = clientSchema
  .pick({
    firstname: true,
    lastname: true,
    email: true,
    address: true,
    dateOfBirth: true,
    phoneNumber: true,
    sexe: true,
  })
  .extend({ plainedPassword: z.string(), confirmPlainedPassword: z.string() });
export type RegisterPayload = z.infer<typeof reqSchema>;

export type RegisterResponse = z.infer<typeof userSchema>;
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const data: RegisterPayload = reqSchema.parse(json);
    const result = await usersFactory().register.execute({
      ...data,
      confirmationUrl: clientUrl,
    });
    if (result instanceof Error)
      return NextResponse.json({ message: result.message }, { status: result.statusCode });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur' }, { status: 400 });
  }
}
