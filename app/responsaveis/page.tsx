"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ResponsaveisPage() {
  const [lista, setLista] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const res = await fetch(`/api/responsaveis?q=${encodeURIComponent(busca)}`);
    setLista(await res.json());
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    carregar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink">Responsáveis</h1>
          <p className="text-ink/60">{lista.length} cadastrado(s)</p>
        </div>
        <Link
          href="/responsaveis/novo"
          className="bg-moss text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-moss2 transition-colors focus-ring"
        >
          + Novo responsável
        </Link>
      </div>

      <form onSubmit={buscar} className="mb-5 flex gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome..."
          className="w-full max-w-md border border-line rounded-lg px-3 py-2 text-sm focus-ring outline-none bg-white"
        />
        <button className="border border-line rounded-lg px-4 py-2 text-sm bg-white hover:bg-mist">
          Buscar
        </button>
      </form>

      {/* Lista em cartões — celular */}
      <div className="md:hidden space-y-3">
        {carregando && <p className="text-ink/50 text-center py-6">Carregando...</p>}
        {!carregando && lista.length === 0 && (
          <p className="text-ink/50 text-center py-6">Nenhum responsável encontrado.</p>
        )}
        {lista.map((r) => (
          <Link
            key={r.id}
            href={`/responsaveis/${r.id}`}
            className="block bg-white rounded-card border border-line p-4 active:bg-mist"
          >
            <p className="font-semibold text-lg text-ink mb-1">{r.nome}</p>
            <p className="text-base text-ink/70 mb-1">📱 {r.whatsapp}</p>
            <p className="text-base text-ink/70 mb-1">{r.email || "Sem e-mail cadastrado"}</p>
            <p className="text-base text-ink/70">
              {r._count?.alunos ?? 0} aluno{(r._count?.alunos ?? 0) === 1 ? "" : "s"} vinculado(s)
            </p>
          </Link>
        ))}
      </div>

      {/* Tabela — telas maiores */}
      <div className="hidden md:block bg-white rounded-card border border-line overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-mist text-ink/70 text-left">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Alunos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={5}>
                  Carregando...
                </td>
              </tr>
            )}
            {!carregando && lista.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-ink/50" colSpan={5}>
                  Nenhum responsável encontrado.
                </td>
              </tr>
            )}
            {lista.map((r) => (
              <tr key={r.id} className="border-t border-line/60">
                <td className="px-4 py-3 font-medium">{r.nome}</td>
                <td className="px-4 py-3 text-ink/70">{r.whatsapp}</td>
                <td className="px-4 py-3 text-ink/70">{r.email || "—"}</td>
                <td className="px-4 py-3 text-ink/70">{r._count?.alunos ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/responsaveis/${r.id}`} className="text-moss hover:underline">
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
