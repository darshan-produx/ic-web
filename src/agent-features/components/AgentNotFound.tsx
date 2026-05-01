// src/components/AgentNotFound.tsx
'use client';
import React from 'react';
import Link from 'next/link';

export default function AgentNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="flex justify-center mb-8">
          <img
            src="https://res.cloudinary.com/dllylnxit/image/upload/v1761830788/ImpactCraft_logomark_original_100x100px_rutg9a.png"
            alt="ImpactCraft Logo"
            className="h-12"
          />
        </div>
        <h2 className="text-2xl text-gray-700 mb-6">Agent not found</h2>
        <p className="text-gray-500 mb-8">
          The agent you are trying to access does not exist or is unavailable.
        </p>
        <div className="flex justify-center">
          <Link href="/app/admin/agents" className="text-blue-600 underline">
            Back to Agents
          </Link>
        </div>
      </div>
    </div>
  );
}

