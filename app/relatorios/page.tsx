"use client";

import { useState } from "react";
import { formatarMoeda, formatarData } from "@/lib/format";

type Coluna = { chave: string; rotulo: string; tipo?: "moeda" | "data" };

const RELATORIOS: { tipo: string; titulo: string; descricao: string; colunas: Coluna[] }[] = [
  {
    tipo: "recebidas",
    titulo: "Mensalidades recebidas",
    descricao: "Todos os pagamentos já confirmados",
    colunas: [
      { chave: "aluno", rotulo: "Aluno" },
      { chave: "mes", rotulo: "Mês" },
      { chave: "valor", rotulo: "Valor", tipo: "moeda" },
      { chave: "dataPagamento", rotulo: "Data pagamento", tipo: "data" },
      { chave: "formaPagamento", rotulo: "Forma" },
    ],
  },
  {
    tipo: "atraso",
    titulo: "Mensalidades em atraso",
    descricao: "Cobranças vencidas e ainda não pagas",
    colunas: [
      { chave: "aluno", rotulo: "Aluno" },
      { chave: "responsavel", rotulo: "Responsável" },
      { chave: "whatsapp", rotulo: "WhatsApp" },
      { chave: "vencimento", rotulo: "Vencimento", tipo: "data" },
      { chave: "valor", rotulo: "Valor", tipo: "moeda" },
    ],
  },
  {
    tipo: "inadimplentes",
    titulo: "Inadimplentes",
    descricao: "Alunos com uma ou mais mensalidades atrasadas",
    colunas: [
      { chave: "aluno", rotulo: "Aluno" },
      { chave: "responsavel", rotulo: "Responsável" },
      { chave: "whatsapp", rotulo: "WhatsApp" },
      { chave: "quantidade", rotulo: "Qtd. atrasadas" },
      { chave: "totalDevido", rotulo: "Total devido", tipo: "moeda" },
    ],
  },
  {
    tipo: "receita-mes",
    titulo: "Receita por mês",
    descricao: "Total recebido, mês a mês",
    colunas: [
      { chave: "mes", rotulo: "Mês" },
      { chave: "total", rotulo: "Total recebido", tipo: "moeda" },
    ],
  },
  {
    tipo: "receita-escola",
    titulo: "Receita por escola",
    descricao: "Total recebido agrupado por escola",
    colunas: [
      { chave: "escola", rotulo: "Escola" },
      { chave: "total", rotulo: "Total recebido", tipo: "moeda" },
    ],
  },
  {
    tipo: "receita-bairro",
    titulo: "Receita por bairro",
    descricao: "Total recebido agrupado por bairro",
    colunas: [
      { chave: "bairro", rotulo: "Bairro" },
      { chave: "total", rotulo: "Total recebido", tipo: "moeda" },
    ],
  },
  {
    tipo: "aniversariantes",
    titulo: "Lista de aniversariantes",
    descricao: "Todos os alunos ordenados por data de aniversário",
    colunas: [
      { chave: "aluno", rotulo: "Aluno" },
      { chave: "escola", rotulo: "Escola" },
      { chave: "dataNascimento", rotulo: "Nascimento", tipo: "data" },
    ],
  },
  {
    tipo: "alunos-completo",
    titulo: "Lista completa de alunos",
    descricao: "Cadastro completo, com dados de contato e mensalidade",
    colunas: [
      { chave: "aluno", rotulo: "Aluno" },
      { chave: "escola", rotulo: "Escola" },
      { chave: "serie", rotulo: "Série" },
      { chave: "turno", rotulo: "Turno" },
      { chave: "responsavel", rotulo: "Responsável" },
      { chave: "whatsapp", rotulo: "WhatsApp" },
      { chave: "valorMensalidade", rotulo: "Mensalidade", tipo: "moeda" },
      { chave: "status", rotulo: "Status" },
    ],
  },
];

function formatarValor(valor: any, tipo?: string) {
  if (valor === null || valor === undefined || valor === "") return "—";
  if (tipo === "moeda") return formatarMoeda(Number(valor));
  if (tipo === "data") return formatarData(valor);
  return String(valor);
}

