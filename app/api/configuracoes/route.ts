import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obterConfiguracao } from "@/lib/configuracao";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await obterConfiguracao();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const dados = await req.json();
  const atual = await obterConfiguracao();
  const config = await prisma.configuracao.update({
    where: { id: atual.id },
    data: {
      nomeEmpresa: dados.nomeEmpresa,
      emailAlertas: dados.emailAlertas || null,
      alertasAtivos: !!dados.alertasAtivos,
      contratadaDocumento: dados.contratadaDocumento || null,
      contratadaEndereco: dados.contratadaEndereco || null,
      contratadaTelefone: dados.contratadaTelefone || null,
      cidadeForo: dados.cidadeForo || null,
    },
  });
  return NextResponse.json(config);
}
