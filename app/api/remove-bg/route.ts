import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'REMOVE_BG_API_KEY not configured' }, { status: 500 });
  }

  const incomingForm = await req.formData();
  const imageFile = incomingForm.get('image_file');
  if (!imageFile || !(imageFile instanceof Blob)) {
    return NextResponse.json({ error: 'No image_file provided' }, { status: 400 });
  }

  const form = new FormData();
  form.append('image_file', imageFile);
  form.append('size', 'auto');

  const res = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: { 'X-Api-Key': apiKey },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `remove.bg error: ${text}` }, { status: res.status });
  }

  const imageBuffer = await res.arrayBuffer();
  return new NextResponse(imageBuffer, {
    status: 200,
    headers: { 'Content-Type': 'image/png' },
  });
}
