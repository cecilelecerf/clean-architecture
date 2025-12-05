import { NextRequest, NextResponse } from 'next/server';

// const forgotPasswordUsecase = forgotPasswordFactory;
export async function GET(req: NextRequest) {
  try {
    // const { email } = await req.json();
    // if (!email) return NextResponse.json({ message: 'Email requis' }, { status: 400 });

    // const result = await forgotPasswordUsecase().execute({
    //   email,
    //   confirmationUrl: process.env.FRONTEND_URL,
    // });

    // if (result instanceof Error) {
    //   return NextResponse.json({ name: result.name, message: result.message }, { status: 404 });
    // }

    return NextResponse.json([]);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
