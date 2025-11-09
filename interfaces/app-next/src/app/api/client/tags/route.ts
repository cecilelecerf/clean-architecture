import { NextResponse } from 'next/server';
import { tagsFactory } from '@infrastructure/adapters/db/mysql/factories/tags';
import { getServerSession } from 'next-auth';
import { tagSchema } from '@infrastructure/types/feed';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const result = await tagsFactory().getAllTags.execute();
    if (result instanceof Error) {
      return NextResponse.json({ name: result.name, message: result.message }, { status: 404 });
    }

    return NextResponse.json(tagSchema.array().parse(result));
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 },
    );
  }
}
