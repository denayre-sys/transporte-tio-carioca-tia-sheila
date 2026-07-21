import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const aluno = await prisma.aluno.findUnique({
    where: { id: params.id },
    include: { responsavel: true, mensalidades: { orderBy: { vencimento: "desc" } } },
  });
  if (!aluno) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 });
  return NextResponse.json(aluno);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const dados = await req.json();

  try {
    const aluno = await prisma.aluno.update({
      where: { id: params.id },
      data: {
        nome: dados.nome,
        dataNascimento: dados.dataNascimento ? new Date(dados.dataNascimento) : null,
        escola: dados.escola || null,
        serie: dados.serie || null,
        turno: dados.turno || null,
        itinerarioInicial: dados.itinerarioInicial || null,
        itinerarioFinal: dados.itinerarioFinal || null,
        tipoTransporte: dados.tipoTransporte || null,
        endereco: dados.endereco || null,
        bairro: dados.bairro || null,
        cep: dados.cep || null,
        telefoneAluno: dados.telefoneAluno || null,
        emailAluno: dados.emailAluno || null,
        valorSemDesconto: dados.valorSemDesconto ? parseFloat(dados.valorSemDesconto) : null,
        valorMensalidade: parseFloat(dados.valorMensalidade) || 0,
        diaVencimento: parseInt(dados.diaVencimento, 10) || 10,
        status: dados.status,
        observacoes: dados.observacoes || null,
        responsavelId: dados.responsavelId,
      },
    });
    return NextResponse.json(aluno);
  } catch (e: any) {
    return NextResponse.json({ erro: e.message || "Erro ao atualizar aluno." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.aluno.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
