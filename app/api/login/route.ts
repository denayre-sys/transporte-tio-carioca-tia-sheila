import { NextRequest, NextResponse } from "next/server";
import { criarSessao } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { senha } = await req.json();

  if (senha !== process.env.APP_SENHA) {
    return NextResponse.json({ erro: "Senha incorreta." }, { status: 401 });
  }

  const token = await criarSessao();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sessao", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
