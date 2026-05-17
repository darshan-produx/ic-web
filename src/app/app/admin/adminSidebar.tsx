'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ChevronDown, PanelLeftClose, PanelLeft, Layers } from 'lucide-react';

// ── Nav data ──────────────────────────────────────────────────────────────────

type NavItem = { label: string; href: string; id: string };
type NavSection = { id: string; label: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    id: 'masters',
    label: 'Masters',
    items: [
      { label: 'User master',                  href: '/app/admin/users',         id: 'm_users' },
      { label: 'Customer Master',              href: '/app/admin/customers',     id: 'm_customers' },
      { label: 'Segment Master',               href: '/app/admin/segments',      id: 'm_segments' },
      { label: 'Product / Service Master',     href: '/app/admin/products',      id: 'm_products' },
      { label: 'Task Status Master',           href: '/app/admin/task-status',   id: 'm_task_status' },
      { label: 'Document Structure & Medium',  href: '/app/admin/documents',     id: 'm_documents' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    items: [
      { label: 'Metrics',    href: '/app/admin/data/metric-data',    id: 'd_metrics' },
      { label: 'Attributes', href: '/app/admin/data/attribute-data', id: 'd_attributes' },
    ],
  },
];

// ── Sidebar ───────────────────────────────────────────────────────────────────

const AdminSidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    masters: true,
    data: true,
  });

  const toggleSection = (id: string) =>
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const q = searchQuery.toLowerCase();
    return SECTIONS
      .map(section => ({
        ...section,
        items: section.items.filter(it => it.label.toLowerCase().includes(q)),
      }))
      .filter(s => s.items.length > 0);
  }, [searchQuery]);

  if (!open) {
    return (
      <div className="w-[56px] bg-white border-r border-[#E4E7EC] h-full flex flex-col items-center pt-5">
        <button
          onClick={() => setOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-[#637083] hover:bg-[#F2F4F7] transition-colors"
          aria-label="Open sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-[260px] bg-white border-r border-[#E4E7EC] h-full flex flex-col">
      {/* Title row */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[#141C24]">Admin</h2>
        <button
          onClick={() => setOpen(false)}
          className="w-7 h-7 flex items-center justify-center text-[#637083] hover:bg-[#F2F4F7] rounded-md transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 h-9 text-[13px] text-[#141C24] border border-[#E4E7EC] rounded-[8px] outline-none focus:border-blue-400 placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      {/* Nav sections */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections[section.id];
          return (
            <div key={section.id} className="mb-1">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-2 px-2 py-2 text-[13px] font-semibold text-[#141C24] hover:bg-[#F9FAFB] rounded-md transition-colors"
              >
                <Layers className="w-4 h-4 text-[#637083]" />
                <span className="flex-1 text-left">{section.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-[#637083] transition-transform ${
                    isExpanded ? '' : '-rotate-90'
                  }`}
                />
              </button>
              {isExpanded && (
                <div className="mt-0.5 mb-2">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        replace
                        className={`block ml-6 px-2 py-1.5 text-[13px] rounded-md transition-colors ${
                          isActive
                            ? 'text-[#141C24] font-semibold bg-[#F2F4F7]'
                            : 'text-[#637083] hover:text-[#141C24] hover:bg-[#F9FAFB]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredSections.length === 0 && (
          <p className="px-3 py-4 text-[13px] text-[#9CA3AF] text-center">
            No items match "{searchQuery}"
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
