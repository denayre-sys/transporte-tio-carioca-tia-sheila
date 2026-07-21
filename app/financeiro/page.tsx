"use client";

import { useEffect, useState } from "react";
import { formatarMoeda, formatarData, mesReferenciaAtual } from "@/lib/format";
import { linkWhatsapp, mensagemCobranca } from "@/lib/whatsapp";

const statusEstilo: Record<string, string> = {
  PAGO: "bg-moss/10 text-moss2",
  ABERTO: "bg-amber-100 text-amber-700",
  ATRASADO: "bg-clay/10 text-clay",
  ISENTO: "bg-ink/10 text-ink/60",
};

function Cartao({ label, valor, cor }: { label: string; valor: string; cor: string }) {
  return (
    <div className="bg-white rounded-card border border-line p-4 md:p-5 min-w-0">
      <p className="text-xs md:text-sm text-ink/60 mb-1">{label}</p>
      <p className={`text-lg md:text-2xl font-display break-words ${cor}`}>{valor}</p>
    </div>
  );
}

function opcoesMeses() {
  const opcoes: { valor: string; rotulo: string }[] = [];
  const hoje = new Date();
  for (let i = -6; i <= 3; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const rotulo = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    opcoes.push({ valor, rotulo: rotulo.charAt(0).toUpperCase() + rotulo.slice(1) });
  }
  return opcoes;
}

