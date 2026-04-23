'use client';

import React from 'react';
import { HeroBanner } from '@/app/modules/courses/components/HeroBanner';

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B2B24] to-[#0A1F18] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <HeroBanner />
      </div>
    </div>
  );
}