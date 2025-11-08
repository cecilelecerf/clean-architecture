import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { tagsFactory } from '@infrastructure/adapters/db/mysql/factories/tags';
import { tagSchema } from '@infrastructure/types/feed';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/advisor/tags/[tagId]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { tagId } = await ctx.params;
    const body = await req.json();
    const payload = tagSchema.pick({ label: true, color: true }).partial().parse(body);

    const result = await tagsFactory().updateTag.execute({
      id: tagId,
      administratorId: session.user.id,
      ...payload,
    });

    if (result instanceof Error)
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );

    return NextResponse.json(tagSchema.parse(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/advisor/tags/[tagId]'>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { tagId } = await ctx.params;

    const result = await tagsFactory().deleteTag.execute({
      id: tagId,
      administratorId: session.user.id,
    });

    if (result instanceof Error)
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: result.statusCode ?? 400 },
      );

    return NextResponse.json({ message: 'Tag supprimé avec succès' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
