const UNIDADES = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function ate999(n: number): string {
  if (n === 100) return "cem";
  const partes: string[] = [];
  const c = Math.floor(n / 100);
  const r = n % 100;
  if (c) partes.push(CENTENAS[c]);
  if (r) {
    if (r < 20) partes.push(UNIDADES[r]);
    else {
      const u = r % 10;
      partes.push(DEZENAS[Math.floor(r / 10)] + (u ? ` e ${UNIDADES[u]}` : ""));
    }
  }
  return partes.join(" e ");
}

function inteiroPorExtenso(n: number): string {
  if (n === 0) return "zero";
  const mil = Math.floor(n / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (mil) partes.push(mil === 1 ? "mil" : `${ate999(mil)} mil`);
  if (resto) partes.push(ate999(resto));
  if (partes.length === 2) {
    const liga = resto < 100 || resto % 100 === 0 ? " e " : " ";
    return partes.join(liga);
  }
  return partes[0];
}

export function reaisPorExtenso(valor: number): string {
  const centavosTotal = Math.round(valor * 100);
  const reais = Math.floor(centavosTotal / 100);
  const centavos = centavosTotal % 100;
  const parteReais = `${inteiroPorExtenso(reais)} ${reais === 1 ? "real" : "reais"}`;
  if (!centavos) return parteReais;
  const parteCentavos = `${inteiroPorExtenso(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`;
  return reais ? `${parteReais} e ${parteCentavos}` : parteCentavos;
}

export function dataPorExtenso(data: Date, utc = false): string {
  return data.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(utc ? { timeZone: "UTC" } : {}),
  });
}

const TIPO_TRANSPORTE: Record<string, string> = {
  IDA_E_VOLTA: "ida e volta",
  SO_IDA: "somente ida",
  SO_VOLTA: "somente volta",
};

export type DadosContrato = {
  empresa: {
    nome: string;
    documento?: string | null;
    endereco?: string | null;
    telefone?: string | null;
    cidadeForo?: string | null;
  };
  aluno: {
    nome: string;
    dataNascimento?: string | null;
    escola?: string | null;
    serie?: string | null;
    turno?: string | null;
    tipoTransporte?: string | null;
    itinerarioInicial?: string | null;
    itinerarioFinal?: string | null;
    endereco?: string | null;
    bairro?: string | null;
    valorMensalidade: number;
    diaVencimento: number;
  };
  responsavel: {
    nome: string;
    cpf?: string | null;
    endereco?: string | null;
    whatsapp?: string | null;
  };
  inicio: Date;
  fim: Date;
  hoje: Date;
};

const BRANCO = "______________________";

function ou(valor?: string | null, padrao = BRANCO) {
  return valor && valor.trim() ? valor.trim() : padrao;
}

