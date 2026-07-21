import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const responsavel = await prisma.responsavel.findUnique({
    where: { id: params.id },
    include: { alunos: true },
  });
  if (!responsavel) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  return NextResponse.json(responsavel);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const dados = await req.json();

  const responsavel = await prisma.responsavel.update({
    where: { id: params.id },
    data: {
      nome: dados.nome,
      cpf: dados.cpf || null,
      endereco: dados.endereco || null,
      telefone: dados.telefone || null,
      whatsapp: dados.whatsapp,
      email: dados.email || null,
    },
  });

  return NextResponse.json(responsavel);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.responsavel.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