export default function FinanceiroPage() {
  const [mensalidades, setMensalidades] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [mes, setMes] = useState(mesReferenciaAtual());
  const [statusFiltro, setStatusFiltro] = useState("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const meses = opcoesMeses();

  async function carregar() {
    setCarregando(true);
    const params = new URLSearchParams({ mes });
    if (statusFiltro !== "TODOS") params.set("status", statusFiltro);
    const res = await fetch(`/api/mensalidades?${params.toString()}`);
    setMensalidades(await res.json());
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, statusFiltro]);

  async function gerarCobrancas() {
    setGerando(true);
    const res = await fetch("/api/gerar-cobrancas", { method: "POST" });
    const d = await res.json();
    setGerando(false);
    alert(`${d.criadas} cobrança(s) gerada(s) para ${d.mes}.`);
    carregar();
  }

  async function salvarEdicao(form: any) {
    await fetch(`/api/mensalidades/${form.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditando(null);
    carregar();
  }

  const previsto = mensalidades.reduce((s, m) => s + Number(m.valor), 0);
  const recebido = mensalidades.filter((m) => m.status === "PAGO").reduce((s, m) => s + Number(m.valor), 0);
  const emAberto = mensalidades.filter((m) => m.status === "ABERTO").reduce((s, m) => s + Number(m.valor), 0);
  const vencido = mensalidades.filter((m) => m.status === "ATRASADO").reduce((s, m) => s + Number(m.valor), 0);

  const mensalidadesFiltradas = mensalidades.filter((m) => {
    if (!busca) return true;
    const alvo = `${m.aluno?.nome || ""} ${m.aluno?.responsavel?.nome || ""}`.toLowerCase();
    return alvo.includes(busca.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-ink">Financeiro</h1>
          <p className="text-ink/60 text-sm md:text-base">Controle de mensalidades e pagamentos</p>
        </div>
        <button
          onClick={gerarCobrancas}
          disabled={gerando}
          className="bg-moss text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-moss2 disabled:opacity-60"
        >
          {gerando ? "Gerando..." : "Gerar cobranças do mês"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <Cartao label="Previsto" valor={formatarMoeda(previsto)} cor="text-ink" />
        <Cartao label="Recebido" valor={formatarMoeda(recebido)} cor="text-moss2" />
        <Cartao label="Em aberto" valor={formatarMoeda(emAberto)} cor="text-amber-600" />
        <Cartao label="Vencido" valor={formatarMoeda(vencido)} cor="text-clay" />
      </div>

      <div className="mb-5 flex flex-col sm:flex-row gap-2">
        <select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 text-sm bg-white focus-ring outline-none"
        >
          {meses.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </select>
        <select
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 text-sm bg-white focus-ring outline-none"
        >
          <option value="TODOS">Todos</option>
          <option value="PAGO">Pago</option>
          <option value="ABERTO">Em aberto</option>
          <option value="ATRASADO">Atrasado</option>
          <option value="ISENTO">Isento</option>
        </select>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por aluno ou responsável..."
          className="flex-1 min-w-[180px] border border-line rounded-lg px-3 py-2 text-sm bg-white focus-ring outline-none"
        />
      </div>

      {/* Lista em cartões — celular */}
      <div className="md:hidden space-y-3">
        {carregando && <p className="text-ink/50 text-center py-6">Carregando...</p>}
        {!carregando && mensalidadesFiltradas.length === 0 && (
          <p className="text-ink/50 text-center py-6">
            Nenhuma cobrança encontrada. Toque em &quot;Gerar cobranças do mês&quot; acima se ainda não gerou.
          </p>
        )}
        {mensalidadesFiltradas.map((m) => (
          <div key={m.id} className="bg-white rounded-card border border-line p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-lg text-ink">{m.aluno.nome}</p>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-sm ${statusEstilo[m.status]}`}>
                {m.status}
              </span>
            </div>
            <p className="text-base text-ink/70 mb-1">Vence em {formatarData(m.vencimento)}</p>
            <p className="text-base text-ink font-medium mb-1">{formatarMoeda(m.valor)}</p>
            {m.dataPagamento && (
              <p className="text-base text-ink/60 mb-2">
                Pago em {formatarData(m.dataPagamento)} {m.formaPagamento ? `— ${m.formaPagamento}` : ""}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              {m.status !== "PAGO" && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={linkWhatsapp(
                    m.aluno.responsavel.whatsapp,
                    mensagemCobranca({
                      nomeResponsavel: m.aluno.responsavel.nome,
                      nomeAluno: m.aluno.nome,
                      valor: formatarMoeda(m.valor),
                      vencimento: formatarData(m.vencimento),
                      atrasado: m.status === "ATRASADO",
                    })
                  )}
                  className="flex-1 text-center bg-moss/10 text-moss2 rounded-lg py-3 text-base font-medium active:bg-moss/20"
                >
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => setEditando(m)}
                className="flex-1 border border-line rounded-lg py-3 text-base font-medium active:bg-mist"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela — telas maiores */}
      <div className="hidden md:block bg-white rounded-card border border-line overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-mist text-ink/70 text-left">
            <tr>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={6}>
                  Carregando...
                </td>
              </tr>
            )}
            {!carregando && mensalidadesFiltradas.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={6}>
                  Nenhuma cobrança encontrada. Clique em &quot;Gerar cobranças do mês&quot; se ainda não gerou.
                </td>
              </tr>
            )}
            {mensalidadesFiltradas.map((m) => (
              <tr key={m.id} className="border-t border-line/60">
                <td className="px-4 py-3 font-medium">{m.aluno.nome}</td>
                <td className="px-4 py-3 text-ink/70">{formatarData(m.vencimento)}</td>
                <td className="px-4 py-3 text-ink/70">{formatarMoeda(m.valor)}</td>
                <td className="px-4 py-3 text-ink/70">
                  {m.dataPagamento ? (
                    <>
                      {formatarData(m.dataPagamento)}
                      <br />
                      <span className="text-xs text-ink/50">{m.formaPagamento || "—"}</span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${statusEstilo[m.status]}`}>{m.status}</span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {m.status !== "PAGO" && (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={linkWhatsapp(
                        m.aluno.responsavel.whatsapp,
                        mensagemCobranca({
                          nomeResponsavel: m.aluno.responsavel.nome,
                          nomeAluno: m.aluno.nome,
                          valor: formatarMoeda(m.valor),
                          vencimento: formatarData(m.vencimento),
                          atrasado: m.status === "ATRASADO",
                        })
                      )}
                      className="text-moss hover:underline mr-3"
                    >
                      WhatsApp
                    </a>
                  )}
                  <button onClick={() => setEditando(m)} className="text-ink/70 hover:underline">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <ModalPagamento mensalidade={editando} onSalvar={salvarEdicao} onFechar={() => setEditando(null)} />
      )}
    </div>
  );
}

function ModalPagamento({ mensalidade, onSalvar, onFechar }: { mensalidade: any; onSalvar: (f: any) => void; onFechar: () => void }) {
  const [form, setForm] = useState({
    id: mensalidade.id,
    status: mensalidade.status,
    valor: String(mensalidade.valor),
    desconto: String(mensalidade.desconto ?? 0),
    acrescimo: String(mensalidade.acrescimo ?? 0),
    multa: String(mensalidade.multa ?? 0),
    juros: String(mensalidade.juros ?? 0),
    formaPagamento: mensalidade.formaPagamento || "",
    dataPagamento: mensalidade.dataPagamento ? mensalidade.dataPagamento.slice(0, 10) : new Date().toISOString().slice(0, 10),
  });

  function campo(nome: string, valor: string) {
    setForm((f) => ({ ...f, [nome]: valor }));
  }

  const campoClasse = "w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus-ring bg-white";
  const rotulo = "block text-sm font-medium text-ink mb-1";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start sm:items-center justify-center p-4 py-8">
        <div className="bg-white rounded-card max-w-lg w-full p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl">Editar Pagamento</h3>
            <button type="button" onClick={onFechar} className="text-ink/50 hover:text-ink">
              ✕
            </button>
          </div>

          <div className="mb-4">
            <label className={rotulo}>Aluno</label>
            <div className="px-3 py-2 border border-line rounded-lg bg-mist text-sm">{mensalidade.aluno.nome}</div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={rotulo}>Mês/Ano</label>
              <div className="px-3 py-2 border border-line rounded-lg bg-mist text-sm">{mensalidade.mesReferencia}</div>
            </div>
            <div>
              <label className={rotulo}>Status</label>
              <select className={campoClasse} value={form.status} onChange={(e) => campo("status", e.target.value)}>
                <option value="ABERTO">Em aberto</option>
                <option value="PAGO">Pago</option>
                <option value="ATRASADO">Atrasado</option>
                <option value="ISENTO">Isento</option>
              </select>
            </div>
            <div>
              <label className={rotulo}>Valor (R$)</label>
              <input type="number" step="0.01" className={campoClasse} value={form.valor} onChange={(e) => campo("valor", e.target.value)} />
            </div>
            <div>
              <label className={rotulo}>Desconto (R$)</label>
              <input type="number" step="0.01" className={campoClasse} value={form.desconto} onChange={(e) => campo("desconto", e.target.value)} />
            </div>
            <div>
              <label className={rotulo}>Acréscimo (R$)</label>
              <input type="number" step="0.01" className={campoClasse} value={form.acrescimo} onChange={(e) => campo("acrescimo", e.target.value)} />
            </div>
            <div>
              <label className={rotulo}>Multa (R$)</label>
              <input type="number" step="0.01" className={campoClasse} value={form.multa} onChange={(e) => campo("multa", e.target.value)} />
            </div>
            <div>
              <label className={rotulo}>Juros (R$)</label>
              <input type="number" step="0.01" className={campoClasse} value={form.juros} onChange={(e) => campo("juros", e.target.value)} />
            </div>
            <div>
              <label className={rotulo}>Forma de Pagamento</label>
              <select className={campoClasse} value={form.formaPagamento} onChange={(e) => campo("formaPagamento", e.target.value)}>
                <option value="">Selecione...</option>
                <option value="Pix">Pix</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Boleto">Boleto</option>
                <option value="Cartão">Cartão</option>
                <option value="Transferência">Transferência</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={rotulo}>Data do Pagamento</label>
              <input type="date" className={campoClasse} value={form.dataPagamento} onChange={(e) => campo("dataPagamento", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <button type="button" onClick={onFechar} className="px-4 py-2 text-sm border border-line rounded-lg bg-white hover:bg-mist">
              Cancelar
            </button>
            <button type="button" onClick={() => onSalvar(form)} className="px-4 py-2 text-sm bg-moss text-white rounded-lg hover:bg-moss2">
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
