import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || undefined;
  const status = req.nextUrl.searchParams.get("status") || undefined;

  const alunos = await prisma.aluno.findMany({
    where: {
      status: status === "ATIVO" || status === "INATIVO" ? status : undefined,
      OR: q
        ? [
            { nome: { contains: q, mode: "insensitive" } },
            { escola: { contains: q, mode: "insensitive" } },
            { bairro: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: { responsavel: true },
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(alunos);
}

export async function POST(req: NextRequest) {
  const dados = await req.json();

  try {
    const aluno = await prisma.aluno.create({
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
        status: dados.status || "ATIVO",
        observacoes: dados.observacoes || null,
        responsavelId: dados.responsavelId,
      },
    });
    return NextResponse.json(aluno, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ erro: e.message || "Erro ao salvar aluno." }, { status: 500 });
  }
}
