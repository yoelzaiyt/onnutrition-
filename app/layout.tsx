import React from 'react';
import ClientLayout from '@/app/components/layout/ClientLayout';
import './globals.css';

export const metadata = {
  title: 'ONNutrition - Sistema de Nutrição',
  description: 'Sistema completo para nutricionistas e pacientes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-[#0B2B24] text-white antialiased font-sans" suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
