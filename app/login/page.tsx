"use client";

import { APP_NAME } from "@/lib/config";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setErro("Senha incorreta. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm bg-white rounded-card border border-line p-8 shadow-sm"
      >
        <div className="text-3xl mb-2">🚐</div>
        <h1 className="font-display text-2xl text-ink mb-1">{APP_NAME}</h1>
        <p className="text-sm text-ink/60 mb-6">Transporte Escolar — acesso restrito</p>

        <label className="block text-sm font-medium text-ink mb-1" htmlFor="senha">
          Senha de acesso
        </label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2 mb-3 focus-ring outline-none"
          required
        />

        {erro && <p className="text-clay text-sm mb-3">{erro}</p>}

        <button
          type="submit"
          className="w-full bg-moss text-white rounded-lg py-2.5 font-medium hover:bg-moss2 transition-colors focus-ring"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
