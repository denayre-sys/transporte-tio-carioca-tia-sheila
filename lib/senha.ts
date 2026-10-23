import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";

const TAMANHO_CHAVE = 64;

export function gerarHash(senha: string) {
  const sal = randomBytes(16).toString("hex");
  const chave = scryptSync(senha, sal, TAMANHO_CHAVE).toString("hex");
  return `scrypt$${sal}$${chave}`;
}

export function conferirHash(senha: string, armazenado: string) {
  const [alg, sal, chave] = armazenado.split("$");
  if (alg !== "scrypt" || !sal || !chave) return false;
  const esperado = Buffer.from(chave, "hex");
  const calculado = scryptSync(senha, sal, esperado.length);
  return timingSafeEqual(esperado, calculado);
}

export function conferirTexto(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}
