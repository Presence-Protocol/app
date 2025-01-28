'use client';

import React from 'react';

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
