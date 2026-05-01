import React from 'react';
import ConfigSidebar from './configSidebar';

export const metadata = {
  title: 'ImpactCraft',
  description: 'ImpactCraft Application',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="!h-[calc(100vh-4.9rem)] overflow-hidden">
      <div className="flex w-full">
        <div className="bg-white">
          <ConfigSidebar />
        </div>
        <div className="pb-2 w-full overflow-auto h-[calc(100vh-4.9rem)] scroll">
          {children}
        </div>
      </div>
    </div>
  );
}
