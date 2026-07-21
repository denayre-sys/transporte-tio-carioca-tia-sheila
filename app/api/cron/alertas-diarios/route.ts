import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obterConfiguracao } from "@/lib/configuracao";
import { montarESugerirAlertaDoDia, enviarEmailAlerta } from "@/lib/alertaDiario";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const config = await obterConfiguracao();
  if (!config.alertasAtivos || !config.emailAlertas) {
    return NextResponse.json({ ok: true, enviado: false, motivo: "Alertas desativados ou sem e-mail configurado." });
  }

  try {
    const { html, dataFormatada } = await montarESugerirAlertaDoDia();
    await enviarEmailAlerta(config.emailAlertas, html, dataFormatada);
    await prisma.configuracao.update({ where: { id: config.id }, data: { ultimaExecucao: new Date() } });
    return NextResponse.json({ ok: true, enviado: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, erro: e.message }, { status: 500 });
  }
}
