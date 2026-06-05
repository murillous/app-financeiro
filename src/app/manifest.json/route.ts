import { NextResponse } from 'next/server';

const manifest = {
  name: 'Finanças Pessoais',
  short_name: 'Finanças',
  description: 'Controle seus gastos, rendas e cartões',
  start_url: '/dashboard',
  display: 'standalone',
  background_color: '#0A0A0A',
  theme_color: '#0A0A0A',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
};

export function GET() {
  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
