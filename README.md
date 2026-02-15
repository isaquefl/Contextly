# Contextly — Intelligent Document Reading with AI

![Full Stack Project](https://img.shields.io/badge/Full_Stack-Project-22c55e?style=for-the-badge&logo=vercel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-22c55e?style=flat-square)

> **RAG-powered document analysis** — Upload PDFs, DOCX, or paste text. Ask questions, extract insights, get citations.

---

## English

### Why this matters for companies

| Scenario | Benefit |
|----------|---------|
| **Contracts & legal** | Analyze clauses and extract information without exposing data to external training |
| **Internal docs** | Intelligent FAQ on manuals and procedures |
| **Research** | Summaries, Q&A, and insights from articles in seconds |
| **Onboarding** | New hires interact with training materials naturally |
| **RAG proof of concept** | Foundation for Chat with PDFs, knowledge bases, semantic search |

**Immediate ROI:** Less time on repetitive reading, consistent answers, traceable citations.

### Tech stack

| Layer | Stack |
|-------|-------|
| **Frontend** | React 19, Next.js 16 (App Router), Tailwind CSS 4 |
| **AI & Chat** | Vercel AI SDK, Groq (Llama 3.3 70B) |
| **Processing** | Intelligent chunking, relevance-based context injection |

### Features

- **File upload** — PDF, DOCX, TXT (max 50MB)
- **Smart chunking** — Sends only relevant chunks to the model
- **Strict / Assisted mode** — Answers only from document vs. light inference
- **Citations** — Click chunks to highlight in the document
- **Search** — Find text within the document
- **Quick analysis** — Executive summary, obligations, risks, dates, monetary values
- **Export** — Copy, Markdown, TXT
- **Dark mode** — Full theme support
- **Token estimate** — Cost awareness per session

### How to run

```bash
git clone <repo>
cd contextly
npm install
echo "GROQ_API_KEY=your-groq-key" > .env.local
npm run dev
```

Open **http://localhost:3000**.

### Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts    # Chat with chunk-aware context
│   │   ├── extract/route.ts # PDF/DOCX/TXT text extraction
│   │   └── analyze/route.ts # Quick analysis (summaries, extractions)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DocumentPanel.tsx
│   ├── ChatPanel.tsx
│   ├── FileUpload.tsx
│   ├── AnalysisButtons.tsx
│   └── Header.tsx
├── context/AppContext.tsx
└── lib/
    ├── chunking.ts   # RAG chunking + relevance
    └── types.ts
```

---

## Português

### Por que importa para empresas

| Cenário | Benefício |
|---------|-----------|
| **Contratos e jurídico** | Analise cláusulas e extraia informações sem expor dados sensíveis |
| **Documentação interna** | FAQ inteligente sobre manuais e procedimentos |
| **Pesquisa** | Resumos, Q&A e insights de artigos em segundos |
| **Onboarding** | Novos colaboradores interagem com materiais de treinamento de forma natural |
| **POC RAG** | Base técnica para Chat com PDFs, bases de conhecimento e busca semântica |

### Stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 19, Next.js 16 (App Router), Tailwind CSS 4 |
| **IA e Chat** | Vercel AI SDK, Groq (Llama 3.3 70B) |
| **Processamento** | Chunking inteligente, injeção de contexto por relevância |

### Funcionalidades

- **Upload de arquivos** — PDF, DOCX, TXT (máx. 50MB)
- **Chunking inteligente** — Envia apenas blocos relevantes ao modelo
- **Modo Estrito / Assistido** — Responde só do documento vs. inferências leves
- **Citações** — Clique em chunks para destacar no documento
- **Busca interna** — Localize texto no documento
- **Análise rápida** — Resumo executivo, obrigações, riscos, datas, valores
- **Exportação** — Copiar, Markdown, TXT
- **Modo escuro** — Suporte completo ao tema
- **Estimativa de tokens** — Consciência de custo por sessão

### Como executar

```bash
git clone <repo>
cd contextly
npm install
echo "GROQ_API_KEY=sua-chave-groq" > .env.local
npm run dev
```

Acesse **http://localhost:3000**.

---

## Security & performance

- **Chaves:** Apenas `.env` (nunca em `.ts` público). Repo isaquefl: nenhum dado sensível ou API key em código.
- **Resultados:** Salve resumos/pesquisas em `.env` local ou em arquivos markdown de documentação, não em fontes versionadas.
- Documents are processed in-memory; no permanent storage without consent
- Text sanitization on extraction
- Max file size: 50MB with clear feedback
- Streaming responses for low latency
- Chunk cache to avoid reprocessing

## Alternative: Gemini

```bash
npm install @ai-sdk/google
```

In `api/chat/route.ts` and `api/analyze/route.ts`, replace OpenAI with:

```ts
import { google } from '@ai-sdk/google';
model: google('gemini-1.5-flash')
```

Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`.
