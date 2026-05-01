'use client';

import { useState, useMemo } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import SearchBox from '../../../common/components/SearchBox';
import PatternsGridView, { Pattern } from './PatternsGridView';

const MOCK_PATTERNS: Pattern[] = [
  {
    id: '1',
    trend: [30, 38, 35, 42, 45, 41, 45],
    title: 'High churn rate among new B2B clients',
    labels: [{ text: 'High ARR impact', variant: 'blue' }],
    description: 'New B2B clients often leave within the first three months due to unmet expectations.',
    openSignals: 45,
    impactedCustomers: 45,
    createdBy: 'System',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2025-12-02',
  },
  {
    id: '2',
    trend: [50, 46, 42, 40, 30, 28, 28],
    title: 'Delayed onboarding process',
    labels: [{ text: 'Most customers affected', variant: 'yellow' }],
    description: 'The initial setup takes too long, frustrating new users and delaying their time to value.',
    openSignals: 28,
    impactedCustomers: 28,
    createdBy: 'User',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2026-01-15',
  },
  {
    id: '3',
    trend: [20, 28, 35, 50, 58, 60, 61],
    title: 'Inadequate training resources',
    labels: [],
    description: 'Clients report feeling unprepared due to a lack of comprehensive training materials.',
    openSignals: 61,
    impactedCustomers: 61,
    createdBy: 'System',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2025-11-22',
  },
  {
    id: '4',
    trend: [40, 50, 60, 68, 72, 73, 74],
    title: 'Poor communication during initial setup',
    labels: [],
    description: 'Inconsistent updates and unclear instructions lead to confusion and dissatisfaction.',
    openSignals: 74,
    impactedCustomers: 74,
    createdBy: 'User',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2026-02-01',
  },
  {
    id: '5',
    trend: [60, 58, 55, 54, 53, 53, 53],
    title: 'Lack of personalized support',
    labels: [{ text: 'Signals reducing', variant: 'green' }],
    description: 'Clients express a need for more tailored assistance to address their specific business needs.',
    openSignals: 53,
    impactedCustomers: 53,
    createdBy: 'System',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2025-12-28',
  },
  {
    id: '6',
    trend: [25, 22, 20, 20, 19, 19, 19],
    title: 'Software integration difficulties',
    labels: [],
    description: 'Incompatibilities with existing systems cause significant disruptions and require extensive support.',
    openSignals: 19,
    impactedCustomers: 19,
    createdBy: 'User',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2026-01-08',
  },
  {
    id: '7',
    trend: [50, 60, 70, 80, 85, 87, 88],
    title: 'Unclear expectations for product usage',
    labels: [],
    description: 'Clients struggle to see the full benefits of the product, leading to underutilization and dissatisfaction.',
    openSignals: 88,
    impactedCustomers: 88,
    createdBy: 'System',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2025-11-18',
  },
  {
    id: '8',
    trend: [20, 16, 14, 12, 12, 12, 12],
    title: 'Insufficient follow-up post-implementation',
    labels: [],
    description: 'Lack of proactive engagement after launch results in unresolved issues and decreased satisfaction.',
    openSignals: 12,
    impactedCustomers: 12,
    createdBy: 'User',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2026-02-02',
  },
  {
    id: '9',
    trend: [20, 25, 30, 34, 36, 37, 37],
    title: 'Difficulty in understanding product value',
    labels: [],
    description: 'Clients fail to grasp how the product solves their problems, leading to low adoption rates.',
    openSignals: 37,
    impactedCustomers: 37,
    createdBy: 'System',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2025-12-01',
  },
  {
    id: '10',
    trend: [30, 35, 40, 44, 45, 46, 46],
    title: 'Technical glitches during critical operations',
    labels: [],
    description: 'Unexpected errors during crucial tasks cause frustration and erode trust in the product.',
    openSignals: 46,
    impactedCustomers: 46,
    createdBy: 'User',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2026-01-02',
  },
  {
    id: '11',
    trend: [50, 60, 72, 82, 88, 90, 91],
    title: 'Complex pricing structure confusion',
    labels: [],
    description: 'The intricate pricing model confuses clients, leading to billing disputes and dissatisfaction.',
    openSignals: 91,
    impactedCustomers: 91,
    createdBy: 'System',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2025-11-27',
  },
  {
    id: '12',
    trend: [30, 28, 25, 24, 23, 23, 23],
    title: 'Limited access to advanced features',
    labels: [],
    description: 'Restricted access to key functionalities limits the product\'s usefulness and hinders client success.',
    openSignals: 23,
    impactedCustomers: 23,
    createdBy: 'User',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2026-02-12',
  },
  {
    id: '13',
    trend: [30, 38, 48, 56, 63, 66, 67],
    title: 'Data migration challenges',
    labels: [],
    description: 'Moving data from legacy systems is complex and error-prone, causing delays and data loss.',
    openSignals: 67,
    impactedCustomers: 67,
    createdBy: 'System',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2025-12-15',
  },
  {
    id: '14',
    trend: [20, 16, 15, 15, 15, 15, 15],
    title: 'Scalability issues with growing usage',
    labels: [],
    description: 'The product struggles to handle increased usage, resulting in performance slowdowns and service interruptions.',
    openSignals: 15,
    impactedCustomers: 15,
    createdBy: 'User',
    assignedTo: ['Aryan', 'Sanjay', 'Lakshmi', 'Priya', 'Rahul', 'Nita', 'Dev'],
    createdOn: '2026-01-22',
  },
];

export default function PatternsPage() {
  const [searchText, setSearchText] = useState('');

  const filtered = useMemo(() => {
    if (!searchText.trim()) return MOCK_PATTERNS;
    const q = searchText.toLowerCase();
    return MOCK_PATTERNS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [searchText]);

  const handleReset = () => setSearchText('');

  return (
    <div className="flex flex-col h-[calc(100vh-54px)] bg-white">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col flex-1 min-h-0">
        {/* Sub-header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-[#CED2DA]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center h-[32px] px-3 rounded-[6px] bg-[#F9FAFB] text-[13px] font-semibold text-[#202B37]">
              {filtered.length} Patterns
            </span>
            <div className="w-[250px] h-[32px]">
              <SearchBox
                searchText={searchText}
                setSearchText={setSearchText}
                dataType="Search by title or account"
                needBorder
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-3 h-[32px] rounded-[6px] border border-[#CED2DA] text-[13px] font-medium text-[#414E62] hover:bg-[#F2F4F7] transition-colors"
            >
              <SlidersHorizontal className="w-[14px] h-[14px]" />
              Filter
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 h-[32px] rounded-[6px] border border-[#CED2DA] text-[13px] font-medium text-[#414E62] hover:bg-[#F2F4F7] transition-colors"
            >
              <RotateCcw className="w-[14px] h-[14px]" />
              Reset
            </button>
          </div>
        </div>

        {/* Table — scrolls horizontally when content exceeds 1200px */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <PatternsGridView data={filtered} />
        </div>
      </div>
    </div>
  );
}
