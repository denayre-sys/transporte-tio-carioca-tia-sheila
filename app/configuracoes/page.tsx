"use client";

import { useEffect, useState } from "react";

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/configuracoes");
    setConfig(await res.json());
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMensagem("");
    const res = await fetch("/api/configuracoes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setConfig(await res.json());
    setSalvando(false);
    setMensagem("Configurações salvas.");
  }

  async function testar() {
    setTestando(true);
    setMensagem("");
    const res = await fetch("/api/configuracoes/testar", { method: "POST" });
    const corpo = await res.json();
    setTestando(false);
    if (res.ok) {
      setMensagem(
        `E-mail de teste enviado! (${corpo.vencimentos} vencimento(s) hoje, ${corpo.aniversariantes} aniversariante(s) hoje)`
      );
    } else {
      setMensagem(corpo.erro || "Falha ao enviar e-mail de teste.");
    }
  }

  if (carregando || !config) {
    return <p className="text-ink/50">Carregando...</p>;
  }

  const campoClasse = "w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus-ring bg-white";
  const rotulo = "block text-sm font-medium text-ink mb-1";

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-1">Configurações</h1>
      <p className="text-ink/60 mb-6 text-sm md:text-base">Ajustes gerais do sistema</p>

      <form onSubmit={salvar} className="bg-white rounded-card border border-line p-5 mb-5">
        <h2 className="font-display text-lg mb-4">Informações gerais</h2>
        <div className="mb-4">
          <label className={rotulo}>Nome da empresa</label>
          <input
            className={campoClasse}
            value={config.nomeEmpresa}
            onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
          />
        </div>

        <h2 className="font-display text-lg mb-1 mt-6">Alertas e notificações</h2>
        <p className="text-xs text-ink/50 mb-4">
          Todo dia às 03:00 da manhã, mesmo com o site fechado, o sistema envia um e-mail com os vencimentos e
          aniversariantes de hoje para o endereço abaixo.
        </p>

        <div className="mb-4">
          <label className={rotulo}>E-mail para receber alertas diários</label>
          <input
            type="email"
            className={campoClasse}
            placeholder="seuemail@exemplo.com"
            value={config.emailAlertas || ""}
            onChange={(e) => setConfig({ ...config, emailAlertas: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2 mb-5 text-sm">
          <input
            type="checkbox"
            checked={config.alertasAtivos}
            onChange={(e) => setConfig({ ...config, alertasAtivos: e.target.checked })}
          />
          Alertas diários ativos
        </label>

        {config.ultimaExecucao && (
          <p className="text-xs text-ink/50 mb-4">
            Última execução: {new Date(config.ultimaExecucao).toLocaleString("pt-BR")}
          </p>
        )}

        {mensagem && <p className="text-sm text-moss2 mb-4">{mensagem}</p>}

        <div className="flex gap-2 flex-wrap">
          <button
            disabled={salvando}
            className="px-4 py-2 text-sm bg-moss text-white rounded-lg hover:bg-moss2 disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>
          <button
            type="button"
            onClick={testar}
            disabled={testando}
            className="px-4 py-2 text-sm border border-line rounded-lg bg-white hover:bg-mist disabled:opacity-60"
          >
            {testando ? "Enviando..." : "Testar envio agora"}
          </button>
        </div>
      </form>
    </div>
  );
}
