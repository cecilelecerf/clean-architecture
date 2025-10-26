import { NextRequest, NextResponse } from "next/server";
import { loginFactory } from "@infrastructure/factories/users/loginFactory";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const result = await loginFactory().execute({
      email,
      plainedPassword: password,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Erreur" },
      { status: 400 }
    );
  }
}
