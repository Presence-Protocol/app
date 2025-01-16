'use client';

import React from 'react';
import BaseHead from '@/components/BaseHead';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className=" bg-white flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
    </div>
  );
}
