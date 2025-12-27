import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';
import { UserToDTO } from '@domain/entities/UserEntity';
import {
  UserNotActiveError,
  UserNotFoundError,
  UserRoleMismatchError,
} from '@application/errors/users';
import {
  UserAlreadyBannedError,
  UserCannotBanDirectorError,
  UserCannotBanSelfError,
  UserCannotUnbanDirectorError,
  UserNotBannedError,
} from '@domain/errors/user';
import z from 'zod';
const banUserSchema = z.object({ status: z.boolean() });
export type ReqBanUser = z.infer<typeof banUserSchema>;

export async function POST(req: NextRequest, ctx: RouteContext<'/api/users/[userId]/ban'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { userId } = await ctx.params;

    const json = await req.json();
    const data: ReqBanUser = banUserSchema.parse(json);
    let result:
      | UserToDTO
      | UserNotFoundError
      | UserNotActiveError
      | UserRoleMismatchError
      | UserAlreadyBannedError
      | UserCannotBanSelfError
      | UserCannotBanDirectorError
      | UserNotBannedError
      | UserCannotUnbanDirectorError;
    data.status
      ? (result = await usersFactory().banUser.execute({
          targetUserId: userId,
          actorId: session.user.id,
        }))
      : (result = await usersFactory().unbanUser.execute({
          targetUserId: userId,
          actorId: session.user.id,
        }));
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
