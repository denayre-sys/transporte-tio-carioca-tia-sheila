"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const vazio = { nome: "", cpf: "", endereco: "", telefone: "", whatsapp: "", email: "" };

export default function ResponsavelForm({ id, inicial }: { id?: string; inicial?: any }) {
  const [dados, setDados] = useState<any>(vazio);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (inicial) setDados(inicial);
  }, [inicial]);

  function campo(nome: string, valor: string) {
    setDados((d: any) => ({ ...d, [nome]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);
    const res = await fetch(id ? `/api/responsaveis/${id}` : "/api/responsaveis", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    setSalvando(false);
    if (res.ok) {
      router.push("/responsaveis");
      router.refresh();
    } else {
      setErro("Não foi possível salvar. Confira os campos obrigatórios.");
    }
  }

  async function remover() {
    if (!id) return;
    if (!confirm("Remover este responsável? Isso só é possível se ele não tiver alunos vinculados.")) return;
    const res = await fetch(`/api/responsaveis/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/responsaveis");
      router.refresh();
    } else {
      setErro("Não é possível remover: existem alunos vinculados a este responsável.");
    }
  }

  const campoClasse =
    "w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring outline-none bg-white";
  const rotuloClasse = "block text-sm font-medium text-ink mb-1";

  return (
    <form onSubmit={salvar} className="bg-white rounded-card border border-line p-6 max-w-2xl">
      {erro && <p className="text-clay text-sm mb-4">{erro}</p>}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className={rotuloClasse}>Nome completo *</label>
          <input required className={campoClasse} value={dados.nome} onChange={(e) => campo("nome", e.target.value)} />
        </div>
        <div>
          <label className={rotuloClasse}>WhatsApp (com DDD) *</label>
          <input required placeholder="(85) 99999-9999" className={campoClasse} value={dados.whatsapp} onChange={(e) => campo("whatsapp", e.target.value)} />
        </div>
        <div>
          <label className={rotuloClasse}>Telefone (opcional)</label>
          <input className={campoClasse} value={dados.telefone || ""} onChange={(e) => campo("telefone", e.target.value)} />
        </div>
        <div>
          <label className={rotuloClasse}>CPF</label>
          <input className={campoClasse} value={dados.cpf || ""} onChange={(e) => campo("cpf", e.target.value)} />
        </div>
        <div>
          <label className={rotuloClasse}>E-mail</label>
          <input type="email" className={campoClasse} value={dados.email || ""} onChange={(e) => campo("email", e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label className={rotuloClasse}>Endereço</label>
          <input className={campoClasse} value={dados.endereco || ""} onChange={(e) => campo("endereco", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-line">
        <div>
          {id && (
            <button type="button" onClick={remover} className="text-clay text-sm hover:underline">
              Remover responsável
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/responsaveis")} className="px-4 py-2 text-sm border border-line rounded-lg bg-white hover:bg-mist">
            Cancelar
          </button>
          <button disabled={salvando} className="px-4 py-2 text-sm bg-moss text-white rounded-lg hover:bg-moss2 disabled:opacity-60">
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </form>
  );
}
