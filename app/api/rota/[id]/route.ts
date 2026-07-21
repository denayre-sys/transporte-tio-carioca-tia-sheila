import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const dados = await req.json();
  const item = await prisma.rotaItem.update({
    where: { id: params.id },
    data: {
      status: dados.status,
      texto: dados.texto,
      ordem: dados.ordem,
    },
  });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.rotaItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
