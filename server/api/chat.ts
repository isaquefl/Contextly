import { NextApiRequest, NextApiResponse } from 'next';

// Puxando a chave do seu .env com segurança
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Bloqueia qualquer coisa que não seja POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas POST é permitido' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Mensagem vazia' });
  }

  try {
    // Chamada bruta para a API da Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // O modelo ultra rápido que você escolheu
        messages: [
          { role: "system", content: "Atue como Full Stack Sênior. Respostas brutas e diretas." },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Erro na Groq");
    }

    // Retorna apenas o texto da resposta
    res.status(200).json({ 
      text: data.choices[0].message.content 
    });

  } catch (error: any) {
    console.error("Erro na API Route:", error.message);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
}