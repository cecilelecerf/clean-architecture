import { NextRequest, NextResponse } from 'next/server';
import { postsFactory } from '@infrastructure/adapters/db/mysql/factories/posts';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { publishActionSchema } from '@/utils/endpoint/feedsEndpoint';
import { usersFactory } from '@infrastructure/adapters/db/mysql/factories/users';
import { safeParseWithLog } from '@/lib/zodUtils';
import { userDtoSchema } from '@infrastructure/types/user';
import { broadcastPostEvent } from '../../sse/route';
import { postSchema } from '@infrastructure/types/feed';

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/posts/[postId]/status'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await ctx.params;
    const body = await req.json();
    const { status } = publishActionSchema.parse(body);

    const result = await postsFactory().updatePostStatusPost.execute({
      userId: session.user.id,
      postId: postId,
      status: status === 'publish',
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );
    }
    const followers = await usersFactory().getUsersByRole.execute({
      userId: session.user.id,
      role: 'client',
    });
    if (followers instanceof Error) {
      return NextResponse.json(
        { name: followers.name, message: followers.message },
        { status: followers.statusCode ?? 400 },
      );
    }
    const postParsed = safeParseWithLog(postSchema, result);

    const followerParsed = safeParseWithLog(userDtoSchema.array(), followers);
    followerParsed.forEach((follower) => {
      broadcastPostEvent(follower.id, {
        type: `${status}_post`,
        post: postParsed,
      });
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
