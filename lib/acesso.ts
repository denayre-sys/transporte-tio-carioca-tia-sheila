import { prisma } from "@/lib/prisma";
import { conferirHash, conferirTexto } from "@/lib/senha";

export async function senhaConfere(senha: unknown) {
  if (typeof senha !== "string" || senha.length === 0) return false;

  let senhaHash: string | null = null;
  try {
    const acesso = await prisma.acesso.findUnique({ where: { id: "principal" } });
    senhaHash = acesso?.senhaHash ?? null;
  } catch {
    senhaHash = null;
  }

  if (senhaHash) return conferirHash(senha, senhaHash);
  const padrao = process.env.APP_SENHA;
  return !!padrao && conferirTexto(senha, padrao);
}
