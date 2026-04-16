'use client';

import React, { useState } from 'react';
import { Camera, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  onRemove?: () => void;
}

export default function PhotoUpload({ onUpload, currentUrl, onRemove }: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Mock upload - in a real app, upload to Supabase Storage
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {currentUrl ? (
        <div className="relative aspect-video rounded-3xl overflow-hidden group border border-slate-100">
          <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <label className="p-4 bg-white rounded-2xl text-[#0B2B24] cursor-pointer hover:scale-110 transition-transform shadow-xl">
              <Camera className="w-6 h-6" />
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
            {onRemove && (
              <button 
                onClick={onRemove}
                className="p-4 bg-rose-500 rounded-2xl text-white hover:scale-110 transition-transform shadow-xl"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-100 rounded-3xl hover:border-[#22B391]/40 hover:bg-emerald-50/30 transition-all cursor-pointer group bg-slate-50/50">
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-[#22B391] animate-spin" />
          ) : (
            <>
              <div className="p-5 bg-white rounded-2xl text-slate-400 group-hover:text-[#22B391] shadow-sm group-hover:shadow-lg transition-all mb-4 border border-slate-100">
                <ImageIcon className="w-8 h-8" />
              </div>
              <p className="text-sm font-black text-slate-400 group-hover:text-[#0B2B24]">Tirar ou enviar foto</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Opcional</p>
            </>
          )}
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
        </label>
      )}
    </div>
  );
}
