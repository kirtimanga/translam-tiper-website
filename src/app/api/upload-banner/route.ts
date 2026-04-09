import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('banner') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `banner-${Date.now()}.${ext}`;
    const filePath = path.join(process.cwd(), 'public', 'images', filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/images/${filename}` });
  } catch (error) {
    console.error('Error uploading banner:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
