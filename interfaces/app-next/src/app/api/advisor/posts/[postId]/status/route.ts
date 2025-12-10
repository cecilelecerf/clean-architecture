import { NextRequest, NextResponse } from 'next/server';
import { postsFactory } from '@infrastructure/adapters/db/mysql/factories/posts';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { PostEntity } from '@domain/entities/PostEntity';
import { UserNotActiveError ,UserNotFoundError,UserRoleMismatchError} from "@application/errors/users";
import { PostNotFoundError,InvalidPostAccessError } from '@application/errors/posts';
 import { publishActionSchema } from '@/utils/endpoint/advisor/feedsEndpoint';

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<'/api/advisor/posts/[postId]/status'>,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await ctx.params;
    const body = await req.json();
    const { status } = publishActionSchema.parse(body);

    let result:
      | PostEntity
      | UserNotFoundError
      | UserNotActiveError
      | PostNotFoundError
      | UserRoleMismatchError
      | InvalidPostAccessError;
    if (status === 'publish') {
      result = await postsFactory().admin.publishPost.execute({
        userId: session.user.id,
        id: postId,
      });
    } else {
      result = await postsFactory().admin.unpublishPost.execute({
        userId: session.user.id,
        id: postId,
      });
    }

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
