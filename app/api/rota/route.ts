import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const itens = await prisma.rotaItem.findMany({
    orderBy: [{ ordem: "asc" }],
  });
  return NextResponse.json(itens);
}

export async function POST(req: NextRequest) {
  const { secao, texto } = await req.json();
  if (!secao || !texto) {
    return NextResponse.json({ erro: "Informe a seção e o texto do item." }, { status: 400 });
  }
  const maior = await prisma.rotaItem.findFirst({
    where: { secao },
    orderBy: { ordem: "desc" },
  });
  const item = await prisma.rotaItem.create({
    data: { secao, texto, ordem: (maior?.ordem ?? -1) + 1, status: "PENDENTE" },
  });
  return NextResponse.json(item, { status: 201 });
}
