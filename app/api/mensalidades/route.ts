import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Atualiza o status de ABERTO -> ATRASADO para mensalidades vencidas ainda não pagas
async function atualizarAtrasadas() {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  await prisma.mensalidade.updateMany({
    where: { status: "ABERTO", vencimento: { lt: hoje } },
    data: { status: "ATRASADO" },
  });
}

export async function GET(req: NextRequest) {
  await atualizarAtrasadas();

  const status = req.nextUrl.searchParams.get("status") || undefined;
  const mes = req.nextUrl.searchParams.get("mes") || undefined;

  const mensalidades = await prisma.mensalidade.findMany({
    where: {
      status: ["PAGO", "ABERTO", "ATRASADO", "ISENTO"].includes(status || "")
        ? (status as any)
        : undefined,
      mesReferencia: mes || undefined,
    },
    include: { aluno: { include: { responsavel: true } } },
    orderBy: { vencimento: "asc" },
  });

  return NextResponse.json(mensalidades);
}
