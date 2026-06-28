import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { groq } from '@ai-sdk/groq';
import { chunksToContext, findRelevantChunks } from '@/lib/chunking';
import type { TextChunk } from '@/lib/chunking';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const STRICT_SYSTEM = `You are an assistant that analyzes and answers questions EXCLUSIVELY from the provided document context.

STRICT RULES:
1. Answer ONLY based on the context below. Never use external knowledge.
2. If information is not in the text, respond: "I could not find this information in the provided document."
3. Do not invent or assume information not in the context.
4. When citing, use the format [Chunk N] to reference the source.
5. Be concise and objective.

CONTEXT (with chunk IDs for citation):
`;

const ASSISTED_SYSTEM = `You are an assistant that helps analyze documents. Primary source is the provided context, but you may make reasonable inferences when appropriate.

GUIDELINES:
1. Base your answers primarily on the context below.
2. Use [Chunk N] when citing specific passages.
3. For gaps, you may infer cautiously but signal uncertainty (e.g. "Based on context, likely...").
4. Be clear when you're inferring vs. citing.

CONTEXT:
`;

const FALLBACK_SYSTEM = `You are a helpful assistant. Answer concisely.`;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'GROQ_API_KEY is not set in .env' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const {
      messages,
      context,
      chunks: rawChunks,
      strictMode = 'strict',
    } = body as {
      messages: UIMessage[];
      context?: string;
      chunks?: TextChunk[];
      strictMode?: 'strict' | 'assisted';
    };

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const lastQuery = typeof lastUserMessage?.parts?.[0] === 'object' && 'text' in lastUserMessage?.parts?.[0]
      ? (lastUserMessage.parts[0] as { text: string }).text
      : '';

    let contextToUse = context?.trim() || '';
    const chunks = rawChunks && Array.isArray(rawChunks) ? rawChunks : [];

    if (chunks.length > 0 && lastQuery) {
      const relevantChunks = findRelevantChunks(chunks, lastQuery, 5);
      contextToUse = relevantChunks.length > 0
        ? chunksToContext(relevantChunks)
        : chunksToContext(chunks.slice(0, 3));
    } else if (!contextToUse && chunks.length > 0) {
      contextToUse = chunksToContext(chunks.slice(0, 5));
    }

    // Com documento: IA analisa o arquivo e responde só com base nele. Sem documento: resposta livre.
    const systemPrompt = contextToUse
      ? strictMode === 'strict'
        ? `${STRICT_SYSTEM}\n"""\n${contextToUse}\n"""`
        : `${ASSISTED_SYSTEM}\n"""\n${contextToUse}\n"""`
      : FALLBACK_SYSTEM;

    const result = streamText({
      model: groq(GROQ_MODEL),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Chat failed. Check GROQ_API_KEY in .env' },
      { status: 500 }
    );
  }
}
