"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { APP_NAME } from "@/lib/config";

const itens = [
  { href: "/", label: "Painel", icone: "🚐" },
  { href: "/alunos", label: "Alunos", icone: "🎒" },
  { href: "/responsaveis", label: "Responsáveis", icone: "👪" },
  { href: "/financeiro", label: "Financeiro", icone: "💳" },
  { href: "/rota", label: "Rota do Dia", icone: "🗺️" },
  { href: "/relatorios", label: "Relatórios", icone: "📄" },
  { href: "/lembretes", label: "Lembretes", icone: "💬" },
  { href: "/configuracoes", label: "Configurações", icone: "⚙️" },
];

const principaisMobile = ["/", "/alunos", "/financeiro", "/lembretes"];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [maisAberto, setMaisAberto] = useState(false);

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Sidebar — visível a partir de telas médias */}
      <aside className="hidden md:flex w-60 shrink-0 bg-moss2 text-paper flex-col min-h-screen">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="font-display text-xl leading-tight">{APP_NAME}</h1>
          <p className="text-xs text-paper/60 mt-1">Transporte Escolar</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {itens.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors focus-ring ${
                  ativo ? "bg-paper text-moss2 font-medium" : "text-paper/80 hover:bg-white/10"
                }`}
              >
                <span aria-hidden>{item.icone}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={sair}
          className="m-3 px-3 py-2.5 rounded-lg text-sm text-paper/70 hover:bg-white/10 text-left focus-ring"
        >
          ⏻ Sair
        </button>
      </aside>

      {/* Cabeçalho — só no celular */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-moss2 text-paper px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-base leading-tight">{APP_NAME}</h1>
          <p className="text-[11px] text-paper/60">Transporte Escolar</p>
        </div>
        <button onClick={sair} className="text-xs text-paper/70 px-2 py-1">
          ⏻ Sair
        </button>
      </header>

      {/* Menu de baixo — só no celular */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-line flex items-stretch">
        {principaisMobile.map((href) => {
          const item = itens.find((i) => i.href === href)!;
          const ativo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${
                ativo ? "text-moss2 font-medium" : "text-ink/50"
              }`}
            >
              <span className="text-base" aria-hidden>
                {item.icone}
              </span>
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMaisAberto(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${
            maisAberto ? "text-moss2 font-medium" : "text-ink/50"
          }`}
        >
          <span className="text-base" aria-hidden>
            ☰
          </span>
          Mais
        </button>
      </nav>

      {/* Folha "Mais" — só no celular */}
      {maisAberto && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 flex items-end"
          onClick={() => setMaisAberto(false)}
        >
          <div
            className="bg-white w-full rounded-t-2xl p-4 pb-8 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-line rounded-full mx-auto mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {itens
                .filter((i) => !principaisMobile.includes(i.href))
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMaisAberto(false)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border text-xs ${
                      pathname === item.href ? "border-moss bg-moss/10 text-moss2" : "border-line text-ink/70"
                    }`}
                  >
                    <span className="text-xl" aria-hidden>
                      {item.icone}
                    </span>
                    {item.label}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
