import { NextRequest, NextResponse } from "next/server";
import { registerFactory } from "@infrastructure/factories/users/registerFactory";

export async function POST(req: NextRequest) {
  try {
    const result = await registerFactory().execute(await req.json());
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Erreur" },
      { status: 400 }
    );
  }
}
