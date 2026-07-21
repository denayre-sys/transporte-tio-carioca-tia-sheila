"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const vazio = {
  nome: "",
  dataNascimento: "",
  escola: "",
  serie: "",
  turno: "",
  itinerarioInicial: "",
  itinerarioFinal: "",
  tipoTransporte: "",
  endereco: "",
  bairro: "",
  cep: "",
  telefoneAluno: "",
  emailAluno: "",
  valorSemDesconto: "",
  valorMensalidade: "",
  diaVencimento: "10",
  status: "ATIVO",
  observacoes: "",
  responsavelId: "",
};

export default function AlunoForm({ alunoId, inicial }: { alunoId?: string; inicial?: any }) {
  const [dados, setDados] = useState<any>(vazio);
  const [responsaveis, setResponsaveis] = useState<any[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/responsaveis")
      .then((r) => r.json())
      .then(setResponsaveis);

    if (inicial) {
      setDados({
        ...inicial,
        dataNascimento: inicial.dataNascimento ? inicial.dataNascimento.slice(0, 10) : "",
        escola: inicial.escola || "",
        itinerarioInicial: inicial.itinerarioInicial || "",
        itinerarioFinal: inicial.itinerarioFinal || "",
        tipoTransporte: inicial.tipoTransporte || "",
        valorSemDesconto: inicial.valorSemDesconto ? String(inicial.valorSemDesconto) : "",
        valorMensalidade: String(inicial.valorMensalidade),
        diaVencimento: String(inicial.diaVencimento),
      });
    }
  }, [inicial]);

  function campo(nome: string, valor: string) {
    setDados((d: any) => ({ ...d, [nome]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!dados.responsavelId) {
      setErro("Selecione um responsável (cadastre um primeiro, se ainda não houver nenhum).");
      return;
    }
    setSalvando(true);
    const res = await fetch(alunoId ? `/api/alunos/${alunoId}` : "/api/alunos", {
      method: alunoId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    setSalvando(false);
    if (res.ok) {
      router.push("/alunos");
      router.refresh();
    } else {
      const corpo = await res.json().catch(() => null);
      setErro(corpo?.erro || corpo?.message || "Não foi possível salvar. Confira os campos obrigatórios.");
    }
  }

  async function remover() {
    if (!alunoId) return;
    if (!confirm("Remover este aluno definitivamente? Prefira marcar como Inativo se preferir manter o histórico.")) return;
    await fetch(`/api/alunos/${alunoId}`, { method: "DELETE" });
    router.push("/alunos");
    router.refresh();
  }

  const campoClasse =
    "w-full border border-line rounded-lg px-3 py-2 text-sm focus-ring outline-none bg-white";
  const rotuloClasse = "block text-sm font-medium text-ink mb-1";

  return (
    <form onSubmit={salvar} className="bg-white rounded-card border border-line p-6 max-w-3xl">
      {erro && <p className="text-clay text-sm mb-4">{erro}</p>}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className={rotuloClasse}>Nome completo *</label>
          <input required className={campoClasse} value={dados.nome} onChange={(e) => campo("nome", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>Data de nascimento</label>
          <input type="date" className={campoClasse} value={dados.dataNascimento} onChange={(e) => campo("dataNascimento", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>Responsável *</label>
          <select required className={campoClasse} value={dados.responsavelId} onChange={(e) => campo("responsavelId", e.target.value)}>
            <option value="">Selecione...</option>
            {responsaveis.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={rotuloClasse}>Escola</label>
          <input className={campoClasse} value={dados.escola} onChange={(e) => campo("escola", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>Série</label>
          <input className={campoClasse} value={dados.serie} onChange={(e) => campo("serie", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>Turno</label>
          <select className={campoClasse} value={dados.turno} onChange={(e) => campo("turno", e.target.value)}>
            <option value="">Selecione...</option>
            <option value="Manhã">Manhã</option>
            <option value="Tarde">Tarde</option>
            <option value="Integral">Integral</option>
          </select>
        </div>

        <div>
          <label className={rotuloClasse}>Status</label>
          <select className={campoClasse} value={dados.status} onChange={(e) => campo("status", e.target.value)}>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>

        <div>
          <label className={rotuloClasse}>Tipo de transporte</label>
          <select className={campoClasse} value={dados.tipoTransporte} onChange={(e) => campo("tipoTransporte", e.target.value)}>
            <option value="">Selecione...</option>
            <option value="IDA_E_VOLTA">Ida e volta</option>
            <option value="SO_IDA">Só ida</option>
            <option value="SO_VOLTA">Só volta</option>
          </select>
        </div>

        <div>
          <label className={rotuloClasse}>Itinerário inicial</label>
          <input className={campoClasse} value={dados.itinerarioInicial} onChange={(e) => campo("itinerarioInicial", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>Itinerário final</label>
          <input className={campoClasse} value={dados.itinerarioFinal} onChange={(e) => campo("itinerarioFinal", e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className={rotuloClasse}>Endereço</label>
          <input className={campoClasse} value={dados.endereco} onChange={(e) => campo("endereco", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>Bairro</label>
          <input className={campoClasse} value={dados.bairro} onChange={(e) => campo("bairro", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>CEP</label>
          <input className={campoClasse} value={dados.cep} onChange={(e) => campo("cep", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>Valor sem desconto (R$)</label>
          <input type="number" step="0.01" className={campoClasse} value={dados.valorSemDesconto} onChange={(e) => campo("valorSemDesconto", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>Valor da mensalidade (R$) *</label>
          <input required type="number" step="0.01" className={campoClasse} value={dados.valorMensalidade} onChange={(e) => campo("valorMensalidade", e.target.value)} />
        </div>

        <div>
          <label className={rotuloClasse}>Dia do vencimento *</label>
          <input required type="number" min={1} max={28} className={campoClasse} value={dados.diaVencimento} onChange={(e) => campo("diaVencimento", e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className={rotuloClasse}>Observações</label>
          <textarea className={campoClasse} rows={3} value={dados.observacoes} onChange={(e) => campo("observacoes", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-line">
        <div>
          {alunoId && (
            <button type="button" onClick={remover} className="text-clay text-sm hover:underline">
              Remover aluno
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => router.push("/alunos")} className="px-4 py-2 text-sm border border-line rounded-lg bg-white hover:bg-mist">
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
