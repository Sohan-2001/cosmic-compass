// src/app/api/upload-face/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid'; // For unique filenames

export async function POST(request: Request): Promise<NextResponse> {
  const originalFilename = request.headers.get('x-filename');

  if (!request.body) {
    return NextResponse.json({ error: 'No file body found' }, { status: 400 });
  }
  if (!originalFilename) {
    return NextResponse.json({ error: 'Filename header (x-filename) is required' }, { status: 400 });
  }

  const fileExtension = originalFilename.split('.').pop() || 'jpg';
  const uniqueFilename = `${nanoid()}.${fileExtension}`;
  const blobPath = `face-images/${uniqueFilename}`;


  try {
    const blob = await put(blobPath, request.body, {
      access: 'public', // So the AI can access it via URL
      token: process.env.BLOB_READ_WRITE_TOKEN, // Server-side only
      contentType: request.headers.get('content-type') || undefined, // Pass content type if available
    });
    return NextResponse.json(blob); // Returns { url, pathname, contentType, contentDisposition }
  } catch (error: any) {
    console.error("Error uploading to Vercel Blob:", error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
