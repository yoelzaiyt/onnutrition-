'use client';

import React from 'react';
import { Leaf } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  hideText?: boolean;
  whiteOn?: boolean;
  showTagline?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  iconSize = 20, 
  textSize = "text-2xl",
  hideText = false,
  whiteOn = false,
  showTagline = false
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-10 h-10 bg-[#22B391] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
        <Leaf size={iconSize} strokeWidth={2.5} />
      </div>
      {!hideText && (
        <div className="flex flex-col">
          <span className={`font-black ${textSize} tracking-tighter leading-none flex items-center`}>
            <span className={whiteOn ? "text-white" : "text-[#0B2B24]"}>ON</span>
            <span className="text-[#22B391]">Nutrition</span>
          </span>
          {showTagline && (
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 ${whiteOn ? "text-white/60" : "text-slate-400"}`}>
              Inteligência Nutricional
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
