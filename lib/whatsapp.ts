import { APP_NAME } from "@/lib/config";

export function limparTelefone(numero: string) {
  const digitos = numero.replace(/\D/g, "");
  if (digitos.startsWith("55")) return digitos;
  return `55${digitos}`;
}

export function linkWhatsapp(numero: string, mensagem: string) {
  const tel = limparTelefone(numero);
  return `https://wa.me/${tel}?text=${encodeURIComponent(mensagem)}`;
}

export function mensagemCobranca(opts: {
  nomeResponsavel: string;
  nomeAluno: string;
  valor: string;
  vencimento: string;
  atrasado: boolean;
}) {
  const { nomeResponsavel, nomeAluno, valor, vencimento, atrasado } = opts;
  if (atrasado) {
    return `Olá, ${nomeResponsavel}! Tudo bem? Aqui é o ${APP_NAME}, do transporte escolar. Passando para lembrar que a mensalidade de ${nomeAluno}, vencida em ${vencimento} (${valor}), ainda está em aberto. Qualquer dúvida, me chama por aqui. Obrigado!`;
  }
  return `Olá, ${nomeResponsavel}! Tudo bem? Aqui é o ${APP_NAME}, do transporte escolar. Passando para lembrar que a mensalidade de ${nomeAluno} vence em ${vencimento}, no valor de ${valor}. Qualquer dúvida, me chama por aqui. Obrigado!`;
}

export function mensagemAniversario(opts: { nomeResponsavel: string; nomeAluno: string }) {
  return `Olá, ${opts.nomeResponsavel}! Aqui é o ${APP_NAME}. Passando só para desejar um Feliz Aniversário para ${opts.nomeAluno}! Um grande abraço para ele(a) hoje.`;
}
