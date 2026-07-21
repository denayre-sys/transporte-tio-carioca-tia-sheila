import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/format";
import { APP_NAME } from "@/lib/config";

export async function montarESugerirAlertaDoDia() {
  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setUTCDate(amanha.getUTCDate() + 1);

  await prisma.mensalidade.updateMany({
    where: { status: "ABERTO", vencimento: { lt: hoje } },
    data: { status: "ATRASADO" },
  });

  const [vencimentosHoje, alunosAtivos] = await Promise.all([
    prisma.mensalidade.findMany({
      where: { status: { in: ["ABERTO", "ATRASADO"] }, vencimento: { gte: hoje, lt: amanha } },
      include: { aluno: true },
      orderBy: { vencimento: "asc" },
    }),
    prisma.aluno.findMany({ where: { status: "ATIVO" } }),
  ]);

  const mesAtual = hoje.getUTCMonth();
  const diaAtual = hoje.getUTCDate();
  const aniversariantesHoje = alunosAtivos.filter(
    (a) => a.dataNascimento && new Date(a.dataNascimento).getUTCMonth() === mesAtual && new Date(a.dataNascimento).getUTCDate() === diaAtual
  );

  const dataFormatada = hoje.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const linhasVencimentos = vencimentosHoje.length
    ? vencimentosHoje.map((m) => `<li>${m.aluno.nome} — ${formatarMoeda(Number(m.valor))}</li>`).join("")
    : "<li>Nada vencendo hoje.</li>";

  const linhasAniversarios = aniversariantesHoje.length
    ? aniversariantesHoje.map((a) => `<li>${a.nome} 🎂</li>`).join("")
    : "<li>Ninguém faz aniversário hoje.</li>";

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#3F5A45;">${APP_NAME} — Alertas do dia</h2>
      <p style="color:#555;">${dataFormatada}</p>
      <h3>Vencimentos de hoje (${vencimentosHoje.length})</h3>
      <ul>${linhasVencimentos}</ul>
      <h3>Aniversariantes de hoje (${aniversariantesHoje.length})</h3>
      <ul>${linhasAniversarios}</ul>
    </div>
  `;

  return { html, vencimentosHoje, aniversariantesHoje, dataFormatada };
}

export async function enviarEmailAlerta(destinatario: string, html: string, dataFormatada: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY não configurada.");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${APP_NAME} <onboarding@resend.dev>`,
      to: [destinatario],
      subject: `${APP_NAME} — Alertas de ${dataFormatada}`,
      html,
    }),
  });
  if (!res.ok) {
    const texto = await res.text();
    throw new Error(`Falha ao enviar e-mail: ${texto}`);
  }
}
