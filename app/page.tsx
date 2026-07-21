import { prisma } from "@/lib/prisma";
import { formatarMoeda, formatarData, mesReferenciaAtual } from "@/lib/format";
import GraficoAdimplencia from "@/components/GraficoAdimplencia";

export const dynamic = "force-dynamic";

function Card({ label, valor, destaque }: { label: string; valor: string; destaque?: boolean }) {
  return (
    <div className="bg-white rounded-card border border-line p-3 md:p-5 min-w-0">
      <p className="text-xs md:text-sm text-ink/60 mb-1 truncate">{label}</p>
      <p className={`text-lg md:text-2xl font-display break-words ${destaque ? "text-clay" : "text-ink"}`}>{valor}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const mes = mesReferenciaAtual();
  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setUTCDate(amanha.getUTCDate() + 1);
  const em7dias = new Date(hoje);
  em7dias.setUTCDate(em7dias.getUTCDate() + 7);

  await prisma.mensalidade.updateMany({
    where: { status: "ABERTO", vencimento: { lt: hoje } },
    data: { status: "ATRASADO" },
  });

  const [totalAlunos, totalResponsaveis, mensalidadesMes, proximosVencimentos, vencimentosHoje, alunosAtivos] =
    await Promise.all([
      prisma.aluno.count({ where: { status: "ATIVO" } }),
      prisma.responsavel.count(),
      prisma.mensalidade.findMany({ where: { mesReferencia: mes } }),
      prisma.mensalidade.findMany({
        where: { status: "ABERTO", vencimento: { gte: hoje, lte: em7dias } },
        include: { aluno: true },
        orderBy: { vencimento: "asc" },
        take: 8,
      }),
      prisma.mensalidade.findMany({
        where: { status: { in: ["ABERTO", "ATRASADO"] }, vencimento: { gte: hoje, lt: amanha } },
        include: { aluno: true },
        orderBy: { vencimento: "asc" },
      }),
      prisma.aluno.findMany({ where: { status: "ATIVO" } }),
    ]);

  const previsto = mensalidadesMes.reduce((s, m) => s + Number(m.valor), 0);
  const recebido = mensalidadesMes
    .filter((m) => m.status === "PAGO")
    .reduce((s, m) => s + Number(m.valor), 0);
  const emAberto = mensalidadesMes
    .filter((m) => m.status === "ABERTO" || m.status === "ATRASADO")
    .reduce((s, m) => s + Number(m.valor), 0);

  const alunosComAtraso = new Set(
    mensalidadesMes.filter((m) => m.status === "ATRASADO").map((m) => m.alunoId)
  );
  const inadimplentes = alunosComAtraso.size;
  const adimplentes = Math.max(totalAlunos - inadimplentes, 0);

  const mesAtualNum = hoje.getUTCMonth();
  const diaAtualNum = hoje.getUTCDate();
  const aniversariantes = alunosAtivos
    .filter((a) => a.dataNascimento && new Date(a.dataNascimento).getUTCMonth() === mesAtualNum)
    .sort(
      (a, b) => new Date(a.dataNascimento!).getUTCDate() - new Date(b.dataNascimento!).getUTCDate()
    );
  const aniversariantesHoje = aniversariantes.filter(
    (a) => new Date(a.dataNascimento!).getUTCDate() === diaAtualNum
  );

  const receitaPorEscolaMapa: Record<string, number> = {};
  alunosAtivos.forEach((a) => {
    const escola = a.escola || "Sem escola";
    receitaPorEscolaMapa[escola] = (receitaPorEscolaMapa[escola] || 0) + Number(a.valorMensalidade);
  });
  const receitaPorEscola = Object.entries(receitaPorEscolaMapa).sort((a, b) => b[1] - a[1]);
  const totalReceitaEscolas = receitaPorEscola.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="max-w-full overflow-x-hidden">
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-1">Painel</h1>
      <p className="text-ink/60 mb-6 md:mb-8 text-sm md:text-base">Visão geral da operação de hoje.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-8">
        <Card label="Alunos ativos" valor={String(totalAlunos)} />
        <Card label="Aniversariantes hoje" valor={String(aniversariantesHoje.length)} />
        <Card label="Vencimentos hoje" valor={String(vencimentosHoje.length)} />
        <Card label="Recebido no mês" valor={formatarMoeda(recebido)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-3 md:mb-6">
        <div className="bg-white rounded-card border border-line p-3 md:p-5 min-w-0">
          <h2 className="font-display text-base md:text-lg mb-3">Resumo financeiro — {mes}</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card label="Previsto" valor={formatarMoeda(previsto)} />
            <Card label="Em aberto" valor={formatarMoeda(emAberto)} destaque={emAberto > 0} />
          </div>
        </div>
        <div className="bg-white rounded-card border border-line p-3 md:p-5 min-w-0">
          <h2 className="font-display text-base md:text-lg mb-1">Adimplentes x Inadimplentes</h2>
          <p className="text-xs text-ink/50 mb-2">Alunos ativos com mensalidade em atraso este mês</p>
          <div className="min-w-0 w-full">
            <GraficoAdimplencia adimplentes={adimplentes} inadimplentes={inadimplentes} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-card border border-line p-3 md:p-5 mb-4 md:mb-6 min-w-0">
        <h2 className="font-display text-base md:text-lg mb-1">Receita por escola</h2>
        <p className="text-xs text-ink/50 mb-3">Mensalidade prevista dos alunos ativos, por escola</p>
        {receitaPorEscola.length === 0 ? (
          <p className="text-sm text-ink/50">Nenhum aluno ativo cadastrado ainda.</p>
        ) : (
          <ul className="space-y-2">
            {receitaPorEscola.map(([escola, valor]) => {
              const percentual = totalReceitaEscolas > 0 ? (valor / totalReceitaEscolas) * 100 : 0;
              return (
                <li key={escola}>
                  <div className="flex justify-between text-sm mb-1 gap-2">
                    <span className="text-ink/80 truncate">{escola}</span>
                    <span className="text-ink font-medium whitespace-nowrap">{formatarMoeda(valor)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-mist rounded-full overflow-hidden">
                    <div className="h-full bg-moss rounded-full" style={{ width: `${percentual}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-3 md:mb-6">
        <div className="bg-white rounded-card border border-line p-3 md:p-5 min-w-0">
          <h2 className="font-display text-base md:text-lg mb-3">Vencimentos de hoje</h2>
          {vencimentosHoje.length === 0 ? (
            <p className="text-sm text-ink/50">Nada vencendo hoje.</p>
          ) : (
            <ul className="space-y-2">
              {vencimentosHoje.map((m) => (
                <li key={m.id} className="flex justify-between text-sm border-b border-line/60 pb-2 gap-2">
                  <span className="truncate">{(m as any).aluno.nome}</span>
                  <span className="text-ink/60 whitespace-nowrap">{formatarMoeda(Number(m.valor))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-card border border-line p-3 md:p-5 min-w-0">
          <h2 className="font-display text-base md:text-lg mb-3">Aniversariantes de hoje</h2>
          {aniversariantesHoje.length === 0 ? (
            <p className="text-sm text-ink/50">Ninguém faz aniversário hoje.</p>
          ) : (
            <ul className="space-y-2">
              {aniversariantesHoje.map((a) => (
                <li key={a.id} className="flex justify-between text-sm border-b border-line/60 pb-2 gap-2">
                  <span className="truncate">{a.nome}</span>
                  <span>🎂</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-card border border-line p-3 md:p-5 min-w-0">
          <h2 className="font-display text-base md:text-lg mb-3">Próximos vencimentos (7 dias)</h2>
          {proximosVencimentos.length === 0 ? (
            <p className="text-sm text-ink/50">Nada vencendo nos próximos 7 dias.</p>
          ) : (
            <ul className="space-y-2">
              {proximosVencimentos.map((m) => (
                <li key={m.id} className="flex justify-between text-sm border-b border-line/60 pb-2 gap-2">
                  <span className="truncate">{(m as any).aluno.nome}</span>
                  <span className="text-ink/60 whitespace-nowrap">{formatarData(m.vencimento)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-card border border-line p-3 md:p-5 min-w-0">
          <h2 className="font-display text-base md:text-lg mb-3">Aniversariantes do mês</h2>
          {aniversariantes.length === 0 ? (
            <p className="text-sm text-ink/50">Nenhum aniversariante este mês.</p>
          ) : (
            <ul className="space-y-2">
              {aniversariantes.map((a) => (
                <li key={a.id} className="flex justify-between text-sm border-b border-line/60 pb-2 gap-2">
                  <span className="truncate">{a.nome}</span>
                  <span className="text-ink/60 whitespace-nowrap">{formatarData(a.dataNascimento).slice(0, 5)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
