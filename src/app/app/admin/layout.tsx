import React from 'react';
import AdminSidebar from './adminSidebar';

export const metadata = {
  title: 'ImpactCraft',
  description: 'ImpactCraft Application',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="!h-[calc(100vh-4.9rem)] overflow-hidden">
      <div className="flex w-full">
        <div className="bg-white">
          <AdminSidebar />
        </div>
        <div className="pb-2 w-full overflow-auto h-[calc(100vh-4.9rem)] scroll">
          {children}
        </div>
      </div>
    </div>
  );
}
