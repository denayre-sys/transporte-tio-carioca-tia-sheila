import { prisma } from "@/lib/prisma";

export async function obterConfiguracao() {
  let config = await prisma.configuracao.findFirst();
  if (!config) {
    config = await prisma.configuracao.create({ data: {} });
  }
  return config;
}
