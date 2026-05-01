// src/components/AgentFallbackShell.tsx
'use client';
import React from 'react';

export default function AgentFallbackShell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="p-6 mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{title || 'Agent Setup'}</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6">{children}</div>
    </div>
  );
}
