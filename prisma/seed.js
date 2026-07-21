const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

function normalizar(s) {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

function mapearTipoTransporte(v) {
  const n = normalizar(v);
  if (n.includes("IDA E VOLTA")) return "IDA_E_VOLTA";
  if (n.includes("SO VOLTA")) return "SO_VOLTA";
  if (n.includes("SO IDA")) return "SO_IDA";
  return null;
}

async function main() {
  const raw = fs.readFileSync(path.join(__dirname, "seed.json"), "utf-8");
  const data = JSON.parse(raw);

  console.log(
    `Importando ${data.responsaveis.length} responsáveis, ${data.alunos.length} alunos e ${data.mensalidades.length} mensalidades históricas...`
  );

  const respIdMap = {};
  for (const r of data.responsaveis) {
    let existente = null;
    if (r.cpf) {
      existente = await prisma.responsavel.findFirst({ where: { cpf: r.cpf } });
    }
    if (!existente) {
      existente = await prisma.responsavel.findFirst({
        where: { nome: r.nome, whatsapp: r.whatsapp || "" },
      });
    }
    const responsavel =
      existente ||
      (await prisma.responsavel.create({
        data: {
          nome: r.nome,
          cpf: r.cpf || null,
          whatsapp: r.whatsapp || "(00) 00000-0000",
        },
      }));
    respIdMap[r.id] = responsavel.id;
  }
  console.log(`Responsáveis prontos: ${Object.keys(respIdMap).length}`);

  const alunoIdMap = {};
  for (const a of data.alunos) {
    const responsavelId = respIdMap[a.responsavelId];
    if (!responsavelId) continue;

    const existente = await prisma.aluno.findFirst({
      where: { nome: a.nome, responsavelId },
    });

    const aluno =
      existente ||
      (await prisma.aluno.create({
        data: {
          nome: a.nome,
          responsavelId,
          dataNascimento: a.dataNascimento ? new Date(a.dataNascimento) : null,
          escola: a.escola || null,
          serie: a.serie || null,
          turno: a.turno || null,
          itinerarioInicial: a.itinerarioInicial || null,
          itinerarioFinal: a.itinerarioFinal || null,
          tipoTransporte: mapearTipoTransporte(a.tipoTransporte),
          valorSemDesconto: a.valorSemDesconto ?? null,
          valorMensalidade: a.valorMensalidade || 0,
          diaVencimento: a.diaVencimento || 10,
          status: a.status === "ATIVO" ? "ATIVO" : "INATIVO",
        },
      }));
    alunoIdMap[a.id] = aluno.id;
  }
  console.log(`Alunos prontos: ${Object.keys(alunoIdMap).length}`);

  let criadas = 0;
  let processadas = 0;
  for (const m of data.mensalidades) {
    processadas++;
    const alunoId = alunoIdMap[m.alunoId];
    if (!alunoId) continue;
    try {
      await prisma.mensalidade.upsert({
        where: { alunoId_mesReferencia: { alunoId, mesReferencia: m.mesReferencia } },
        update: {},
        create: {
          alunoId,
          mesReferencia: m.mesReferencia,
          valor: m.valor,
          vencimento: new Date(m.vencimento),
          status: m.status,
          dataPagamento: m.dataPagamento ? new Date(m.dataPagamento) : null,
          formaPagamento: m.formaPagamento || null,
        },
      });
      criadas++;
    } catch (e) {
      console.error("Falha ao importar mensalidade:", m.alunoId, m.mesReferencia, e.message);
    }
    if (processadas % 100 === 0) {
      console.log(`... ${processadas}/${data.mensalidades.length} processadas (${criadas} importadas até agora)`);
    }
  }
  console.log(`Mensalidades importadas: ${criadas}`);
  console.log("Importação concluída.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
