import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordFactory } from "@infrastructure/factories/users/forgotPasswordFactory";

const forgotPasswordUsecase = forgotPasswordFactory;
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ message: "Email requis" }, { status: 400 });

    const result = await forgotPasswordUsecase().execute({
      email,
      confirmationUrl: process.env.FRONTEND_URL,
    });

    if (result instanceof Error) {
      return NextResponse.json(
        { name: result.name, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Email de réinitialisation envoyé !" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
