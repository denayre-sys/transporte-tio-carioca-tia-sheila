import { APP_NAME } from "@/lib/config";
"use client";

import { useEffect, useState } from "react";

const CORES: Record<string, string> = {
  PENDENTE: "bg-white border-line",
  VAI: "bg-moss/10 border-moss text-moss2",
  NAO_VAI: "bg-clay/10 border-clay text-clay",
};

const PROXIMO_STATUS: Record<string, string> = {
  PENDENTE: "VAI",
  VAI: "NAO_VAI",
  NAO_VAI: "PENDENTE",
};

const RESUMO: Record<string, string> = {
  PENDENTE: "—",
  VAI: "VAI",
  NAO_VAI: "NÃO VAI",
};

export default function RotaPage() {
  const [itens, setItens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [adicionandoEm, setAdicionandoEm] = useState<string | null>(null);
  const [novoTexto, setNovoTexto] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState("");

  async function carregar() {
    setCarregando(true);
    const res = await fetch("/api/rota");
    setItens(await res.json());
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function alternarStatus(item: any) {
    const novoStatus = PROXIMO_STATUS[item.status];
    setItens((lista) => lista.map((i) => (i.id === item.id ? { ...i, status: novoStatus } : i)));
    await fetch(`/api/rota/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
  }

  async function reiniciar() {
    if (!confirm("Reiniciar todos os itens para o próximo dia (voltar tudo para pendente)?")) return;
    await fetch("/api/rota/reiniciar", { method: "POST" });
    carregar();
  }

  async function mover(secaoItens: any[], index: number, direcao: -1 | 1) {
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= secaoItens.length) return;
    const a = secaoItens[index];
    const b = secaoItens[alvo];
    setItens((lista) =>
      lista.map((i) => {
        if (i.id === a.id) return { ...i, ordem: b.ordem };
        if (i.id === b.id) return { ...i, ordem: a.ordem };
        return i;
      })
    );
    await Promise.all([
      fetch(`/api/rota/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordem: b.ordem }),
      }),
      fetch(`/api/rota/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ordem: a.ordem }),
      }),
    ]);
    carregar();
  }

  async function adicionarItem(secao: string) {
    if (!novoTexto.trim()) return;
    await fetch("/api/rota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secao, texto: novoTexto.trim() }),
    });
    setNovoTexto("");
    setAdicionandoEm(null);
    carregar();
  }

  async function removerItem(id: string) {
    if (!confirm("Remover este item da rota?")) return;
    await fetch(`/api/rota/${id}`, { method: "DELETE" });
    carregar();
  }

  async function salvarEdicao(id: string) {
    if (!textoEdicao.trim()) return;
    await fetch(`/api/rota/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: textoEdicao.trim() }),
    });
    setEditandoId(null);
    carregar();
  }

  function compartilharWhatsapp() {
    const secoes = agrupar();
    let texto = `*Rota do Dia — ${APP_NAME}*\n\n`;
    for (const [titulo, lista] of Object.entries(secoes)) {
      texto += `*${titulo}*\n`;
      (lista as any[]).forEach((item) => {
        const marca = item.status === "VAI" ? "✅" : item.status === "NAO_VAI" ? "❌" : "▫️";
        texto += `${marca} ${item.texto}\n`;
      });
      texto += "\n";
    }
    const link = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(link, "_blank");
  }

  function agrupar() {
    return itens.reduce((acc: Record<string, any[]>, item) => {
      acc[item.secao] = acc[item.secao] || [];
      acc[item.secao].push(item);
      return acc;
    }, {});
  }

  const secoes = agrupar();

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h1 className="font-display text-2xl md:text-3xl text-ink">Rota do Dia</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={compartilharWhatsapp}
            className="text-sm bg-moss text-white rounded-lg px-3 py-2 hover:bg-moss2"
          >
            Compartilhar por WhatsApp
          </button>
          <button onClick={reiniciar} className="text-sm border border-line rounded-lg px-3 py-2 bg-white hover:bg-mist">
            Reiniciar
          </button>
        </div>
      </div>
      <p className="text-ink/60 mb-6 text-sm md:text-base">
        Toque em cada item para marcar: pendente → <strong>VAI</strong> → <strong>NÃO VAI</strong> → pendente.
      </p>

      {carregando && <p className="text-ink/50">Carregando...</p>}

      {Object.entries(secoes).map(([titulo, lista]) => (
        <div key={titulo} className="bg-white rounded-card border border-line p-4 md:p-5 mb-5">
          <h2 className="font-display text-base md:text-lg mb-3">{titulo}</h2>
          <ul className="space-y-1.5">
            {lista.map((item, index) => (
              <li key={item.id} className="flex items-center gap-1.5">
                <div className="flex flex-col shrink-0">
                  <button
                    onClick={() => mover(lista, index, -1)}
                    disabled={index === 0}
                    className="text-ink/40 hover:text-ink disabled:opacity-20 text-xs leading-none px-1"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => mover(lista, index, 1)}
                    disabled={index === lista.length - 1}
                    className="text-ink/40 hover:text-ink disabled:opacity-20 text-xs leading-none px-1"
                  >
                    ▼
                  </button>
                </div>

                {editandoId === item.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      autoFocus
                      value={textoEdicao}
                      onChange={(e) => setTextoEdicao(e.target.value)}
                      className="flex-1 border border-line rounded-lg px-2 py-1.5 text-sm outline-none focus-ring"
                    />
                    <button onClick={() => salvarEdicao(item.id)} className="text-xs text-moss2 font-medium">
                      Salvar
                    </button>
                    <button onClick={() => setEditandoId(null)} className="text-xs text-ink/40">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => alternarStatus(item)}
                      className={`flex-1 flex items-center justify-between text-left px-3 py-2 rounded-lg border text-sm transition-colors ${CORES[item.status]}`}
                    >
                      <span>{item.texto}</span>
                      <span className="text-xs font-medium whitespace-nowrap ml-3">{RESUMO[item.status]}</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditandoId(item.id);
                        setTextoEdicao(item.texto);
                      }}
                      className="text-ink/30 hover:text-ink text-xs px-1 shrink-0"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => removerItem(item.id)}
                      className="text-ink/30 hover:text-clay text-xs px-1 shrink-0"
                      title="Remover"
                    >
                      ✕
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>

          {adicionandoEm === titulo ? (
            <div className="flex gap-2 mt-3">
              <input
                autoFocus
                value={novoTexto}
                onChange={(e) => setNovoTexto(e.target.value)}
                placeholder="Nome do aluno ou item da rota..."
                className="flex-1 border border-line rounded-lg px-3 py-2 text-sm outline-none focus-ring"
                onKeyDown={(e) => e.key === "Enter" && adicionarItem(titulo)}
              />
              <button onClick={() => adicionarItem(titulo)} className="text-sm bg-moss text-white rounded-lg px-3 py-2 hover:bg-moss2">
                Adicionar
              </button>
              <button
                onClick={() => {
                  setAdicionandoEm(null);
                  setNovoTexto("");
                }}
                className="text-sm border border-line rounded-lg px-3 py-2 bg-white hover:bg-mist"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdicionandoEm(titulo)}
              className="text-xs text-moss2 hover:underline mt-3"
            >
              + Adicionar aluno/item nesta seção
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
