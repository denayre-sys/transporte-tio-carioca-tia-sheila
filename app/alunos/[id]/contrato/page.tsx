"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { montarContrato } from "@/lib/contrato";

function paraInput(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

function deInput(valor: string) {
  const [a, m, d] = valor.split("-").map(Number);
  return new Date(a, m - 1, d);
}

function Contrato() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const recemCadastrado = useSearchParams().get("novo") === "1";

  const [aluno, setAluno] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [erro, setErro] = useState("");
  const hoje = new Date();
  const [inicio, setInicio] = useState(paraInput(hoje));
  const [fim, setFim] = useState(`${hoje.getFullYear()}-12-31`);
  const [cpf, setCpf] = useState("");
  const [endereco, setEndereco] = useState("");
  const [salvandoResp, setSalvandoResp] = useState(false);
  const [msgResp, setMsgResp] = useState("");

  useEffect(() => {
    Promise.all([fetch(`/api/alunos/${id}`).then((r) => r.json()), fetch("/api/configuracoes").then((r) => r.json())])
      .then(([a, c]) => {
        if (a?.erro) setErro(a.erro);
        else {
          setAluno(a);
          setConfig(c);
          setCpf(a.responsavel?.cpf || "");
          setEndereco(a.responsavel?.endereco || [a.endereco, a.bairro].filter(Boolean).join(", "));
        }
      })
      .catch(() => setErro("Não foi possível carregar os dados do contrato."));
  }, [id]);

  if (erro) return <p className="text-clay">{erro}</p>;
  if (!aluno || !config) return <p className="text-ink/50">Carregando...</p>;

  const contrato = montarContrato({
    empresa: {
      nome: config.nomeEmpresa,
      documento: config.contratadaDocumento,
      endereco: config.contratadaEndereco,
      telefone: config.contratadaTelefone,
      cidadeForo: config.cidadeForo,
    },
    aluno: { ...aluno, valorMensalidade: Number(aluno.valorMensalidade) },
    responsavel: { ...aluno.responsavel, cpf, endereco },
    inicio: deInput(inicio),
    fim: deInput(fim),
    hoje,
  });

  async function salvarNoCadastro() {
    setSalvandoResp(true);
    setMsgResp("");
    const r = aluno.responsavel;
    const res = await fetch(`/api/responsaveis/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: r.nome,
        cpf,
        endereco,
        telefone: r.telefone,
        whatsapp: r.whatsapp,
        email: r.email,
      }),
    });
    setSalvandoResp(false);
    setMsgResp(res.ok ? "Salvo no cadastro do responsável." : "Não foi possível salvar.");
  }

  const faltaDadosEmpresa = !config.contratadaDocumento || !config.contratadaEndereco || !config.cidadeForo;
  const campoClasse = "border border-line rounded-lg px-3 py-2 text-sm outline-none focus-ring bg-white";

  return (
    <div>
      <div className="print:hidden max-w-3xl mb-5">
        {recemCadastrado && (
          <div className="bg-moss/10 text-moss2 rounded-lg px-4 py-3 text-sm mb-4">
            Aluno cadastrado! Abaixo está o contrato pronto para imprimir ou salvar em PDF e colher as assinaturas.
          </div>
        )}
        <h1 className="font-display text-2xl md:text-3xl text-ink mb-1">Contrato — {aluno.nome}</h1>
        <p className="text-ink/60 text-sm mb-4">
          Modelo padrão preenchido com os dados do cadastro. Recomenda-se uma revisão jurídica antes do uso.
        </p>

        {faltaDadosEmpresa && (
          <div className="bg-amber-100 text-amber-800 rounded-lg px-4 py-3 text-sm mb-4">
            Faltam dados do transportador (CPF/CNPJ, endereço e cidade do foro); aparecem em branco no contrato.{" "}
            <a href="/configuracoes" className="underline font-medium">
              Preencher em Configurações
            </a>
            .
          </div>
        )}

        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Início da vigência</label>
            <input type="date" className={campoClasse} value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fim da vigência</label>
            <input type="date" className={campoClasse} value={fim} onChange={(e) => setFim(e.target.value)} />
          </div>
        </div>

        <div className="bg-white border border-line rounded-card p-4 mb-4">
          <h2 className="font-display text-base mb-1">Dados do contratante ({aluno.responsavel?.nome})</h2>
          <p className="text-xs text-ink/50 mb-3">
            Preenchidos com o cadastro do responsável. Complete o que faltar; vale para este contrato e você pode salvar no cadastro.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1">CPF</label>
              <input className={`${campoClasse} w-full`} value={cpf} onChange={(e) => setCpf(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Endereço completo</label>
              <input
                className={`${campoClasse} w-full`}
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, bairro, cidade"
              />
            </div>
          </div>
          <button
            onClick={salvarNoCadastro}
            disabled={salvandoResp}
            className="px-3 py-1.5 text-sm border border-line rounded-lg bg-white hover:bg-mist disabled:opacity-60"
          >
            {salvandoResp ? "Salvando..." : "Salvar no cadastro do responsável"}
          </button>
          {msgResp && <span className="ml-3 text-sm text-moss2">{msgResp}</span>}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm bg-moss text-white rounded-lg hover:bg-moss2"
          >
            Imprimir / Salvar PDF
          </button>
          <button
            onClick={() => router.push("/alunos")}
            className="px-4 py-2 text-sm border border-line rounded-lg bg-white hover:bg-mist"
          >
            Voltar para alunos
          </button>
        </div>
      </div>

      <article className="bg-white border border-line rounded-card p-6 md:p-10 max-w-3xl text-[0.8rem] leading-relaxed text-justify print:border-0 print:p-0 print:max-w-none print:rounded-none">
        <h2 className="text-center font-bold text-base mb-5">{contrato.titulo}</h2>

        {contrato.partes.map((p, i) => (
          <p key={i} className="mb-3">
            {p}
          </p>
        ))}

        <p className="mb-3">As partes acima identificadas têm entre si justo e acordado o presente contrato, que se regerá pelas cláusulas seguintes:</p>

        {contrato.clausulas.map((c) => (
          <section key={c.titulo} className="mb-3 break-inside-avoid">
            <h3 className="font-bold mb-1">{c.titulo}</h3>
            {c.paragrafos.map((p, i) => (
              <p key={i} className="mb-1.5">
                {p}
              </p>
            ))}
          </section>
        ))}

        <p className="mt-5 mb-1">{contrato.fechamento}</p>
        <p className="mb-10">{contrato.local}</p>

        <div className="grid grid-cols-2 gap-x-10 gap-y-12 break-inside-avoid">
          <div className="text-center">
            <div className="border-t border-ink pt-1">CONTRATADA</div>
            <div className="text-xs">{config.nomeEmpresa}</div>
          </div>
          <div className="text-center">
            <div className="border-t border-ink pt-1">CONTRATANTE</div>
            <div className="text-xs">{aluno.responsavel?.nome}</div>
          </div>
          <div className="text-center">
            <div className="border-t border-ink pt-1">Testemunha 1</div>
            <div className="text-xs">Nome / CPF</div>
          </div>
          <div className="text-center">
            <div className="border-t border-ink pt-1">Testemunha 2</div>
            <div className="text-xs">Nome / CPF</div>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function ContratoPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Carregando...</p>}>
      <Contrato />
    </Suspense>
  );
}
