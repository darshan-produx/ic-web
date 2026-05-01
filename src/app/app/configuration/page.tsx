'use client';
import { useState } from 'react';
import AdminSidebar from './components/adminNavigation';
import MainView from './components/mainView';

interface NavItem {
    id: string;
    label: string;
    icon?: string;
    type: string;
    order: number;
    level: number;
    enabled: boolean;
    children?: NavItem[];
    action?: any;
}

export default function Admin01() {
    const [selectedView, setSelectedView] = useState<NavItem | null>(null);
    return (
        <div className="h-[calc(100vh-56px)] w-full flex flex-row">
            <div className="bg-white h-full flex-shrink-0">
                <AdminSidebar
                    selectedView={selectedView}
                    setSelectedView={setSelectedView}
                />
            </div>
            {/* <div className="pb-2 w-full overflow-auto h-[calc(100vh-4.9rem)] scroll">
        {childrenWithSelectedView}
      </div> */}
            <div className="h-full flex-1 min-w-0">
                {selectedView && <MainView selectedView={selectedView} />}
            </div>
        </div>
    );
}
