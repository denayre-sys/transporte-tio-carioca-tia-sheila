import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mesReferenciaAtual } from "@/lib/format";

export async function POST() {
  const mes = mesReferenciaAtual();
  const [ano, mesNum] = mes.split("-").map(Number);

  const alunos = await prisma.aluno.findMany({ where: { status: "ATIVO" } });

  let criadas = 0;
  for (const aluno of alunos) {
    const existe = await prisma.mensalidade.findUnique({
      where: { alunoId_mesReferencia: { alunoId: aluno.id, mesReferencia: mes } },
    });
    if (existe) continue;

    const vencimento = new Date(Date.UTC(ano, mesNum - 1, aluno.diaVencimento || 10));

    await prisma.mensalidade.create({
      data: {
        alunoId: aluno.id,
        mesReferencia: mes,
        valor: aluno.valorMensalidade,
        vencimento,
        status: "ABERTO",
      },
    });
    criadas++;
  }

  return NextResponse.json({ criadas, mes });
}
