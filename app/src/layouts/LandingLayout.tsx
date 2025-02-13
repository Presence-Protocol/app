'use client';

import React from 'react';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className=" bg-lila-200 flex flex-col min-h-screen">
      <main className="flex-grow bg-lila-200">{children}</main>
    </div>
  );
}
