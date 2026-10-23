import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GridBloc PHP - Isomorphic Visual Solution Scaffold',
  description: 'Visual 12-column grid isomorphic UI BLoC builder and PHP 8.3 modern solution scaffolder with live preview, code generator, and architecture exporter.',
  openGraph: {
    title: 'GridBloc PHP - Isomorphic Visual Solution Scaffold',
    description: 'Visual 12-column grid isomorphic UI BLoC builder and PHP 8.3 modern solution scaffolder with live preview, code generator, and architecture exporter.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GridBloc PHP - Isomorphic Visual Solution Scaffold',
    description: 'Visual 12-column grid isomorphic UI BLoC builder and PHP 8.3 modern solution scaffolder with live preview, code generator, and architecture exporter.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-indigo-500/30 selection:text-indigo-200" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
