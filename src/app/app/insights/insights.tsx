import { Dropdown } from '../../../common/Dropdown';
import {
  CircleFilledCheckIcon,
  CircleXIcon,
  FilterButton,
} from '../../assests/icons/icons';
import TimeSeriesInsightCard from './timeSeriesInsightCard';
import { useEffect, useMemo, useState } from 'react';
import TaskInsightCard from './taskInsightCard';
import { MultiValue } from 'react-select';
import UnstructuredInsightCrad from './unstructuredInsightCard';
import { ChevronDown } from 'lucide-react';
import { useMixpanel } from '../../../common/mixpanel/useMixpanel';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CreateOpportunityModal from './opportunities/components/createOpportunityModal';
import { getOpportunityStatusConfig } from '../../api/insights/insights';

interface Option {
  value: string;
  id: string;
  label: string;
  selected: boolean;
  groupStatus?: string | null;
}

interface InsightProps {
  insights: any[];
  handleCardSelection: (id: string) => void;
  selectedInsightCardId: string;
  setSelectedCompanies: any;
  selectedCompanies: any;
  setSelectedSegments: any;
  selectedSegments: any;
  setSelectedPillars: any;
  selectedPillars: any;
  setSelectedStatuses: any;
  selectedStatuses: any;
  setInsightType: any;
  insightType: string;
  ignoredMessages: any;
  setIgnoredMessages: any;
  urlSelectedId: string;
  setSelectedActionStatus: (status: string) => void;
}

