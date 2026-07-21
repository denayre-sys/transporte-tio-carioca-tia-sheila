import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const dados = await req.json();

  const mensalidade = await prisma.mensalidade.update({
    where: { id: params.id },
    data: {
      status: dados.status,
      valor: dados.valor !== undefined ? parseFloat(dados.valor) : undefined,
      dataPagamento: dados.status === "PAGO" ? new Date(dados.dataPagamento || Date.now()) : null,
      formaPagamento: dados.formaPagamento || null,
      desconto: dados.desconto !== undefined ? parseFloat(dados.desconto) || 0 : 0,
      acrescimo: dados.acrescimo !== undefined ? parseFloat(dados.acrescimo) || 0 : 0,
      multa: dados.multa !== undefined ? parseFloat(dados.multa) || 0 : 0,
      juros: dados.juros !== undefined ? parseFloat(dados.juros) || 0 : 0,
    },
  });

  return NextResponse.json(mensalidade);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.mensalidade.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
