import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const tipo = req.nextUrl.searchParams.get("tipo");
  const mes = req.nextUrl.searchParams.get("mes") || undefined;

  switch (tipo) {
    case "recebidas": {
      const dados = await prisma.mensalidade.findMany({
        where: { status: "PAGO", mesReferencia: mes },
        include: { aluno: true },
        orderBy: { dataPagamento: "asc" },
      });
      return NextResponse.json(
        dados.map((m) => ({
          aluno: m.aluno.nome,
          mes: m.mesReferencia,
          valor: Number(m.valor),
          dataPagamento: m.dataPagamento,
          formaPagamento: m.formaPagamento,
        }))
      );
    }

    case "atraso": {
      const dados = await prisma.mensalidade.findMany({
        where: { status: "ATRASADO" },
        include: { aluno: { include: { responsavel: true } } },
        orderBy: { vencimento: "asc" },
      });
      return NextResponse.json(
        dados.map((m) => ({
          aluno: m.aluno.nome,
          responsavel: m.aluno.responsavel.nome,
          whatsapp: m.aluno.responsavel.whatsapp,
          mes: m.mesReferencia,
          vencimento: m.vencimento,
          valor: Number(m.valor),
        }))
      );
    }

    case "inadimplentes": {
      const atrasadas = await prisma.mensalidade.findMany({
        where: { status: "ATRASADO" },
        include: { aluno: { include: { responsavel: true } } },
      });
      const mapa = new Map<string, any>();
      for (const m of atrasadas) {
        const chave = m.alunoId;
        if (!mapa.has(chave)) {
          mapa.set(chave, {
            aluno: m.aluno.nome,
            responsavel: m.aluno.responsavel.nome,
            whatsapp: m.aluno.responsavel.whatsapp,
            quantidade: 0,
            totalDevido: 0,
          });
        }
        const item = mapa.get(chave);
        item.quantidade += 1;
        item.totalDevido += Number(m.valor);
      }
      return NextResponse.json(Array.from(mapa.values()).sort((a, b) => b.totalDevido - a.totalDevido));
    }

    case "receita-mes": {
      const pagas = await prisma.mensalidade.findMany({ where: { status: "PAGO" } });
      const mapa = new Map<string, number>();
      for (const m of pagas) {
        mapa.set(m.mesReferencia, (mapa.get(m.mesReferencia) || 0) + Number(m.valor));
      }
      const linhas = Array.from(mapa.entries())
        .map(([mesRef, total]) => ({ mes: mesRef, total }))
        .sort((a, b) => a.mes.localeCompare(b.mes));
      return NextResponse.json(linhas);
    }

    case "receita-escola": {
      const pagas = await prisma.mensalidade.findMany({ where: { status: "PAGO" }, include: { aluno: true } });
      const mapa = new Map<string, number>();
      for (const m of pagas) {
        const escola = m.aluno.escola || "Sem escola";
        mapa.set(escola, (mapa.get(escola) || 0) + Number(m.valor));
      }
      const linhas = Array.from(mapa.entries())
        .map(([escola, total]) => ({ escola, total }))
        .sort((a, b) => b.total - a.total);
      return NextResponse.json(linhas);
    }

    case "receita-bairro": {
      const pagas = await prisma.mensalidade.findMany({ where: { status: "PAGO" }, include: { aluno: true } });
      const mapa = new Map<string, number>();
      for (const m of pagas) {
        const bairro = m.aluno.bairro || "Sem bairro";
        mapa.set(bairro, (mapa.get(bairro) || 0) + Number(m.valor));
      }
      const linhas = Array.from(mapa.entries())
        .map(([bairro, total]) => ({ bairro, total }))
        .sort((a, b) => b.total - a.total);
      return NextResponse.json(linhas);
    }

    case "aniversariantes": {
      const alunos = await prisma.aluno.findMany({ where: { status: "ATIVO" } });
      const linhas = alunos
        .filter((a) => a.dataNascimento)
        .map((a) => ({
          aluno: a.nome,
          escola: a.escola,
          dataNascimento: a.dataNascimento,
        }))
        .sort((a, b) => {
          const da = new Date(a.dataNascimento!);
          const db = new Date(b.dataNascimento!);
          if (da.getUTCMonth() !== db.getUTCMonth()) return da.getUTCMonth() - db.getUTCMonth();
          return da.getUTCDate() - db.getUTCDate();
        });
      return NextResponse.json(linhas);
    }

    case "alunos-completo": {
      const alunos = await prisma.aluno.findMany({
        include: { responsavel: true },
        orderBy: { nome: "asc" },
      });
      return NextResponse.json(
        alunos.map((a) => ({
          aluno: a.nome,
          escola: a.escola,
          serie: a.serie,
          turno: a.turno,
          responsavel: a.responsavel.nome,
          whatsapp: a.responsavel.whatsapp,
          valorMensalidade: Number(a.valorMensalidade),
          status: a.status,
        }))
      );
    }

    default:
      return NextResponse.json({ erro: "Tipo de relatório inválido." }, { status: 400 });
  }
}
