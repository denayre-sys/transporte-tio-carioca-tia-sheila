import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || undefined;

  const responsaveis = await prisma.responsavel.findMany({
    where: q
      ? { nome: { contains: q, mode: "insensitive" } }
      : undefined,
    include: { _count: { select: { alunos: true } } },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(responsaveis);
}

export async function POST(req: NextRequest) {
  const dados = await req.json();

  const responsavel = await prisma.responsavel.create({
    data: {
      nome: dados.nome,
      cpf: dados.cpf || null,
      endereco: dados.endereco || null,
      telefone: dados.telefone || null,
      whatsapp: dados.whatsapp,
      email: dados.email || null,
    },
  });

  return NextResponse.json(responsavel, { status: 201 });
}
