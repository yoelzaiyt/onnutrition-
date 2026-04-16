import React from 'react';
import Logo from '@/app/components/ui/Logo';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0B2B24] flex flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="relative animate-bounce">
        <Logo hideText iconSize={48} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tighter text-white">ONNutrition</h2>
        <div className="flex items-center gap-2 text-sm font-medium text-[#22B391] justify-center">
          <div className="w-1.5 h-1.5 bg-[#22B391] rounded-full animate-pulse" />
          Sincronizando consultório...
        </div>
      </div>
    </div>
  );
}