export function montarContrato(d: DadosContrato) {
  const { empresa, aluno, responsavel } = d;
  const valor = Number(aluno.valorMensalidade) || 0;
  const valorFmt = valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const nascimento = aluno.dataNascimento ? dataPorExtenso(new Date(aluno.dataNascimento), true) : BRANCO;
  const modalidade = aluno.tipoTransporte ? TIPO_TRANSPORTE[aluno.tipoTransporte] || aluno.tipoTransporte : BRANCO;
  const enderecoAluno = [aluno.endereco, aluno.bairro].filter(Boolean).join(", ");

  const partes = [
    `CONTRATADA: ${empresa.nome}, inscrito(a) no CPF/CNPJ sob o nº ${ou(empresa.documento)}, com endereço em ${ou(empresa.endereco)}, telefone ${ou(empresa.telefone, "______________")}, doravante denominado(a) CONTRATADA.`,
    `CONTRATANTE: ${responsavel.nome}, inscrito(a) no CPF sob o nº ${ou(responsavel.cpf)}, residente em ${ou(responsavel.endereco || enderecoAluno)}, WhatsApp ${ou(responsavel.whatsapp, "______________")}, responsável legal pelo(a) aluno(a) ${aluno.nome}, nascido(a) em ${nascimento}, doravante denominado(a) CONTRATANTE.`,
  ];

  const clausulas: { titulo: string; paragrafos: string[] }[] = [
    {
      titulo: "CLÁUSULA 1ª – DO OBJETO",
      paragrafos: [
        `O presente contrato tem por objeto a prestação de serviço de transporte escolar do(a) aluno(a) ${aluno.nome}, matriculado(a) na escola ${ou(aluno.escola)}, série/ano ${ou(aluno.serie, "________")}, turno ${ou(aluno.turno, "________")}, na modalidade ${modalidade}.`,
        `Embarque (ida): ${ou(aluno.itinerarioInicial || enderecoAluno)}. Destino/retorno (volta): ${ou(aluno.itinerarioFinal || enderecoAluno)}.`,
      ],
    },
    {
      titulo: "CLÁUSULA 2ª – DAS OBRIGAÇÕES DA CONTRATADA",
      paragrafos: [
        "A CONTRATADA se obriga a: (a) executar o transporte com veículo em bom estado de conservação e com documentação, vistoria e seguro em dia; (b) manter o veículo conduzido por motorista habilitado e com a qualificação exigida pela legislação de trânsito para o transporte escolar; (c) zelar pela segurança do(a) aluno(a) durante todo o trajeto, utilizando os equipamentos de segurança obrigatórios; (d) cumprir os horários e o itinerário combinados, avisando o CONTRATANTE com a maior antecedência possível sobre atrasos, alterações ou impedimentos.",
      ],
    },
    {
      titulo: "CLÁUSULA 3ª – DAS OBRIGAÇÕES DO CONTRATANTE",
      paragrafos: [
        "O CONTRATANTE se obriga a: (a) manter o(a) aluno(a) pronto(a) e aguardando no local e horário combinados; (b) avisar com antecedência as ausências e quaisquer mudanças de endereço, telefone ou de pessoas autorizadas a receber o(a) aluno(a); (c) orientar o(a) aluno(a) a respeitar as regras de convivência e de segurança no veículo; (d) responder pelos danos que o(a) aluno(a) causar ao veículo ou a terceiros durante o transporte; (e) efetuar o pagamento nas condições deste contrato.",
      ],
    },
    {
      titulo: "CLÁUSULA 4ª – DO VALOR E DO PAGAMENTO",
      paragrafos: [
        `Pelo serviço, o CONTRATANTE pagará à CONTRATADA a mensalidade de ${valorFmt} (${reaisPorExtenso(valor)}), com vencimento todo dia ${aluno.diaVencimento} de cada mês, por Pix, transferência, dinheiro ou outro meio acordado entre as partes.`,
        "O atraso no pagamento sujeita o CONTRATANTE a multa de 2% (dois por cento) sobre o valor devido e juros de mora de 1% (um por cento) ao mês, calculados proporcionalmente aos dias de atraso. Persistindo o atraso por mais de 30 (trinta) dias, a CONTRATADA poderá suspender o serviço após aviso ao CONTRATANTE, sem prejuízo da cobrança dos valores devidos.",
        "A mensalidade corresponde à reserva da vaga e tem valor fixo; ausências do(a) aluno(a), feriados e recessos escolares não geram desconto ou compensação, salvo acordo por escrito entre as partes.",
      ],
    },
    {
      titulo: "CLÁUSULA 5ª – DA VIGÊNCIA E DO REAJUSTE",
      paragrafos: [
        `O contrato vigorará de ${dataPorExtenso(d.inicio)} a ${dataPorExtenso(d.fim)}, podendo ser renovado por acordo entre as partes. O valor da mensalidade poderá ser reajustado na renovação ou, durante a vigência, mediante aviso prévio de 30 (trinta) dias, em razão de variação nos custos do serviço.`,
      ],
    },
    {
      titulo: "CLÁUSULA 6ª – DA RESCISÃO",
      paragrafos: [
        "Qualquer das partes poderá rescindir este contrato mediante aviso prévio por escrito de 30 (trinta) dias, permanecendo devidas as mensalidades até o fim do aviso. O descumprimento grave das obrigações deste contrato autoriza a rescisão imediata pela parte prejudicada.",
      ],
    },
    {
      titulo: "CLÁUSULA 7ª – DOS IMPEDIMENTOS",
      paragrafos: [
        "A CONTRATADA não responde por atrasos ou interrupções causados por caso fortuito ou força maior (como falhas mecânicas imprevisíveis, acidentes, trânsito excepcional, greves ou condições climáticas), comprometendo-se a comunicar o CONTRATANTE imediatamente e, sempre que possível, a providenciar solução alternativa.",
      ],
    },
    {
      titulo: "CLÁUSULA 8ª – DA PROTEÇÃO DE DADOS PESSOAIS",
      paragrafos: [
        "Os dados pessoais do(a) aluno(a) e do CONTRATANTE serão utilizados exclusivamente para a execução deste contrato, para cobrança e para comunicação sobre o serviço, em conformidade com a Lei nº 13.709/2018 (LGPD), não sendo compartilhados com terceiros, salvo por obrigação legal.",
      ],
    },
    {
      titulo: "CLÁUSULA 9ª – DO FORO",
      paragrafos: [`Fica eleito o foro da comarca de ${ou(empresa.cidadeForo, "______________________")} para dirimir quaisquer questões decorrentes deste contrato.`],
    },
  ];

  const fechamento = `E, por estarem de acordo, firmam o presente contrato em 2 (duas) vias de igual teor.`;
  const local = `${ou(empresa.cidadeForo, "______________________")}, ${dataPorExtenso(d.hoje)}.`;

  return { titulo: "CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE TRANSPORTE ESCOLAR", partes, clausulas, fechamento, local };
}
