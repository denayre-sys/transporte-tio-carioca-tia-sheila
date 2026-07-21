"use client";

import { useEffect, useState } from "react";
import { formatarMoeda, formatarData } from "@/lib/format";
import { linkWhatsapp, mensagemCobranca, mensagemAniversario } from "@/lib/whatsapp";

function inicioDoDia(d: Date) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export default function LembretesPage() {
  const [mensalidades, setMensalidades] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/mensalidades").then((r) => r.json()),
      fetch("/api/alunos?status=ATIVO").then((r) => r.json()),
    ]).then(([m, a]) => {
      setMensalidades(m);
      setAlunos(a);
      setCarregando(false);
    });
  }, []);

  const hoje = inicioDoDia(new Date());
  const em3dias = new Date(hoje);
  em3dias.setUTCDate(em3dias.getUTCDate() + 3);

  const pendentes = mensalidades.filter((m) => m.status === "ABERTO" || m.status === "ATRASADO");
  const vencendoHoje = pendentes.filter((m) => inicioDoDia(new Date(m.vencimento)).getTime() === hoje.getTime());
  const vencendoEm3 = pendentes.filter((m) => {
    const v = inicioDoDia(new Date(m.vencimento));
    return v.getTime() > hoje.getTime() && v.getTime() <= em3dias.getTime();
  });
  const atrasados = pendentes.filter((m) => m.status === "ATRASADO");

  const hojeMes = hoje.getUTCMonth();
  const hojeDia = hoje.getUTCDate();
  const aniversariantesHoje = alunos.filter((a) => {
    if (!a.dataNascimento) return false;
    const n = new Date(a.dataNascimento);
    return n.getUTCMonth() === hojeMes && n.getUTCDate() === hojeDia;
  });
  const aniversariantesMes = alunos
    .filter((a) => a.dataNascimento && new Date(a.dataNascimento).getUTCMonth() === hojeMes)
    .sort((a, b) => new Date(a.dataNascimento).getUTCDate() - new Date(b.dataNascimento).getUTCDate());

  function Bloco({ titulo, vazio, children }: { titulo: string; vazio: boolean; children: React.ReactNode }) {
    return (
      <div className="bg-white rounded-card border border-line p-5 mb-5">
        <h2 className="font-display text-lg mb-3">{titulo}</h2>
        {vazio ? <p className="text-sm text-ink/50">Nada por aqui no momento.</p> : children}
      </div>
    );
  }

  function ItemCobranca({ m }: { m: any }) {
    return (
      <li className="flex items-center justify-between text-sm border-b border-line/60 py-2 last:border-0">
        <div>
          <p className="font-medium">{m.aluno.nome}</p>
          <p className="text-ink/50 text-xs">
            {formatarData(m.vencimento)} · {formatarMoeda(m.valor)}
          </p>
        </div>
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
          className="bg-moss text-white text-xs rounded-lg px-3 py-1.5 hover:bg-moss2 whitespace-nowrap"
        >
          Enviar lembrete
        </a>
      </li>
    );
  }

  function ItemAniversario({ a }: { a: any }) {
    return (
      <li className="flex items-center justify-between text-sm border-b border-line/60 py-2 last:border-0">
        <div>
          <p className="font-medium">{a.nome}</p>
          <p className="text-ink/50 text-xs">{formatarData(a.dataNascimento).slice(0, 5)}</p>
        </div>
        <a
          target="_blank"
          rel="noreferrer"
          href={linkWhatsapp(
            a.responsavel.whatsapp,
            mensagemAniversario({ nomeResponsavel: a.responsavel.nome, nomeAluno: a.nome })
          )}
          className="bg-clay text-white text-xs rounded-lg px-3 py-1.5 hover:opacity-90 whitespace-nowrap"
        >
          Enviar parabéns
        </a>
      </li>
    );
  }

  if (carregando) return <p className="text-ink/50">Carregando lembretes...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Lembretes</h1>
      <p className="text-ink/60 mb-6">
        Clique em cada botão para abrir o WhatsApp com a mensagem já pronta para envio.
      </p>

      <Bloco titulo="Vencendo hoje" vazio={vencendoHoje.length === 0}>
        <ul>{vencendoHoje.map((m) => <ItemCobranca key={m.id} m={m} />)}</ul>
      </Bloco>

      <Bloco titulo="Vencendo nos próximos 3 dias" vazio={vencendoEm3.length === 0}>
        <ul>{vencendoEm3.map((m) => <ItemCobranca key={m.id} m={m} />)}</ul>
      </Bloco>

      <Bloco titulo="Mensalidades atrasadas" vazio={atrasados.length === 0}>
        <ul>{atrasados.map((m) => <ItemCobranca key={m.id} m={m} />)}</ul>
      </Bloco>

      <Bloco titulo="Aniversariantes de hoje" vazio={aniversariantesHoje.length === 0}>
        <ul>{aniversariantesHoje.map((a) => <ItemAniversario key={a.id} a={a} />)}</ul>
      </Bloco>

      <Bloco titulo="Aniversariantes do mês" vazio={aniversariantesMes.length === 0}>
        <ul>{aniversariantesMes.map((a) => <ItemAniversario key={a.id} a={a} />)}</ul>
      </Bloco>
    </div>
  );
}
