'use client';

import dynamic from 'next/dynamic';
import '../../index.css';
import { HeaderProvider } from './headerContext';
import { useEffect } from 'react';
import { initMixpanel } from '../../common/mixpanel/mixpanel.config';

const DynamicNavBar = dynamic(() => import('../navBar'), {
  ssr: false,
});

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Mixpanel when the app loads
    initMixpanel();
  }, []);
  return (
    <HeaderProvider>
      <div>
        <DynamicNavBar />
        <main className="relative top-[54px]">{children}</main>
      </div>
    </HeaderProvider>
  );
}
