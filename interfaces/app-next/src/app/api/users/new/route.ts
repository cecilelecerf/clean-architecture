import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';
import { userSchema } from '@infrastructure/types/user';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import z from 'zod';
import { authOptions } from '../../auth/[...nextauth]/route';
const clientUrl = process.env.NEXT_PUBLIC_CLIENT_URL;

const registerAdminPayload = userSchema.pick({
  firstname: true,
  lastname: true,
  email: true,
  role: true,
});
export type RegisterAdminPayload = z.infer<typeof registerAdminPayload>;

export type RegisterResponse = z.infer<typeof userSchema>;
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const json = await req.json();
    const data: RegisterAdminPayload = registerAdminPayload.parse(json);
    const result = await usersFactory().createUser.execute({
      ...data,
      confirmationUrl: clientUrl,
      directorId: session.user.id,
    });
    if (result instanceof Error)
      return NextResponse.json({ message: result.message }, { status: result.statusCode });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur' }, { status: 400 });
  }
}
