import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { senhaConfere } from "@/lib/acesso";
import { gerarHash } from "@/lib/senha";

export const dynamic = "force-dynamic";

const TAMANHO_MINIMO = 6;

export async function POST(req: NextRequest) {
  const { senhaAtual, novaSenha } = await req.json();

  if (typeof novaSenha !== "string" || novaSenha.length < TAMANHO_MINIMO) {
    return NextResponse.json({ erro: `A nova senha precisa ter pelo menos ${TAMANHO_MINIMO} caracteres.` }, { status: 400 });
  }
  if (novaSenha.length > 200) {
    return NextResponse.json({ erro: "A nova senha é muito longa." }, { status: 400 });
  }
  if (!(await senhaConfere(senhaAtual))) {
    return NextResponse.json({ erro: "A senha atual está incorreta." }, { status: 401 });
  }
  if (novaSenha === senhaAtual) {
    return NextResponse.json({ erro: "A nova senha precisa ser diferente da atual." }, { status: 400 });
  }

  const senhaHash = gerarHash(novaSenha);
  await prisma.acesso.upsert({
    where: { id: "principal" },
    update: { senhaHash },
    create: { id: "principal", senhaHash },
  });

  return NextResponse.json({ ok: true });
}
