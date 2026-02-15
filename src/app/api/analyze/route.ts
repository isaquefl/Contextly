const GROQ_MODEL = 'llama-3.3-70b-versatile';

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
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'GROQ_API_KEY is not set in .env' }, { status: 500 });
    }

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

    const userContent = `${prompt}\n\nDocument:\n"""\n${text.slice(0, 15000)}\n"""`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: 'You analyze documents and extract information. Respond only with the requested content, no preamble.' },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
      }),
    });

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };

    if (!response.ok) {
      throw new Error(data.error?.message ?? 'Groq API error');
    }

    const result = data.choices?.[0]?.message?.content?.trim() ?? '';
    return Response.json({ result });
  } catch (error) {
    console.error('Analyze error:', error);
    return Response.json(
      { error: 'Analysis failed. Check GROQ_API_KEY in .env' },
      { status: 500 }
    );
  }
}