function baixarCSV(nomeArquivo: string, colunas: Coluna[], linhas: any[]) {
  const cabecalho = colunas.map((c) => c.rotulo);
  const corpo = linhas.map((linha) => colunas.map((c) => formatarValor(linha[c.chave], c.tipo)));
  const conteudo = [cabecalho, ...corpo]
    .map((l) => l.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function imprimir(titulo: string, colunas: Coluna[], linhas: any[]) {
  const janela = window.open("", "_blank");
  if (!janela) return;
  const linhasHtml = linhas
    .map(
      (linha) =>
        `<tr>${colunas.map((c) => `<td style="padding:6px 10px;border-bottom:1px solid #ddd;">${formatarValor(linha[c.chave], c.tipo)}</td>`).join("")}</tr>`
    )
    .join("");
  janela.document.write(`
    <html>
      <head>
        <title>${titulo}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { text-align: left; background: #f3f1ea; padding: 6px 10px; }
        </style>
      </head>
      <body>
        <h2>${titulo}</h2>
        <table>
          <thead><tr>${colunas.map((c) => `<th>${c.rotulo}</th>`).join("")}</tr></thead>
          <tbody>${linhasHtml}</tbody>
        </table>
      </body>
    </html>
  `);
  janela.document.close();
  janela.focus();
  janela.print();
}

export default function RelatoriosPage() {
  const [aberto, setAberto] = useState<string | null>(null);
  const [dados, setDados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);

  async function buscarDados(tipo: string) {
    const res = await fetch(`/api/relatorios?tipo=${tipo}`);
    return res.json();
  }

  async function visualizar(tipo: string) {
    if (aberto === tipo) {
      setAberto(null);
      return;
    }
    setCarregando(true);
    const resultado = await buscarDados(tipo);
    setDados(resultado);
    setAberto(tipo);
    setCarregando(false);
  }

  async function exportarExcel(rel: (typeof RELATORIOS)[number]) {
    const resultado = await buscarDados(rel.tipo);
    baixarCSV(`${rel.tipo}.csv`, rel.colunas, resultado);
  }

  async function exportarImprimir(rel: (typeof RELATORIOS)[number]) {
    const resultado = await buscarDados(rel.tipo);
    imprimir(rel.titulo, rel.colunas, resultado);
  }

  const relatorioAberto = RELATORIOS.find((r) => r.tipo === aberto);

  return (
    <div>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-1">Relatórios</h1>
      <p className="text-ink/60 mb-6 text-sm md:text-base">Visualize ou exporte relatórios em Excel ou PDF</p>

      <div className="grid md:grid-cols-2 gap-4">
        {RELATORIOS.map((rel) => (
          <div key={rel.tipo} className="bg-white rounded-card border border-line p-4">
            <h3 className="font-display text-base mb-0.5">{rel.titulo}</h3>
            <p className="text-xs text-ink/50 mb-3">{rel.descricao}</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => visualizar(rel.tipo)}
                className={`text-xs border rounded-lg px-3 py-1.5 ${
                  aberto === rel.tipo ? "border-moss bg-moss/10 text-moss2" : "border-line bg-white hover:bg-mist"
                }`}
              >
                Visualizar
              </button>
              <button
                onClick={() => exportarImprimir(rel)}
                className="text-xs border border-line rounded-lg px-3 py-1.5 bg-white hover:bg-mist"
              >
                PDF
              </button>
              <button
                onClick={() => exportarExcel(rel)}
                className="text-xs border border-line rounded-lg px-3 py-1.5 bg-white hover:bg-mist"
              >
                Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      {relatorioAberto && (
        <div className="bg-white rounded-card border border-line p-4 mt-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-3 gap-2">
            <h2 className="font-display text-lg">{relatorioAberto.titulo}</h2>
            <span className="text-xs text-ink/50 whitespace-nowrap">{dados.length} registro(s)</span>
          </div>
          {carregando ? (
            <p className="text-ink/50 text-sm">Carregando...</p>
          ) : (
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-mist text-ink/70 text-left">
                <tr>
                  {relatorioAberto.colunas.map((c) => (
                    <th key={c.chave} className="px-3 py-2">
                      {c.rotulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dados.length === 0 && (
                  <tr>
                    <td colSpan={relatorioAberto.colunas.length} className="px-3 py-4 text-ink/50">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
                {dados.map((linha, i) => (
                  <tr key={i} className="border-t border-line/60">
                    {relatorioAberto.colunas.map((c) => (
                      <td key={c.chave} className="px-3 py-2 text-ink/80">
                        {formatarValor(linha[c.chave], c.tipo)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
