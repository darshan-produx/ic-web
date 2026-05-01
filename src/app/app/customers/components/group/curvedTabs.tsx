import React, { useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllActiveInsights } from '../../../../../app/api/insights/insights';
import { getAllPriorityTasks } from '../../../../../app/api/tasks/tasks';
import { useOnExpandChartSetting } from '../../../../../services/mutations/customer360ChartMutations';
import CustomerSegmentSelect from '../listAllSegments';
import { getCustomer360PageDetailsTabs } from '../../../../../app/api/customers/customers';
type CurvedTabsProps = {
  activeTab: string;
  setActiveTab: (key: string) => void;
  id: number | string | string[] | undefined;
  renewalDate?: string | null | undefined;
  segmentName?: string;
  signalsCount?: number;
};

export default function CurvedTabs({
  activeTab,
  setActiveTab,
  id,
  renewalDate,
  segmentName,
  signalsCount,
}: CurvedTabsProps) {
  const { data: allActiveInsights } = useQuery({
    queryKey: ['getAllActiveInsights', id],
    queryFn: () => getAllActiveInsights(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { data: allPriorityTasks } = useQuery({
    queryKey: ['getAllPriorityTasks', id],
    queryFn: () => getAllPriorityTasks(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { data: customer360PageDetailsTabs } = useQuery({
    queryKey: ['getCustomer360PageDetailsTabs'],
    queryFn: () => getCustomer360PageDetailsTabs(),
    refetchOnWindowFocus: false,
  });

  const tabCounts = useMemo(() => {
    const insights = allActiveInsights?.data?.data ?? [];
    const riskCount = Array.isArray(insights)
      ? insights.filter((ins: any) => ins?.insight_type === 'Risk').length
      : 0;
    const oppCount = Array.isArray(insights)
      ? insights.filter((ins: any) => ins?.insight_type === 'Opportunity')
        .length
      : 0;
    const tasksCount = allPriorityTasks?.data?.length ?? 0;
    return { riskCount, oppCount, tasksCount };
  }, [allActiveInsights, allPriorityTasks]);

  const tabs = useMemo(() => {

    // Default tab configuration with key mapping
    const defaultTabsConfig = [
      { key: 'view', apiKey: '360_degree_view', name: '360° View', count: null },
      { key: 'open_issues', apiKey: 'open_issues', name: 'Open issues', count: signalsCount || 0 },
      { key: 'opportunities', apiKey: 'opportunities', name: 'Opportunities', count: tabCounts.oppCount },
      { key: 'timeline', apiKey: 'timeline', name: 'Timeline', count: null },
      { key: 'tasks', apiKey: 'tasks', name: 'Tasks', count: tabCounts.tasksCount },
      { key: 'summary_and_notes', apiKey: 'summary_and_notes', name: 'Summary and Notes', count: null },
      { key: 'risk', apiKey: 'risks', name: 'Risks', count: tabCounts.riskCount },
    ];

    if (
      customer360PageDetailsTabs &&
      customer360PageDetailsTabs.data &&
      customer360PageDetailsTabs.data.value
    ) {
      const apiTabsConfig = customer360PageDetailsTabs.data.value;

      // Filter and map tabs based on API response
      const filteredTabs = defaultTabsConfig
        .filter(tab => {
          const apiTab = apiTabsConfig[tab.apiKey];
          return apiTab && apiTab.enabled;
        })
        .map(tab => {
          const apiTab = apiTabsConfig[tab.apiKey];
          return {
            key: tab.key,
            name: apiTab.name || tab.name,
            count: tab.count
          };
        });

      return filteredTabs;
    }

    // Fallback to default configuration
    return defaultTabsConfig.map(tab => ({
      key: tab.key,
      name: tab.name,
      count: tab.count
    }));
  }, [customer360PageDetailsTabs, tabCounts, signalsCount]);

  const { setOnExpandChartSetting } = useOnExpandChartSetting();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function handleSelect(tabKey: string) {
    setActiveTab(tabKey);
    setOnExpandChartSetting('');
  }

  return (
    <div className="mx-auto min-w-[900px] max-w-[1200px] bg-[#F6F7FA] pt-2 flex justify-between">
      <nav aria-label="Customer 360 tabs" className="flex items-center">
        <ul
          role="tablist"
          aria-orientation="horizontal"
          className="flex gap-6 items-end w-full"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <li key={tab.key} role="presentation" className="list-none">
                <button
                  ref={(el: HTMLButtonElement | null) => {
                    tabRefs.current[tab.key] = el;
                  }}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleSelect(tab.key)}
                  className={`flex items-center gap-1 whitespace-nowrap py-[10px] transition-colors duration-150 focus:outline-none
                      ${isActive
                      ? 'text-[#202B37] text-[14px] leading-5 font-semibold border-b-[3px] border-[#97A1AF]'
                      : 'text-[#414E62] font-normal text-[14px] leading-5 border-b-[3px] border-transparent'
                    }
                    `}
                >
                  <span>{tab.name}</span>
                  {tab.count !== null && (
                    <span
                      aria-hidden
                      className={`inline-flex items-center justify-center`}
                    >
                      ({tab.count})
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex items-center text-gray-400 text-[14px] font-normal leading-5">
        {segmentName && (
          <>
            <CustomerSegmentSelect />
            {/* <span>{segmentName}</span> */}
            {renewalDate && <span className="mr-2">|</span>}
          </>
        )}
        {renewalDate && <span>Renewal on {renewalDate}</span>}
      </div>
    </div>
  );
}
