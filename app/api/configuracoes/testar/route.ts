import { NextResponse } from "next/server";
import { obterConfiguracao } from "@/lib/configuracao";
import { montarESugerirAlertaDoDia, enviarEmailAlerta } from "@/lib/alertaDiario";

export async function POST() {
  const config = await obterConfiguracao();
  if (!config.emailAlertas) {
    return NextResponse.json({ erro: "Cadastre um e-mail para alertas antes de testar." }, { status: 400 });
  }
  try {
    const { html, dataFormatada, vencimentosHoje, aniversariantesHoje } = await montarESugerirAlertaDoDia();
    await enviarEmailAlerta(config.emailAlertas, html, dataFormatada);
    return NextResponse.json({
      ok: true,
      vencimentos: vencimentosHoje.length,
      aniversariantes: aniversariantesHoje.length,
    });
  } catch (e: any) {
    return NextResponse.json({ erro: e.message || "Falha ao enviar e-mail de teste." }, { status: 500 });
  }
}
