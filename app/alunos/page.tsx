"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatarMoeda } from "@/lib/format";

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("ATIVO");
  const [carregando, setCarregando] = useState(true);

  async function carregar(statusAtual: string, buscaAtual: string) {
    setCarregando(true);
    const params = new URLSearchParams();
    if (buscaAtual) params.set("q", buscaAtual);
    if (statusAtual !== "TODOS") params.set("status", statusAtual);
    const res = await fetch(`/api/alunos?${params.toString()}`);
    setAlunos(await res.json());
    setCarregando(false);
  }

  useEffect(() => {
    carregar(status, busca);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    carregar(status, busca);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl md:text-3xl text-ink">Alunos</h1>
          <p className="text-ink/60 text-sm md:text-base">{alunos.length} aluno(s) encontrados</p>
        </div>
        <Link
          href="/alunos/novo"
          className="bg-moss text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-moss2 transition-colors focus-ring"
        >
          + Novo aluno
        </Link>
      </div>

      <div className="mb-5 flex flex-col sm:flex-row gap-2">
        <form onSubmit={buscar} className="flex gap-2 flex-1">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, escola ou bairro..."
            className="w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring outline-none bg-white"
          />
          <button className="border border-line rounded-lg px-4 py-2 text-sm bg-white hover:bg-mist whitespace-nowrap">
            Buscar
          </button>
        </form>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-line rounded-lg px-3 py-2 text-sm bg-white focus-ring outline-none"
        >
          <option value="ATIVO">Ativos</option>
          <option value="INATIVO">Inativos</option>
          <option value="TODOS">Todos</option>
        </select>
      </div>

      {/* Lista em cartões — celular */}
      <div className="md:hidden space-y-3">
        {carregando && <p className="text-ink/50 text-center py-6">Carregando...</p>}
        {!carregando && alunos.length === 0 && (
          <p className="text-ink/50 text-center py-6">Nenhum aluno encontrado.</p>
        )}
        {alunos.map((a) => (
          <Link
            key={a.id}
            href={`/alunos/${a.id}`}
            className="block bg-white rounded-card border border-line p-4 active:bg-mist"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="font-semibold text-lg text-ink">{a.nome}</p>
              <span
                className={`shrink-0 px-2.5 py-1 rounded-full text-sm ${
                  a.status === "ATIVO" ? "bg-moss/10 text-moss2" : "bg-ink/10 text-ink/50"
                }`}
              >
                {a.status === "ATIVO" ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="text-base text-ink/70 mb-1">{a.escola || "Sem escola cadastrada"}</p>
            <p className="text-base text-ink/70 mb-1">Responsável: {a.responsavel?.nome}</p>
            <p className="text-base text-ink font-medium">{formatarMoeda(a.valorMensalidade)} / mês</p>
          </Link>
        ))}
      </div>

      {/* Tabela — telas maiores */}
      <div className="hidden md:block bg-white rounded-card border border-line overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-mist text-ink/70 text-left">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Escola</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Mensalidade</th>
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
            {!carregando && alunos.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={6}>
                  Nenhum aluno encontrado.
                </td>
              </tr>
            )}
            {alunos.map((a) => (
              <tr key={a.id} className="border-t border-line/60">
                <td className="px-4 py-3 font-medium">{a.nome}</td>
                <td className="px-4 py-3 text-ink/70">{a.escola}</td>
                <td className="px-4 py-3 text-ink/70">{a.responsavel?.nome}</td>
                <td className="px-4 py-3 text-ink/70">{formatarMoeda(a.valorMensalidade)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      a.status === "ATIVO" ? "bg-moss/10 text-moss2" : "bg-ink/10 text-ink/50"
                    }`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/alunos/${a.id}`} className="text-moss hover:underline">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
