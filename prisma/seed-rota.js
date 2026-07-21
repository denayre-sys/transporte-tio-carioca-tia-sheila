const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function main() {
  const existentes = await prisma.rotaItem.count();
  if (existentes > 0) {
    console.log(`A Rota do Dia já tem ${existentes} item(ns) cadastrados — nada foi alterado.`);
    console.log("Se quiser recomeçar do zero, apague os itens na tela do site e rode este comando de novo.");
    return;
  }

  const itens = JSON.parse(fs.readFileSync(path.join(__dirname, "rota-seed.json"), "utf-8"));

  for (const item of itens) {
    await prisma.rotaItem.create({
      data: { secao: item.secao, ordem: item.ordem, texto: item.texto, status: "PENDENTE" },
    });
  }

  console.log(`${itens.length} itens da Rota do Dia importados com sucesso.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
