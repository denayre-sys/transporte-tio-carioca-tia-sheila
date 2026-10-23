"use client";

import { useState } from "react";

export default function TrocarSenha() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ texto: string; erro: boolean } | null>(null);

  async function trocar(e: React.FormEvent) {
    e.preventDefault();
    setMensagem(null);

    if (novaSenha !== confirmacao) {
      setMensagem({ texto: "A confirmação não é igual à nova senha.", erro: true });
      return;
    }

    setSalvando(true);
    const res = await fetch("/api/configuracoes/senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
    const corpo = await res.json().catch(() => ({}));
    setSalvando(false);

    if (res.ok) {
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmacao("");
      setMensagem({ texto: "Senha alterada. Use a nova senha no próximo login.", erro: false });
    } else {
      setMensagem({ texto: corpo.erro || "Não foi possível alterar a senha.", erro: true });
    }
  }

  const campoClasse = "w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus-ring bg-white";
  const rotulo = "block text-sm font-medium text-ink mb-1";

  return (
    <form onSubmit={trocar} className="bg-white rounded-card border border-line p-5 mb-5">
      <h2 className="font-display text-lg mb-1">Trocar senha de acesso</h2>
      <p className="text-xs text-ink/50 mb-4">Mínimo de 6 caracteres. Vale a partir do próximo login.</p>

      <div className="mb-4">
        <label className={rotulo} htmlFor="senhaAtual">Senha atual</label>
        <input
          id="senhaAtual"
          type="password"
          autoComplete="current-password"
          className={campoClasse}
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className={rotulo} htmlFor="novaSenha">Nova senha</label>
        <input
          id="novaSenha"
          type="password"
          autoComplete="new-password"
          minLength={6}
          className={campoClasse}
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />
      </div>
      <div className="mb-4">
        <label className={rotulo} htmlFor="confirmacao">Confirmar nova senha</label>
        <input
          id="confirmacao"
          type="password"
          autoComplete="new-password"
          minLength={6}
          className={campoClasse}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          required
        />
      </div>

      {mensagem && (
        <p className={`text-sm mb-4 ${mensagem.erro ? "text-clay" : "text-moss2"}`}>{mensagem.texto}</p>
      )}

      <button
        disabled={salvando}
        className="px-4 py-2 text-sm bg-moss text-white rounded-lg hover:bg-moss2 disabled:opacity-60"
      >
        {salvando ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
