import { NextRequest, NextResponse } from 'next/server';
import { postsFactory } from '@infrastructure/adapters/db/mysql/factories/posts';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { newPostSchema } from '@/utils/endpoint/advisor/feedsEndpoint';
import { postSchema } from '@infrastructure/types/feed';
import z from 'zod';

export async function GET(req: NextRequest, ctx: RouteContext<'/api/advisor/posts/[postId]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await ctx.params;

    const result = await postsFactory().admin.adminFindPostByIdWithTags.execute({
      userId: session.user.id,
      id: postId,
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

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/advisor/posts/[postId]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await ctx.params;

    const body = await req.json();
    console.log('body');
    console.log(body);
    const payload = newPostSchema.partial().parse(body);

    const result = await postsFactory().admin.editPost.execute({
      userId: session.user.id,
      id: postId,
      ...payload,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );
    }
    console.log('result');
    console.log(result);
    return NextResponse.json(
      postSchema
        .omit({ modifiedAt: true, publishedAt: true, createdAt: true })
        .extend({ modifiedAt: z.date(), publishedAt: z.date(), createdAt: z.date() })
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

export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/advisor/posts/[postId]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await ctx.params;

    const result = await postsFactory().admin.deletePost.execute({
      userId: session.user.id,
      id: postId,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );
    }

    // ✅ Retour succès
    return NextResponse.json({ message: 'Post supprimé avec succès' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
