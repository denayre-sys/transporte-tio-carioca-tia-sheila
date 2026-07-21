# Transporte Escolar — Sistema de Gestão

Sistema simples de gestão do transporte escolar: alunos, responsáveis, mensalidades e lembretes de cobrança/aniversário via WhatsApp (semi-automático: o sistema monta a mensagem, você clica para enviar).

Esta é uma cópia limpa do sistema, sem nenhum dado de alunos ou responsáveis — pronta para começar do zero.

## O que o sistema faz

- **Painel**: alunos ativos, responsáveis, previsto x recebido x em aberto no mês, inadimplentes, próximos vencimentos, aniversariantes do mês.
- **Alunos**: cadastro completo, busca, edição, inativação.
- **Responsáveis**: cadastro e vínculo com os alunos.
- **Financeiro**: gera as cobranças do mês com um clique, marca pagamentos, calcula atraso automaticamente.
- **Lembretes**: uma tela única com os botões prontos de WhatsApp para vencendo hoje, vencendo em 3 dias, atrasados, aniversariantes do dia e do mês. Cada botão abre o WhatsApp Web/App já com o número do responsável e a mensagem escrita — você só confere e aperta enviar.
- **Login único**: protegido por senha, pensado para um usuário só.
- **Nome do app configurável**: o nome que aparece no menu, na tela de login e nas mensagens de WhatsApp/e-mail vem da variável `NEXT_PUBLIC_APP_NAME` (já vem preenchida com "Transporte da Mamãe" no `.env.example` — troque à vontade).

## Passo a passo para colocar no ar de graça

Isso leva uns 20-30 minutos na primeira vez, sem precisar saber programar — só seguir os passos.

### 1. Criar o banco de dados gratuito (Supabase)

1. Acesse https://supabase.com e crie uma conta gratuita.
2. Crie um novo projeto (escolha uma senha de banco e guarde-a).
3. Em **Project Settings → Database → Connection string**, copie a string no formato `postgresql://...` (use a opção "Connection pooling" se disponível).

### 2. Subir o código no GitHub

1. Crie uma conta gratuita em https://github.com, se ainda não tiver.
2. Crie um repositório novo (pode ser privado) e envie esta pasta para ele.

### 3. Publicar no Vercel (gratuito)

1. Acesse https://vercel.com e crie uma conta gratuita (pode entrar com o GitHub).
2. Clique em **New Project** e selecione o repositório que você acabou de subir.
3. Em **Environment Variables**, adicione as variáveis do arquivo `.env.example`:
   - `DATABASE_URL` — a connection string do Supabase.
   - `APP_SENHA` — a senha que será usada para entrar no sistema.
   - `AUTH_SECRET` — qualquer texto aleatório longo (pode gerar em https://generate-secret.vercel.app/32).
   - `NEXT_PUBLIC_APP_NAME` — o nome que aparece no app (opcional, já vem com um valor padrão).
4. Clique em **Deploy**. Em poucos minutos o site estará no ar com uma URL gratuita.

### 4. Criar as tabelas no banco

Depois do primeiro deploy, rode uma única vez (no seu computador, com Node.js instalado):

```bash
npm install
npx prisma migrate deploy
```

com o mesmo `DATABASE_URL` do Supabase configurado em um arquivo `.env` local (copie `.env.example` para `.env` e preencha). Isso cria as tabelas de alunos, responsáveis e mensalidades no banco.

### 5. Começar a cadastrar

Este projeto vem sem nenhum dado (o `prisma/seed.json` está vazio). Depois de rodar `npx prisma migrate deploy` (passo 4), é só entrar no site e cadastrar os alunos e responsáveis pela própria tela do sistema — não é necessário rodar nenhum script de importação.

Se um dia você tiver uma planilha para importar de uma vez, o comando `npm run db:seed` lê o arquivo `prisma/seed.json` no formato:

```json
{
  "responsaveis": [{ "id": "resp_1", "nome": "...", "cpf": "...", "whatsapp": "..." }],
  "alunos": [{ "id": "aluno_1", "nome": "...", "responsavelId": "resp_1" }],
  "mensalidades": [{ "alunoId": "aluno_1", "mesReferencia": "2026-01", "valor": 200, "vencimento": "2026-01-10", "status": "ABERTO" }]
}
```

O comando pode ser rodado mais de uma vez sem duplicar dados (ele verifica o que já existe antes de criar).

### Rodando localmente (opcional, para testar antes)

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, APP_SENHA, AUTH_SECRET e NEXT_PUBLIC_APP_NAME
npx prisma migrate dev
npm run dev
```

Acesse http://localhost:3000

## Rotina de uso sugerida

- Todo início de mês: entre em **Financeiro** e clique em "Gerar cobranças do mês".
- Todo dia: dê uma olhada em **Lembretes** e mande os avisos de vencimento/atraso e os parabéns de aniversário com um clique.
- Quando receber um pagamento: em **Financeiro**, clique em "Marcar como pago".

## Limitações conhecidas desta versão

- O envio pelo WhatsApp é semi-automático (você clica para enviar) — para automação 100% sem intervenção manual, seria necessário cadastrar a WhatsApp Cloud API oficial da Meta, o que exige verificação de conta Business.
- Upload de foto do aluno, controle de veículos/rotas/motoristas e emissão de boleto/Pix não foram incluídos nesta versão, para manter o sistema simples e gratuito — dá para adicionar depois, se fizer sentido.
