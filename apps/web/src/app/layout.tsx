import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

/**
 * Fonts are loaded via `next/font` (self-hosted, zero layout shift).
 * Each exposes a CSS variable consumed by `globals.css` @theme block —
 * which in turn becomes Tailwind utilities (font-display, font-sans, font-mono).
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Sojo AI — your virtual AI team',
    template: '%s · Sojo AI',
  },
  description:
    'Hire, talk to, and collaborate with 10 specialist AI agents. Built for humans, powered by agents.',
  applicationName: 'Sojo AI',
};

export const viewport: Viewport = {
  themeColor: '#1a1814',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
