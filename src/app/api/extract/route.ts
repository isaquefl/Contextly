import { NextRequest } from 'next/server';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 413 }
      );
    }

    const mimeType = file.type;
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return Response.json(
        { error: 'Invalid file type. Supported: PDF, DOCX, TXT' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (mimeType === 'text/plain') {
      text = buffer.toString('utf-8');
    } else if (mimeType.includes('wordprocessingml') || file.name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
      await parser.destroy();
    } else {
      return Response.json(
        { error: 'Unsupported file format' },
        { status: 400 }
      );
    }

    const sanitized = sanitizeText(text);
    return Response.json({
      text: sanitized,
      name: file.name,
      charCount: sanitized.length,
    });
  } catch (error) {
    console.error('Extract error:', error);
    return Response.json(
      { error: 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}

function sanitizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s{3,}/g, '  ')
    .trim();
}