export default function Insights({
  insights,
  handleCardSelection,
  selectedInsightCardId,
  setSelectedCompanies,
  selectedCompanies,
  setSelectedSegments,
  selectedSegments,
  setSelectedPillars,
  selectedPillars,
  setSelectedStatuses,
  selectedStatuses,
  setInsightType,
  insightType,
  ignoredMessages,
  setIgnoredMessages,
  urlSelectedId,
  setSelectedActionStatus,
}: InsightProps) {
  const { trackEvent, MIXPANEL_EVENTS } = useMixpanel();

  // Track filter changes
  const handleFilterChange = (filterType: string, value: any) => {
    trackEvent(MIXPANEL_EVENTS.INSIGHT_FILTER_CHANGED, {
      filter_type: filterType,
      filter_value: value,
      previous_value:
        filterType === 'companies'
          ? selectedCompanies
          : filterType === 'segments'
          ? selectedSegments
          : filterType === 'pillars'
          ? selectedPillars
          : filterType === 'statuses'
          ? selectedStatuses
          : filterType === 'insight_type'
          ? insightType
          : null,
    });

    // Call the original setters
    switch (filterType) {
      case 'companies':
        setSelectedCompanies(value);
        break;
      case 'segments':
        setSelectedSegments(value);
        break;
      case 'pillars':
        setSelectedPillars(value);
        break;
      case 'statuses':
        setSelectedStatuses(value);
        break;
      case 'insight_type':
        setInsightType(value);
        break;
    }
  };
  const queryClient = useQueryClient();
  const [showFilters, setShowFilters] = useState(false);
  const [firstRender, setFirstRender] = useState(true);
  const [createOpportunityModal, setCreateOpportunityModal] = useState(false);
  const [hasInitializedStatuses, setHasInitializedStatuses] = useState(false);
  // const url = new URL(window.location.href);
  // const urlSelectedId = url.searchParams.get('selected');

  const { data: opportunityStatusesFromConfig } = useQuery({
    queryKey: ['getOpportunityStatusConfig'],
    queryFn: () => getOpportunityStatusConfig(),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (insights.length === 0) return;
    // if (!firstRender) {
    //   return;
    // }
    if (Array.isArray(selectedCompanies) && selectedCompanies?.length === 0) {
      const companies: Option[] = [
        ...new Map(
          insights.map((item: any) => [item.customer_name, item.customer_id])
        ).entries(),
      ]
        .map(([name, id]) => ({
          value: name,
          label: name,
          selected: false,
          id: id,
        }))
        .sort((a: any, b: any) => {
          return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
        });
      setSelectedCompanies(companies);
    }
    if (Array.isArray(selectedSegments) && selectedSegments?.length === 0) {
      const segments: Option[] = [
        ...new Map(
          insights.map((item: any) => [
            item?.segment?.segment_name,
            item?.segment?.customer_segment_id,
          ])
        ).entries(),
      ]
        .map(([name, id]) => ({
          value: name,
          label: name,
          selected: false,
          id: id,
        }))
        .sort((a: any, b: any) => {
          return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
        });
      setSelectedSegments(segments);
    }
    if (Array.isArray(selectedPillars) && selectedPillars?.length === 0) {
      const pillar: Option[] = [
        ...new Map(
          insights.map((item: any) => [item.pillar, item.pillar])
        ).entries(),
      ]
        .map(([name, pillar]) => ({
          value: name,
          label: name,
          selected: false,
          id: pillar,
        }))
        .sort((a: any, b: any) => {
          return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
        });
      setSelectedPillars(pillar);
    }
    interface OpportunityStatusConfig {
      _id: string;
      key: string;
      value: {
        [groupStatus: string]: string[];
      };
      org_id: string;
    }

    interface StatusItem {
      value: string;
      label: string;
      selected: boolean;
      id: string;
      group_status: string | null;
    }

    // Transform function to convert API response to desired array format
    const transformStatusConfig = (
      opportunityStatusesFromConfig?: any
    ): StatusItem[] => {
      // Hard-coded statuses that should always be included
      const hardcodedStatuses: StatusItem[] = [
        {
          value: 'completed',
          label: 'Completed',
          selected: false,
          id: 'completed',
          group_status: 'Closed',
        },
        {
          value: 'ignored',
          label: 'Ignored',
          selected: false,
          id: 'ignored',
          group_status: 'Ignored',
        },
        {
          value: 'active',
          label: 'Active',
          selected: true,
          id: 'active',
          group_status: 'Active',
        },
      ];

      // Return hardcoded statuses if no config data
      // Fixed: Remove the extra 'data' property access
      if (!opportunityStatusesFromConfig?.value) {
        return hardcodedStatuses;
      }

      // Fixed: Remove the extra 'data' property access
      const configValue = opportunityStatusesFromConfig?.value;
      const transformedStatuses: StatusItem[] = [];

      // Process each group status (New, Active, Closed)
      (Object.entries(configValue) as [string, string[]][]).forEach(
        ([groupStatus, subStatuses]) => {

          // Process each sub-status within the group
          subStatuses.forEach((subStatus: string) => {
            // Skip if this is the 'active' status under 'Active' group since we have it hardcoded
            if (groupStatus === 'Active' && subStatus.toLowerCase() === 'active') {
              return;
            }
            
            transformedStatuses.push({
              value: subStatus.toLowerCase(),
              label: subStatus,
              selected: groupStatus === 'New' || groupStatus === 'Active',
              id: subStatus.toLowerCase(),
              group_status: groupStatus,
            });
          });
        }
      );
      // Combine transformed statuses with hardcoded ones
      // hardcodedStatuses already contains the 'Active' status
      return [...hardcodedStatuses, ...transformedStatuses];
    };
    const statuses: StatusItem[] = transformStatusConfig(
      opportunityStatusesFromConfig?.data
    );

    if (statuses.length > 3 && selectedStatuses.length === 0 && !urlSelectedId) {
    setSelectedStatuses(statuses);
    setHasInitializedStatuses(true); // prevent future auto-overwrites
  }
    // if (firstRender) {
    //   setSelectedStatuses(statuses);
    // }
    // setFirstRender(false);
  }, [insights,
  opportunityStatusesFromConfig?.data, // 🔁 make sure it triggers when config is available
  selectedInsightCardId,
  urlSelectedId,
  selectedStatuses.length,
  hasInitializedStatuses]);

  useEffect(() => {
    if (insights.length > 0) {
      if (urlSelectedId && urlSelectedId !== 'null' && urlSelectedId !== '') {
        // url.searchParams.delete('selected');
        handleCardSelection(urlSelectedId);
        // window.history.replaceState({}, '', url.toString());
        // // bring the selected insight to view
        // setTimeout(() => {
        //   const insightCard = document.getElementById(
        //     `insight-card-${urlSelectedId}`
        //   );
        //   if (insightCard) {
        //     const insightsContainer =
        //       document.getElementById('insights-container');
        //     insightsContainer?.scrollTo({
        //       top: insightCard.offsetTop - insightsContainer.offsetTop,
        //       behavior: 'smooth',
        //     });
        //   }
        // }, 3000);
        return;
      } else if (
        (urlSelectedId === 'null' || !urlSelectedId || urlSelectedId === '') &&
        !selectedInsightCardId
      ) {
        {
          handleCardSelection(insights[0]?._id);
        }
      }

      if (selectedInsightCardId) {
        if (
          !insights.find((insight) => insight._id === selectedInsightCardId)
        ) {
          // Automatically select first insight only if selectedInsightCardId
          //is not present in the list
          handleCardSelection(insights[0]._id);
        }
      }
    }
  }, [insights, selectedInsightCardId, urlSelectedId]);

  const handleCheckboxChange =
    (setter: React.Dispatch<React.SetStateAction<MultiValue<Option>>>) =>
    (id: string) => {
      setter((prevState) =>
        prevState.map((item) =>
          item.id === id ? { ...item, selected: !item.selected } : item
        )
      );
    };

  const renderDropdown = (
    label: string,
    options: MultiValue<Option>,
    handleChange: (id: string) => void,
    count?: number | string
  ) => {
    // Filter options to show only first 4 statuses if label is 'Status'
    const filteredOptions = label === 'Status' 
      ? options.filter((item: any) => 
          ['completed', 'ignored', 'active', 'new'].includes(item.value.toLowerCase())
        )
      : options;

    return (
    <Dropdown className="inline-flex !w-full ">
      <Dropdown.Trigger
        type="button"
        className="text-center w-full bg-white text-gray-900 border-[#637083] border-[1px] !h-[32px] rounded-[6px] "
        id="dropdownMenuButton"
        data-bs-toggle="dropdown"
      >
        <div className="flex justify-between items-center text-[12px] font-medium px-[12px] text-[#141C24]">
          <div>
            <div className="flex gap-[5px]">
              {label}
              {count && (
                <span
                  className={`flex flex-row text-white text-xs justify-center items-center bg-blue-500 rounded-[135px] py-[1.8px] w-[18.6px] h-[18.6px]`}
                >
                  {count}
                </span>
              )}
            </div>
          </div>

          <ChevronDown className="relative left-[6px] !text-[#141C24]  " />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content
        placement="bottom-start"
        className={
          label === 'Segments'
            ? 'absolute border border-gray-300  z-50 p-4 ltr:text-left rtl:text-right bg-white rounded-md shadow-md top-[67px] dropdown-menu w-[13rem] dark:bg-zink-600 max-h-[500px] overflow-y-auto scroll'
            : label === 'Status'
            ? 'absolute border border-gray-300 z-50 p-4 ltr:text-left rtl:text-right bg-white rounded-md shadow-md top-[110px]  dropdown-menu w-[13rem] dark:bg-zink-600 max-h-[400px] overflow-y-auto scroll'
            : label === 'Pillars'
            ? 'absolute border border-gray-300 z-50 p-4 ltr:text-left rtl:text-right bg-white rounded-md shadow-md top-[110px] dropdown-menu w-[13rem] dark:bg-zink-600'
            : 'absolute border border-gray-300 z-50 p-4 ltr:text-left rtl:text-right bg-white rounded-md shadow-md top-[67px] dropdown-menu w-[13rem] dark:bg-zink-600 max-h-[500px] overflow-y-auto scroll'
        }
        aria-labelledby="dropdownMenuButton"
      >
        <ul
          className="text-sm text-gray-700 dark:text-gray-200 dropdownClick"
          aria-labelledby="dropdownMenuIconButton"
        >
          {filteredOptions.map((item, i) => (
            <li key={i}>
              <div className="flex ps-2 py-1 rounded dark:hover:bg-gray-600">
                <input
                  type="checkbox"
                  id={`checkbox-item-${i}`}
                  checked={item.selected}
                  onChange={() => handleChange(item.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 mt-[3px] border-gray-300 rounded dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 dark:bg-gray-600 dark:border-gray-500"
                />
                <label
                  htmlFor={`checkbox-item-${i}`}
                  className="w-full ms-2 text-[16px] font-medium text-gray-700 text-nowrap truncate"
                >
                  {item.label}
                </label>
              </div>
            </li>
          ))}
        </ul>
      </Dropdown.Content>
    </Dropdown>
  );};

  return (
    <div className=" pb-4 pt-[24px]">
      <div className="flex justify-between pb-[8px] pr-2">
        <div className="flex gap-3">
          {['Risk'].map((type: string) => (
            <span
              key={type}
              onClick={() => handleFilterChange('insight_type', type)}
              className={`flex items-center cursor-pointer px-2.5 py-0.5 text-xs font-medium rounded-md border ${
                insightType === type
                  ? ' border-[#637083]  font-medium text-gray-900 dark:bg-zink-700 dark:border-zink-400 dark:text-zink-200'
                  : ' font-medium border-gray-300 text-gray-500 dark:bg-zink-700 dark:border-zink-400 dark:text-zink-200'
              }`}
            >
              {type === 'Opportunity'
                ? 'Opportunities'
                : type === 'Risk'
                ? 'Risks'
                : 'All'}
            </span>
          ))}
        </div>
        <div className="">
          <button
            onClick={() => setShowFilters(!showFilters)}
            type="button"
            className={`${
              showFilters
                ? ' border-[#637083] font-medium text-gray-900 !px-[11px] !py-[7px] btn dark:hover:bg-slate-500 dark:ring-slate-400/20 dark:focus:bg-slate-500'
                : ' border-gray-300 text-gray-500 !px-[11px] !py-[7px] btn dark:hover:bg-slate-500 dark:ring-slate-400/20 dark:focus:bg-slate-500'
            } ${
              urlSelectedId && urlSelectedId !== 'null' && urlSelectedId !== ''
                ? 'disabled cursor-not-allowed opacity-50'
                : ''
            }`}
            disabled={
              urlSelectedId && urlSelectedId !== 'null' && urlSelectedId !== ''
                ? true
                : false
            }
          >
            <span>
              <FilterButton className="text-slate-500" />
            </span>
          </button>
        </div>
      </div>
      {showFilters && (
        <div className="grid grid-cols-1 gap-[11px] md:grid-cols-1 pt-[12px] pb-[20px] lg:grid-cols-2 pr-2">
          <div className="md:col-span-1 lg:col-span-1">
            {renderDropdown(
              'Customers',
              selectedCompanies,
              (id) =>
                handleFilterChange(
                  'companies',
                  selectedCompanies.map((item: any) =>
                    item.id === id
                      ? { ...item, selected: !item.selected }
                      : item
                  )
                ),
              selectedCompanies?.filter((item: any) => item?.selected)?.length >
                0
                ? selectedCompanies?.filter((item: any) => item?.selected)
                    ?.length
                : null
            )}
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            {renderDropdown(
              'Segments',
              selectedSegments,
              (id) =>
                handleFilterChange(
                  'segments',
                  selectedSegments.map((item: any) =>
                    item.id === id
                      ? { ...item, selected: !item.selected }
                      : item
                  )
                ),
              selectedSegments?.filter((item: any) => item?.selected)?.length >
                0
                ? selectedSegments?.filter((item: any) => item?.selected)
                    ?.length
                : null
            )}
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            {renderDropdown(
              'Pillars',
              selectedPillars,
              (id) =>
                handleFilterChange(
                  'pillars',
                  selectedPillars.map((item: any) =>
                    item.id === id
                      ? { ...item, selected: !item.selected }
                      : item
                  )
                ),
              selectedPillars?.filter((item: any) => item?.selected)?.length > 0
                ? selectedPillars?.filter((item: any) => item?.selected)?.length
                : null
            )}
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            {renderDropdown(
              'Status',
              selectedStatuses,
              (id) =>
                handleFilterChange(
                  'statuses',
                  selectedStatuses.map((item: any) =>
                    item.id === id
                      ? { ...item, selected: !item.selected }
                      : item
                  )
                ),
              selectedStatuses?.filter((item: any) => 
                item?.selected && 
                ['completed', 'ignored', 'active', 'new'].includes(item.value.toLowerCase())
              )?.length > 0
                ? selectedStatuses?.filter((item: any) => 
                    item?.selected && 
                    ['completed', 'ignored', 'active', 'new'].includes(item.value.toLowerCase())
                  )?.length
                : null
            )}
          </div>
        </div>
      )}
      {ignoredMessages.message && (
        <div
          className={
            ignoredMessages.action_status.toLowerCase() === 'ignored'
              ? 'bg-[#FEE7E7] rounded-[8px] p-[16px] min-h-[82px] gap-[8px] flex-col flex mb-[8px] mr-2'
              : 'bg-[#ECF9F2] rounded-[8px] p-[16px] min-h-[82px] gap-[8px] flex-col flex mb-[8px] mr-2'
          }
        >
          <div className="flex justify-between items-center gap-[8px]">
            <span>
              { ignoredMessages.action_status.toLowerCase() === 'ignored' ? (
                <CircleXIcon className=" h-[20px] w-[20px]" />
              ) : (
                <CircleFilledCheckIcon className=" h-[20px] w-[20px]" />
              )}
            </span>
            <span className="text-[14px] text-[#141C24] text-start w-full">
              {ignoredMessages.customerName}
            </span>
            <span
              className="bg-white rounded-[4px] px-[8px] py-[4px] text-[14px] text-[#202B37] font-medium  cursor-pointer"
              onClick={() => {setIgnoredMessages({});
            setSelectedActionStatus('');}
            }
            >
              Undo
            </span>
          </div>
          <div className="text-[12px] text-[#141C24] pl-[29px]">
            {ignoredMessages?.message}
          </div>
        </div>
      )}

      {insightType === 'Opportunity' && (
        <span
          className="pt-[2px] text-[14px] text-[#3B82F6] cursor-pointer"
          onClick={() => setCreateOpportunityModal(true)}
        >
          <span className="text-[18px]">+</span> &nbsp;Create new
        </span>
      )}

      {insights.length > 0 ? (
        <div
          className={`pt-[8px] ${insightType === 'Opportunity'?'pb-[32px]':''} ${
            showFilters
              ? 'max-h-[calc(100vh-14rem)]'
              : 'max-h-[calc(100vh-8.05rem)]'
          }  mb-[12px] overflow-y-auto scroll pr-2`}
          id="insights-container"
        >
          {insights.map((insight) =>
            insight.insight_data_type === 'data' ? (
              <div
                key={insight._id}
                className="py-[8px] pr-0.5 border-b border-gray-100"
                id={`insight-card-${insight._id}`}
              >
                <TimeSeriesInsightCard
                  insight={insight}
                  selectedInsightCardId={selectedInsightCardId}
                  handleCardSelection={handleCardSelection}
                />
              </div>
            ) : insight.insight_data_type === 'task' ? (
              <div
                key={insight._id}
                className="py-[8px] pr-0.5 border-b border-gray-100"
                id={`insight-card-${insight._id}`}
              >
                <TaskInsightCard
                  insight={insight}
                  selectedInsightCardId={selectedInsightCardId}
                  handleCardSelection={handleCardSelection}
                />
              </div>
            ) : insight?.insight_data_type === 'llm' ? (
              <div
                className="py-[8px] pr-0.5 border-b border-gray-100"
                id={`insight-card-${insight._id}`}
              >
                <UnstructuredInsightCrad
                  insight={insight}
                  selectedInsightCardId={selectedInsightCardId}
                  handleCardSelection={handleCardSelection}
                />
              </div>
            ) : null
          )}
        </div>
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center py-40 text-gray-800 ${
            showFilters ? '' : 'mt-[95px]'
          }`}
        >
          No insight to show
        </div>
      )}
      {urlSelectedId && urlSelectedId !== 'null' && urlSelectedId !== '' && (
        <div className="w-full">
          <div className="flex justify-center my-[16px]">
            <div
              onClick={() => {
                if (window?.location?.href) {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('selected');
                  window.history.replaceState({}, '', url.toString());
                  queryClient.invalidateQueries({
                    queryKey: ['allInsights'],
                    exact: false,
                  });
                  handleCardSelection('');
                  setSelectedCompanies([]);
                  setSelectedSegments([]);
                  setSelectedPillars([]);
                }
              }}
              className="text-center text-[14px] text-[#3B82F6] hover:no-underline cursor-pointer"
            >
              View all insights
            </div>
          </div>
        </div>
      )}
      {!!createOpportunityModal && (
        <CreateOpportunityModal
          createOpportunityModal={createOpportunityModal}
          setCreateOpportunityModal={setCreateOpportunityModal}
          // customerId={customerDetails?.customer_id}
        />
      )}
    </div>
  );
}
