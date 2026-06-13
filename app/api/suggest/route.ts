import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildPrompt } from '@/lib/ai/prompt';
import { parseSuggestResponse } from '@/lib/ai/parse';
import type { SuggestRequest, SuggestResponse } from '@/lib/ai/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  let body: SuggestRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!Array.isArray(body.wardrobe) || body.wardrobe.length === 0) {
    return NextResponse.json({ error: 'Empty wardrobe' }, { status: 400 });
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const prompt = buildPrompt(body.wardrobe, body.context);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const validIds = new Set(body.wardrobe.map((w) => w.id));
    const outfits = parseSuggestResponse(text, validIds);

    const payload: SuggestResponse = { outfits };
    return NextResponse.json(payload);
  } catch (e) {
    console.error('Gemini suggest failed:', e);
    return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
  }
}
