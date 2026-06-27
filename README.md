<div align="center">

# 📄 Contextly

### Leia e converse com seus documentos usando IA

Faça upload de **PDF, DOCX ou texto**, pergunte em linguagem natural e receba respostas com **citações rastreáveis** direto das fontes — sem alucinação, ancorado no que está no arquivo.

[![version](https://img.shields.io/badge/version-1.0.0-22c55e?style=for-the-badge)](https://github.com/isaquefl/Contextly)
[![license](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](#-licença)

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-f55036?style=flat-square)](https://groq.com/)

</div>

---

> 💬 **"Cadê a cláusula de rescisão deste contrato?"** — pergunte e receba a resposta com `[Chunk N]` apontando exatamente de onde ela veio.

> 💬 Pensado para quem precisa de respostas **confiáveis**: o modo estrito responde **apenas** com base no documento. Se não está no texto, o Contextly diz que não encontrou — em vez de inventar.

---

## ✨ Funcionalidades

- **📤 Upload de documentos** — PDF, DOCX e TXT (até 50 MB), com extração e sanitização automática de texto.
- **💬 Chat com RAG** — Perguntas em linguagem natural respondidas a partir do conteúdo do arquivo.
- **🔖 Citações rastreáveis** — Respostas referenciam trechos no formato `[Chunk N]`, ligando cada afirmação à fonte.
- **🎚️ Modo Estrito / Assistido** — Estrito responde só com o que está no documento; Assistido permite inferências cautelosas com sinalização de incerteza.
- **🧠 Análises rápidas** — Resumo executivo, resumo técnico, pontos-chave, perguntas-chave, obrigações, riscos, datas, valores monetários e cláusulas críticas.
- **⚡ Respostas em streaming** — Saída token a token via Vercel AI SDK para baixa latência.

## 🧠 Como funciona

O pipeline de **RAG** (Retrieval-Augmented Generation) roda inteiramente nas API Routes do Next.js:

1. **Extração** (`/api/extract`) — O arquivo é lido em memória: `pdf-parse` para PDF, `mammoth` para DOCX e leitura direta para TXT. O texto é sanitizado (normaliza quebras de linha e espaços).
2. **Chunking** (`lib/chunking.ts`) — O texto é dividido em blocos por parágrafo (~800 caracteres com 100 de sobreposição), cada um com um `id` para citação.
3. **Recuperação** — A pergunta do usuário é comparada aos chunks por correspondência de termos; os mais relevantes (top 5) são selecionados como contexto.
4. **Geração** (`/api/chat`) — Os chunks relevantes são injetados no system prompt e o modelo **Llama 3.3 70B** (via **Groq**) gera a resposta em streaming, citando as fontes com `[Chunk N]`.

> As análises rápidas (`/api/analyze`) usam prompts dedicados sobre o texto extraído para gerar resumos e extrações estruturadas.

## 🚀 Instalação e uso

```bash
# 1. Clone o repositório
git clone https://github.com/isaquefl/Contextly.git
cd Contextly

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
#    Crie um arquivo .env.local na raiz com:
echo "GROQ_API_KEY=" > .env.local
#    (preencha com sua chave da Groq — https://console.groq.com)

# 4. Ambiente de desenvolvimento
npm run dev

# 5. Build de produção
npm run build
npm start
```

Acesse **http://localhost:3000**.

## 🔐 Variáveis de ambiente

| Variável        | Obrigatória | Descrição                                                                 |
|-----------------|:-----------:|---------------------------------------------------------------------------|
| `GROQ_API_KEY`  | ✅          | Chave da API Groq usada para chat e análises (modelo `llama-3.3-70b-versatile`). |

> 🔒 Nunca versione sua chave. O `.env*` já está no `.gitignore`.

## 🛠️ Stack

| Camada          | Tecnologias                                                  |
|-----------------|-------------------------------------------------------------|
| **Frontend**    | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4 |
| **IA & Chat**   | Vercel AI SDK (`ai`, `@ai-sdk/groq`), Groq — Llama 3.3 70B  |
| **Documentos**  | `pdf-parse` (PDF), `mammoth` (DOCX), leitura nativa (TXT)   |
| **RAG**         | Chunking por parágrafo + recuperação por relevância (`lib/chunking.ts`) |

## 📄 Licença

Distribuído sob a licença **MIT**. Sinta-se livre para usar, estudar e adaptar.

---

<details>
<summary><strong>🇬🇧 English (summary)</strong></summary>

**Contextly** is an AI-powered document reader built with Next.js and TypeScript. Upload a **PDF, DOCX or text file**, ask questions in natural language and get answers grounded in the document with traceable `[Chunk N]` citations.

**RAG pipeline:** text is extracted (`pdf-parse` / `mammoth`), split into overlapping paragraph chunks, the most relevant chunks for each question are retrieved, injected into the prompt, and **Llama 3.3 70B** (via **Groq**) streams the answer. A **strict mode** answers only from the document, while an **assisted mode** allows careful inference. Quick analyses cover executive/technical summaries, key points, obligations, risks, dates, monetary values and critical clauses.

**Setup:** `git clone` → `npm install` → set `GROQ_API_KEY` in `.env.local` → `npm run dev`.

</details>

---

<div align="center">

**v1.0.0** · feito por **Isaque Félix**

[isaquefl.vercel.app](https://isaquefl.vercel.app)

</div>
