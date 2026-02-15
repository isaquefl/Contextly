import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

const ANALYSIS_PROMPTS: Record<string, string> = {
  executive: 'Generate a concise executive summary (3-5 bullet points) of this document.',
  technical: 'Generate a technical summary covering key concepts, data, and specifications.',
  keyPoints: 'Extract the main key points as a numbered list.',
  keyQuestions: 'Generate 5-7 key questions that this document answers or addresses.',
  obligations: 'Extract all obligations, commitments, or requirements mentioned. List each with brief context.',
  risks: 'Extract all risks, liabilities, or potential issues mentioned. List each with brief context.',
  dates: 'Extract all important dates, deadlines, or time references. List each with context.',
  monetary: 'Extract all monetary values, amounts, prices, or financial figures. List each with context.',
  clauses: 'Extract and list critical or notable clauses. Provide the clause text and brief explanation.',
};

export async function POST(req: Request) {
  try {
    const { text, type } = (await req.json()) as {
      text: string;
      type: keyof typeof ANALYSIS_PROMPTS;
    };

    if (!text?.trim()) {
      return Response.json({ error: 'No text provided' }, { status: 400 });
    }

    const prompt = ANALYSIS_PROMPTS[type];
    if (!prompt) {
      return Response.json({ error: 'Invalid analysis type' }, { status: 400 });
    }

    const { text: result } = await generateText({
      model: openai('gpt-4o-mini'),
      system: 'You analyze documents and extract information. Respond only with the requested content, no preamble.',
      prompt: `${prompt}\n\nDocument:\n"""\n${text.slice(0, 15000)}\n"""`,
    });

    return Response.json({ result });
  } catch (error) {
    console.error('Analyze error:', error);
    return Response.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
