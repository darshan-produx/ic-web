'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[AppError]', error);
  }, [error]);

  return (
    <div style={{ padding: 32, fontFamily: 'monospace', background: '#fff', minHeight: '100vh' }}>
      <h2 style={{ color: '#DC2626', marginBottom: 8 }}>Something went wrong</h2>
      <pre style={{ background: '#FEF2F2', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 13, color: '#7F1D1D' }}>
        {error?.message ?? 'Unknown error'}
        {'\n\n'}
        {error?.stack ?? ''}
      </pre>
      <p style={{ marginTop: 16, color: '#6B7280', fontSize: 13 }}>
        Digest: {error?.digest ?? 'none'}
      </p>
      <button
        onClick={reset}
        style={{ marginTop: 16, padding: '8px 16px', background: '#1A2330', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  );
}
