'use client';
import React, { useMemo } from 'react';
import AdoptionMetric from './metrics/adoptionMetric';
import BusinessImpactMetric from './metrics/businessImpactMetric';
import PerformanceAndErrorMetric from './metrics/performanceAndErrorMetric';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PillarStatusBar } from '../components/pillarstatusbar';
import {
  getCustomer360Configs,
  getCustomerDetails,
  getLastestNpsScore,
  getLastestNpsScoreTrends,
  getLastQBRDate,
  getPillarStatus,
  getAllDirectAssignedCustomers,
  getCustomerJourney,
} from '../../../api/customers/customers';
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import dayjs from 'dayjs';
import {
  usecreateLastQBRDate,
  useUpdateCustomerStarred,
  useUpdateCustomerChurn,
  useUpdateEventInEventJourney,
} from '../../../../services/mutations/customersMutations';
import { toast } from 'react-toastify';
import {
  getAllCustomerTickets,
  getCustomerComercials,
} from '../../../api/tasks/tasks';
import StakeHolder from './stakeholders/stakeholder';
import { getAllStakeholders } from '../../../api/customer-360/stakeholdersApi/customer360-stakeholder';
import { EllipsisVertical } from 'lucide-react';
import NoOfTicktes from '../components/noOfTickets';
import AnnualCommercialValues from '../components/annualCommercialValues';
import CustomerDetailForm from '../components/customerDetailForm';
import AddStakeholderModal from './stakeholders/addStakeholderModal';
import Loading from '../../../../common/components/loading';
import ExpandChartModal from './metrics/expandChartModal';
import {
  useOnExpandChartFrequency,
  useOnExpandChartModalArray,
  useOnExpandChartModalOpenState,
} from '../../../../services/mutations/customer360ChartMutations';
import { useGraphDataQuery } from '../../../../services/queries/graphChartQuery';
import { getCustomerDetailSynthesis } from '../../../api/customers/customers';
import Synthesis from './metrics/synthesis';
import Playbook from '../components/playbook';
import { getCustomerProjectPlan } from '../../../api/customer-360/customerProjects/customerProjects';
import ConfirmationModalForEmail from '../../../../common/components/Modal/confirmationModalForEmail';
import CurvedTabs from '../components/group/curvedTabs';
import Tasks360 from '../components/group/tasks360';
import Risk360 from '../components/group/risk360';
import Opportunity360 from '../components/group/opportunity360';
import ExecutiveSummary from '../components/group/executiveSummary';
import { getCustomersFullOverviewData } from '../../../api/customers-overview/customers-overview';
import CustomerDropdown from '../../../customerdropdown/customerDropdown';
import {
  getAllKPISettings,
  getNumberFormatSetting,
} from '../../../api/globalconfig/globalconfig';
import {
  CustomerChurnSvgIcon,
  CustomerStarredFillIcon,
  CustomerStarredUnFilledIcon,
  ReactivateSvgIcon,
} from '../../../assests/icons/icons';
import Tippy from '@tippyjs/react';
import CustomerAttributesPanel from '../components/customerAttriibutesForm';
import CustomerChurnModal from '../components/customerChurnModal';
import { DEFAULT_CUSTOMER360_CONFIG } from '../../../utils/constant';
import { Journey } from './journey/journey';
import Signals from './signals/signalsTab';
import DeleteModal from '../../../../common/components/DeleteModal';
import SignalDetails from './journey/signalDetails';
import CustomerGridView from '../components/CustomerGridView';
import { apiRequest } from '../../../../common/api-request';
import { getOrganizationUsers } from '../../../api/users/users';
import { useFilterPersistence } from './filters/useFilterPersistence';
import { getOfferings } from '../../../api/offerings/offerings';

interface EditorProps {
  initialValue: string;
  onSave: (val: string) => Promise<void> | void;
  onCancel?: () => void;
}
interface ConfigValues {
  enabled: boolean;
  display_name: string;
  order: number;
}

const Page: React.FC = (props: any) => {
  const { id } = useParams();
  const [addStakeholderForm, setAddStakeholderForm] = useState(false);
  const [QBRDate, setQBRDate] = useState('');
  const createLastQBRDate = usecreateLastQBRDate();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [projectStatus, setProjectStatus] = useState('In-progress');
  const [
    customerReactivateConfirmationModal,
    setCustomerReactivateConfirmationModal,
  ] = useState(false);
  const [isGroup_customer, setIsGroup_customer] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>();
  const updateCustomerStarred = useUpdateCustomerStarred();
  const updateCustomerChurn = useUpdateCustomerChurn();
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [overAllStatus, setOverAllStatus] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [segmentName, setSegmentName] = useState('');

  const [isTargetThresholdEditEnabled, setIsTargetThresholdEditEnabled] =
    useState(false);
  const [allowStatusInsightsToggle, setAllowStatusInsightsToggle] =
    useState(false);
  const [customerChurnModal, setCustomerChurnModal] = useState(false);
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project_id') || '';
  const [isSignalDrawerOpen, setIsSignalDrawerOpen] = useState(false);
  const [selectedSignalId, setSelectedSignalId] = useState<string>('');
  const [signalDeleteModal, setSignalDeleteModal] = useState(false);
  const [formatKey, setFormatKey] = useState('GLOBAL');

  const { data: allDirectAssignedCustomers } = useQuery({
    queryKey: ['getAllDirectAssignedCustomers'],
    queryFn: getAllDirectAssignedCustomers,
    refetchOnWindowFocus: false,
  });
  const { data: customersOverviewData } = useQuery({
    queryKey: ['customers-full-overview-data', id],
    queryFn: () => getCustomersFullOverviewData(Number(id)),
    refetchOnWindowFocus: false,
    enabled: isGroup_customer === true,
  });

  // const { data: allAssignedCustomerDetails } = useQuery({
  //   queryKey: ['getAllAssignedcustomerdetails', id],
  //   queryFn: () => getAllAssignedcustomerdetails(),
  //   refetchOnWindowFocus: false,
  // });
  const { data: getLastQBRDateData } = useQuery({
    queryKey: ['getLastQBRDate'],
    queryFn: () => getLastQBRDate(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { data: lastestNpsScore } = useQuery({
    queryKey: ['lastestNpsScore'],
    queryFn: () => getLastestNpsScore(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { data: lastestNpsScoreTrend } = useQuery({
    queryKey: ['getLastestNpsScoreTrends'],
    queryFn: () => getLastestNpsScoreTrends(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { data: AllStakeholders } = useQuery({
    queryKey: ['stakeholders'],
    queryFn: () => getAllStakeholders(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { data: pillarStatus } = useQuery({
    queryKey: ['getPillarStatus'],
    queryFn: () => getPillarStatus(Number(id)),
    refetchOnWindowFocus: false,
  });

  // const { data: allActiveInsights } = useQuery({
  //   queryKey: ['getAllActiveInsights'],
  //   queryFn: () => getAllActiveInsights(Number(id)),
  // });

  // const { data: allPriorityTasks } = useQuery({
  //   queryKey: ['getAllPriorityTasks'],
  //   queryFn: () => getAllPriorityTasks(Number(id)),
  // });

  const { data: customerCommercialsDetails } = useQuery({
    queryKey: ['getCustomerComercials'],
    queryFn: () => getCustomerComercials(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { data: customerTickets } = useQuery({
    queryKey: ['getAllCustomerTickets'],
    queryFn: () => getAllCustomerTickets(Number(id)),
    refetchOnWindowFocus: false,
  });

  // const { data: customerOnboardingPlan } = useQuery({
  //   queryKey: ['customerOnboardingPlan'],
  //   queryFn: () => getCustomerOnboardingPlan(Number(id)),
  //   refetchOnWindowFocus: false,
  // });

  const { data: customerDetailSynthesis } = useQuery({
    queryKey: ['customerDetailSynthesis', id],
    queryFn: () => getCustomerDetailSynthesis(Number(id)),
    refetchOnWindowFocus: false,
  });

  const { data: customer360Config } = useQuery({
    queryKey: ['customer360Config'],
    queryFn: () => getCustomer360Configs(),
    refetchOnWindowFocus: false,
  });

  const { data: customerProjectPlanData } = useQuery({
    queryKey: ['customerProjectPlan', id, projectStatus],
    queryFn: () => getCustomerProjectPlan(Number(id), projectStatus),
    refetchOnWindowFocus: false,
  });

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
  });

  // ── User hierarchy for filter lists ─────────────────────────────
  const { data: organizationUsers } = useQuery({
    queryKey: ['organizationUsers'],
    queryFn: getOrganizationUsers,
    refetchOnWindowFocus: false,
  });

  const usersList = useMemo(() => {
    if (
      organizationUsers?.data?.data &&
      Array.isArray(organizationUsers.data.data) &&
      organizationUsers.data.data.length > 0
    ) {
      return organizationUsers.data.data;
    } else {
      return [];
    }
  }, [organizationUsers]);

  const { data: offeringsData } = useQuery({
    queryKey: ['offerings'],
    queryFn: getOfferings,
    refetchOnWindowFocus: false,
  });

  const offeringsList = useMemo(() => {
    return Array.isArray(offeringsData) ? offeringsData : [];
  }, [offeringsData]);

  // ── Open Issues filter persistence hook ─────────────────────────
  const openIssuesFilters = useFilterPersistence({
    context: 'open_issues',
    customerId: Number(id),
    usersList: usersList,
    stakeholdersList: AllStakeholders?.data?.data ?? [],
    offeringsList,
  });

  const {
    data: signalsData,
    isLoading: signalsLoading,
    isError: signalsError,
  } = useQuery({
    queryKey: ['signals', id, JSON.stringify(openIssuesFilters.applied)],
    queryFn: () =>
      getCustomerJourney(
        openIssuesFilters.getApiParams({ customer_id: Number(id) })
      ),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  // inside component
  const customer360ConfigValue: Record<string, ConfigValues> = useMemo(() => {
    return customer360Config?.data?.value ?? DEFAULT_CUSTOMER360_CONFIG;
  }, [customer360Config?.data?.value]);

  const orderedConfigEntries = useMemo(() => {
    if (!customer360ConfigValue) return [];
    return Object.entries(customer360ConfigValue)
      .filter(([key, value]) => key !== 'PurchasesAndRenewals')
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => (a.value.order ?? 0) - (b.value.order ?? 0));
  }, [customer360ConfigValue]);
  const {
    data: customer,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['customer-details', id],
    queryFn: () => getCustomerDetails(Number(id)),
    refetchOnWindowFocus: false,
  });

  // Move mutation hook before early return
  const updateSignalMutation = useUpdateEventInEventJourney();

  // const {
  //   data: onboardingStatus,
  //   isLoading,
  //   isFetching,
  // } = useQuery({
  //   queryKey: ['customerOnboardingStatus', id],
  //   queryFn: () => getCustomerOnboardingStatus(Number(id)),
  //   refetchOnWindowFocus: false,
  // });

  const [lastScrollYRef, sectionsRef, textRef] = [
    useRef(0),
    useRef<HTMLDivElement | null>(null),
    useRef<any>(null),
  ];
  // const uniqueCustomersOverviewData = useMemo(() => {
  //   const seen = new Set();
  //   return (
  //     customersOverviewData?.data?.data?.filter((item:any) => {
  //       if (seen.has(item.customer_id)) return false;
  //       seen.add(item.customer_id);
  //       return true;
  //     }) || []
  //   );
  // }, [customersOverviewData]);

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId);
      setActiveTab('view');
    }
  }, [projectId]);
  useEffect(() => {
    if (customer?.data[0]?.onboarding_done && customer?.data?.length > 0) {
      setShowOnboarding(false);
    }
    setIsGroup_customer(customer?.data[0]?.is_group);
    setIsStarred(customer?.data[0]?.is_starred);
    setSegmentName(customer?.data[0]?.segment?.segment_name);
  }, [customer]);

  useEffect(() => {
    // if (allAssignedCustomers && allAssignedCustomers?.data?.length > 0) {
    //   const customer = allAssignedCustomers?.data?.filter(
    //     (ele: any) => ele?.customer_id === Number(id)
    //   );

    // }
    if (getLastQBRDateData && getLastQBRDateData?.data?.data?.length > 0) {
      const qbrDate = getLastQBRDateData?.data?.data[0]?.date;
      setQBRDate(qbrDate);
    } else if (
      getLastQBRDateData &&
      getLastQBRDateData?.data?.data?.length == 0
    ) {
      setQBRDate('');
    }
  }, [getLastQBRDateData]);

  const { data: allGlobalKPISettings } = useQuery({
    queryKey: ['getAllKPISettings'],
    queryFn: getAllKPISettings,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (allGlobalKPISettings?.data) {
      allGlobalKPISettings?.data.forEach((setting: any) => {
        if (setting.key === 'target_threshold_edit_enabled') {
          setIsTargetThresholdEditEnabled(setting.value);
        }
        if (setting.key === 'status_insight_toggle_enabled') {
          setAllowStatusInsightsToggle(setting.value);
        }
      });
    }
  }, [allGlobalKPISettings]);

  const { data: numberFormatSetting } = useQuery({
    queryKey: ['getNumberFormatSetting'],
    queryFn: getNumberFormatSetting,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (numberFormatSetting?.data) {
      const data = numberFormatSetting?.data;
      if (data.key === 'numerical_format') {
        setFormatKey(data.value);
      }
    }
  }, [numberFormatSetting]);

  const { onExpandChartModalOpen, setOnExpandChartModalOpen } =
    useOnExpandChartModalOpenState();
  const { setOnExpandChartModalArray } = useOnExpandChartModalArray();
  const { onExpandChartFrequency, setOnExpandChartFrequency } =
    useOnExpandChartFrequency();
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('view');

  // Handle activeTab from URL - read it, set it, then remove from URL (same trick as 'selected')
  useEffect(() => {
    if (typeof window !== 'undefined' && window?.location?.href) {
      const url = new URL(window.location.href);
      const urlActiveTab = url.searchParams.get('activeTab');
      if (urlActiveTab) {
        setActiveTab(urlActiveTab);
        url.searchParams.delete('activeTab');
        window.history.replaceState({}, '', url.toString());
      } else {
        // Only use sessionStorage if no activeTab in URL
        const lastCloseActiveTab = sessionStorage.getItem(
          'customer360ActiveTab'
        );
        if (lastCloseActiveTab === 'timeline') {
          setActiveTab('timeline');
        }
      }
    }
  }, []);
  useEffect(() => {
    sessionStorage.setItem('customer360ActiveTab', activeTab);
  }, [activeTab]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  let renewalDate: Date | undefined;

  const activeContracts = customerCommercialsDetails?.data?.customer_contracts
    ?.filter(
      (contract: any) => contract?.contract_status?.toLowerCase() === 'active'
    )
    ?.sort(
      (a: any, b: any) =>
        dayjs(a?.end_date).valueOf() - dayjs(b?.end_date).valueOf()
    );

  if (activeContracts && activeContracts.length > 0) {
    const nearestEndDate = activeContracts[0]?.end_date;
    renewalDate = nearestEndDate ? new Date(nearestEndDate) : undefined;
  } else {
    renewalDate = undefined;
  }

  const newRenewalDate: any = renewalDate
    ? dayjs(renewalDate)?.add(1, 'day').format('MMM DD, YYYY')
    : '';

  const { data: DefaultCustomer360AdoptionGraphData } = useGraphDataQuery(
    Number(id),
    'adoption',
    'default',
    '',
    '',
    [],
    activeTab === 'view',
    undefined,
    undefined,
    undefined
  );
  const { data: DefaultCustomer360BusinesImpactGraphData } = useGraphDataQuery(
    Number(id),
    'business',
    'default',
    '',
    '',
    [],
    activeTab === 'view',
    undefined,
    undefined,
    undefined
  );
  const { data: DefaultCustomer360PerformanceGraphData } = useGraphDataQuery(
    Number(id),
    'performance',
    'default',
    '',
    '',
    [],
    activeTab === 'view',
    undefined,
    undefined,
    undefined
  );
  // const { data: DefaultCustomer360DefectsGraphData } = useGraphDataQuery(
  //   Number(id),
  //   'defects',
  //   'default',
  //   '',
  //   '',
  //   []
  // );
  // const startDate =
  //   customerOnboardingPlan?.data &&
  //   new Date(
  //     Math.min(
  //       ...customerOnboardingPlan?.data?.tasks?.map(
  //         (task: any) => new Date(task.planned_start_datetime)
  //       )
  //     )
  //   );
  // const endDate =
  //   customerOnboardingPlan?.data &&
  //   new Date(
  //     Math.max(
  //       ...customerOnboardingPlan?.data?.tasks?.map(
  //         (task: any) => new Date(task.planned_end_datetime)
  //       )
  //     )
  //   );

  const [modal, setModal] = useState(false);
  const [customerDetailsModal, setCustomerDetailsModal] = useState(false);
  const [customerAttributesModal, setCustomerAttributesModal] = useState(false);
  const modalRef: any = useRef(null);

  useEffect(() => {
    // Function to handle clicks outside of the modal
    const handleClickOutside = (event: any) => {
      if (modalRef.current && !modalRef?.current?.contains(event.target)) {
        setModal(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollYRef.current + 10) {
        setIsScrollingDown(true);
      } else if (currentScrollY === 0) {
        setIsScrollingDown(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const pathname = usePathname();
  const router = useRouter();
  const [meetingStakeholderId, setMeetingStakeholderId] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!searchParams) return;
    const meetingStakeholderId = searchParams.get('meeting_stakeholder_id');
    if (!meetingStakeholderId) return;
    setMeetingStakeholderId(meetingStakeholderId);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete('meeting_stakeholder_id');
    const newSearch = params.toString();
    const newUrl = pathname + (newSearch ? `?${newSearch}` : '');
    router.replace(newUrl);
    const t = setTimeout(() => {
      scrollToSection('StakeholderRef');
    }, 1000);

    return () => clearTimeout(t);
  }, []);

  // const customerName = allAssignedCustomers?.data?.find(
  //   (customer: any) => customer?.customer_id == id
  // )?.customer_name;

  if (isLoading || isFetching) {
    return <Loading />;
  }

  const boss_customer_name = customer?.data[0]?.boss_customer;
  const handleStarred = async () => {
    if (!customer?.data[0]?.is_active) return;
    setIsStarred(!isStarred);
    try {
      await updateCustomerStarred.mutateAsync({
        id,
        is_starred: !isStarred,
      });
      toast.success('Customer details updated successfully');
    } catch (error) {
      // console.error('Update failed:', error);
      toast.error((error as any).message);
    }
  };
  const handleChurnCustomer = async () => {
    try {
      await updateCustomerChurn.mutateAsync({
        id,
        is_active: false,
      });
      toast.success(
        `Customer ${customer?.data[0]?.customer_name} marked as churned successfully`
      );
      setCustomerChurnModal(false);
      // router.push(`/app/customers`);
    } catch (error) {
      // console.error('Failed to mark customer as churned:', error);
      toast.error((error as any).message);
    }
  };
  const handleReactivateCustomer = async () => {
    setCustomerReactivateConfirmationModal(false);
    try {
      await updateCustomerStarred.mutateAsync({
        id,
        is_active: true,
      });
      toast.success(
        `Customer ${customer?.data[0]?.customer_name} reactivated successfully`
      );
    } catch (error) {
      // console.error('Failed to reactivate customer:', error);
      toast.error((error as any).message);
    }
  };

  const signalDeleteToggle = () => {
    setSignalDeleteModal(() => !signalDeleteModal);
  };
  const handleSignalDelete = async () => {
    try {
      const response = await updateSignalMutation.mutateAsync({
        signalId: selectedSignalId,
        data: { is_deleted: true },
        fromPage: 'group-customers',
      });
      if (response && response.status === 200) {
        toast.success('Signal deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting signal:', error);
    }
    setIsSignalDrawerOpen(false);
    signalDeleteToggle();
  };
  return (
    <div className="flex flex-col h-[calc(100vh-54px)] overflow-x-hidden overflow-y-auto scroll">
      <div
        className={` bg-[#F6F7FA] transition-transform duration-300 ease-in-out sticky top-0 z-40 `}
        style={{
          // display: isScrollingDown && !showOnboarding ? 'none' : 'flex',
          backgroundColor: showOnboarding ? '#F6F7FA' : '#F6F7FA',
        }}
        id="OverallHealthScore"
      >
        <div className="flex pt-[16px] justify-between w-[1200px] mx-auto">
          <div className="flex items-center justify-center gap-3">
            <div
              className={`${
                !customer?.data[0]?.is_active
                  ? 'bg-[#9CA3AF]'
                  : overAllStatus === 'green'
                  ? 'bg-[#249782]'
                  : overAllStatus === 'yellow'
                  ? 'bg-[#EAB308]'
                  : overAllStatus === 'red'
                  ? 'bg-[#EF4444]'
                  : 'bg-[#9CA3AF]'
              } rounded-[6px] w-[8px] h-4`}
              onClick={(e) => e.stopPropagation()}
            ></div>
            <Tippy
              content={
                <span className="text-white font-semibold text-sm leading-none select-none">
                  {isStarred ? 'Starred account' : 'Mark as starred account'}
                </span>
              }
              placement="top"
              arrow={true}
              className="tippy-star bg-[#0f1724] text-[#0f1724] rounded-xl px-3 py-2 shadow-lg"
              delay={[80, 0]}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStarred();
                }}
                className=""
              >
                {isStarred ? (
                  <CustomerStarredFillIcon className="w-5 h-5 text-[#3B82F6] transition-colors" />
                ) : (
                  <CustomerStarredUnFilledIcon className="w-5 h-5 text-[#97A1AF] hover:text-[#3B82F6] transition-colors" />
                )}
              </button>
            </Tippy>
            <div
              className="max-w-[250px] h-[40px] border-none transition duration-200 ease-in-out"
              title={`${customer?.data[0]?.customer_name} ${
                boss_customer_name ? `(${boss_customer_name})` : ''
              }`}
            >
              {/* <CustomerSelect allAssignedCustomers={allAssignedCustomers} /> */}
              <CustomerDropdown
                data={allDirectAssignedCustomers?.data}
                selectedName={`${customer?.data[0]?.customer_name} ${
                  boss_customer_name ? `(${boss_customer_name})` : ''
                }`}
              />
            </div>
          </div>
          <div className="">
            {!showOnboarding ? (
              <div className="flex-auto gap-[10px] flex justify-between items-center transition-transform duration-300 ease-in-out">
                <PillarStatusBar
                  scrollToSection={scrollToSection}
                  NPSScore={lastestNpsScore?.data?.data[0]?.nps_score}
                  is_group={isGroup_customer}
                  pillarStatuses={
                    !isGroup_customer
                      ? pillarStatus?.data?.data
                      : customersOverviewData?.data?.data?.find(
                          (ele: any) => ele?.is_group
                        )?.pillar_statuses
                  }
                  lastestNpsScoreTrend={lastestNpsScoreTrend}
                  config={customer360ConfigValue}
                  isGroup_customer={isGroup_customer}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  setOverAllStatus={setOverAllStatus}
                  setModal={setModal}
                  modal={modal}
                  is_active={customer?.data[0]?.is_active}
                />
              </div>
            ) : (
              <div className="flex justify-end w-full gap-[10px] transition-transform duration-300 ease-in-out">
                {/* {customerOnboardingPlan?.data?.tasks.length > 0 && (
                  <div className="bg-[#F6F7FA] flex rounded-md items-center transition duration-200 ease-in-out">
                    <span className="border-r px-3 border-[#E4E7EC] gap-[10px] flex text-base text-[#141C24]">
                      <span className="text-[14px] font-normal text-[#141C24]">
                        {startDate &&
                        startDate?.getTime() > new Date().getTime()
                          ? 'Onboarding to start on'
                          : 'Onboarding started on'}
                      </span>
                      <span className="font-semibold  text-[14px] text-[#141C24]">
                        {startDate?.toDateString() !== 'Invalid date' &&
                          dayjs(startDate).format('MMM DD, YYYY')}
                      </span>
                    </span>
                    <span className="text-[#141C24] text-[14px] px-3">
                      {dayjs(endDate).diff(new Date(), 'day')
                        ? dayjs(endDate).diff(new Date(), 'day') + ' days left'
                        : '-'}{' '}
                    </span>
                  </div>
                )} */}
                <div
                  className="w-[32px] h-[32px] gap-2 border items-center justify-center border-[#E4E7EC] rounded-[20px] cursor-pointer transition duration-200 ease-in-out"
                  onClick={() => setModal(!modal)}
                >
                  <span className="flex items-center justify-center align-middle py-[5px]">
                    <EllipsisVertical className="w-[20px] h-[20px]" />
                  </span>
                </div>
              </div>
            )}
            {modal && (
              <div
                ref={modalRef}
                className="relative transition duration-200 ease-in-out z-50"
              >
                <div className="absolute right-0 bg-white mt-[2px] w-38 rounded-md border border-[#E4E7EC] shadow-lg">
                  <ul className="flex flex-col gap-1 p-2">
                    <li
                      className="cursor-pointer font-normal text-base leading-[24px] text-[#344051] px-3 py-2 rounded-md hover:bg-[#F5F6F7]"
                      onClick={() => {
                        setModal(false);
                        setCustomerDetailsModal(true);
                      }}
                    >
                      Settings
                    </li>
                    <li
                      className="cursor-pointer font-normal text-base leading-[24px] text-[#344051] px-3 py-2 rounded-md hover:bg-[#F5F6F7]"
                      onClick={() => {
                        setModal(false);
                        setCustomerAttributesModal(true);
                      }}
                    >
                      Attributes
                    </li>
                    <li
                      className="cursor-pointer font-normal text-base leading-[24px] text-[#344051] px-3 py-2 rounded-md hover:bg-[#F5F6F7] text-nowrap"
                      onClick={() => {
                        setModal(false);
                        setCustomerChurnModal(true);
                      }}
                    >
                      Mark as churned
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        {customer?.data[0]?.is_active === false && (
          <div className="w-[1200px] mx-auto mt-2 mb-1">
            <div className="flex items-center justify-between border border-gray-200 rounded-[12px] bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-[54px] h-[56px] border-r-[1px] border-gray-200 flex items-center justify-center">
                  <CustomerChurnSvgIcon />
                </div>

                <div className="flex-1 ml-3">
                  <p className="text-[14px] text-[#202B37]">
                    <span className="font-normal">
                      This account is marked as churned on{' '}
                    </span>
                    <span className="font-semibold">
                      {customer?.data[0]?.updated_at
                        ? dayjs(customer?.data[0]?.updated_at).format(
                            'MMMM DD, YYYY'
                          )
                        : 'N/A'}
                    </span>
                    <span className="font-medium"> by </span>
                    <span className="font-semibold">
                      {customer?.data[0]?.updated_by?.first_name +
                        ' ' +
                        customer?.data[0]?.updated_by?.last_name || 'N/A'}
                    </span>
                    <span className="font-medium">.</span>
                  </p>
                  <p className="text-sm text-[#202B37] mt-[1px]">
                    All the risks, opportunities, tasks, and statistics are last
                    updated on the above date.
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0 mx-[10px]">
                <button
                  onClick={() => {
                    setCustomerReactivateConfirmationModal(true);
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-blue-600 rounded-md text-[14px] font-normal text-[#3B82F6] bg-white hover:bg-blue-50 focus:outline-none focus:ring-none transition-colors duration-200"
                >
                  <ReactivateSvgIcon stroke="#3B82F6" />
                  <span>Reactivate now</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {isGroup_customer &&
          !showOnboarding &&
          customersOverviewData?.data?.data?.length > 0 &&
          customer?.data[0]?.associated_customer_ids?.length > 0 && (
            <div className=" bg-[#F6F7FA] mt-2">
              <div className="w-[1200px] mx-auto max-h-[calc(100vh-317px)] overflow-auto scroll-container">
                <CustomerGridView
                  isSearch={false}
                  config={customer360ConfigValue}
                  data={customersOverviewData?.data?.data?.filter(
                    (ele: any) => !ele?.is_group
                  )}
                  userinfo={userinfo?.data}
                  setSelectedSignalId={setSelectedSignalId}
                  setIsSignalDrawerOpen={setIsSignalDrawerOpen}
                  // isCustomer360Page={true}
                />
              </div>
            </div>
          )}

        {!showOnboarding && (
          <CurvedTabs
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            id={id}
            renewalDate={
              newRenewalDate !== 'Invalid Date' ? newRenewalDate : ''
            }
            segmentName={segmentName}
            signalsCount={signalsData?.data?.data?.length ?? 0}
          />
        )}
      </div>
      {showOnboarding ? (
        !customer?.data[0]?.onboarding_done && (
          <div className="mt-2 mx-auto w-[1200px] pr-1">
            {/* <OnboardingInProgress
              data={customerOnboardingPlan?.data ?? []}
              customer_id={id}
              onboardingStatus={onboardingStatus?.data}
              allAssignedCustomers={allAssignedCustomers}
            /> */}
            <Playbook
              customerProjectPlanData={customerProjectPlanData?.data ?? []}
              setProjectStatus={setProjectStatus}
              customerId={Number(id)}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
            />
            <div
              id="StakeholderRef"
              className="bg-white mb-[30px] "
              style={{ scrollMarginTop: '200px' }}
            >
              <h2 className="text-[#141C24] text-[16.51px] font-medium py-2">
                Stakeholders
              </h2>
              {AllStakeholders?.data?.data?.length > 0 ? (
                <StakeHolder
                  stakeholders={AllStakeholders?.data?.data}
                  meetingStakeholderId={meetingStakeholderId}
                />
              ) : (
                <div className="flex flex-col gap-[60px] justify-center items-center pt-[69px] border-[0.95px] rounded-[12px] border-[#E4E7EC]">
                  <div className="flex flex-col items-center gap-[20px]">
                    <span className="text-[#414E62] font-[20px]">
                      No stakeholder added in{' '}
                      {`${customer?.data[0]?.customer_name}`}
                    </span>
                    <button
                      className={
                        'text-[#141C24] text-[14px] font-semibold px-4 btn bg-white border-[#637083] '
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddStakeholderForm(true);
                      }}
                    >
                      Add new
                    </button>
                  </div>
                  <span>
                    <img
                      src="/NoStakeholders.png"
                      alt=""
                      className="w-[288px] h-[288px]"
                    />
                    {/* <Nostakeholders className="w-[388px] h-[388px]" /> */}
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      ) : activeTab === 'view' ? (
        <div
          // id="sections"
          // ref={sectionsRef}
          // className={`flex-1`}
          style={{
            marginTop: `${
              document.getElementById('card-body')?.clientHeight
            }px`,
          }}
        >
          <div className="-m-4 px-4">
            {orderedConfigEntries.map(({ key, value }) => {
              // skip disabled entries early
              if (!value || !value.enabled) return null;

              if (key === 'Adoption' && value.enabled) {
                return (
                  <div
                    id="AdoptionRef"
                    className="border-[#000000] max-w-[1200px] pr-1 mx-auto"
                    style={{ scrollMarginTop: '140px' }}
                  >
                    <AdoptionMetric
                      customer360AdoptionGraphData={
                        DefaultCustomer360AdoptionGraphData
                      }
                      synthesisData={customerDetailSynthesis?.data?.data}
                      isTargetThresholdEditEnabled={
                        isTargetThresholdEditEnabled
                      }
                      allowStatusInsightsToggle={allowStatusInsightsToggle}
                      displayName={
                        customer360ConfigValue?.Adoption?.enabled
                          ? customer360ConfigValue?.Adoption?.display_name
                          : 'Adoption'
                      }
                      formatKey={formatKey}
                      isGroup_customer={isGroup_customer}
                    />
                  </div>
                );
              }

              if (key === 'Impact' && value.enabled) {
                return (
                  <div
                    id="ImpactRef"
                    className="border-[#000000] max-w-[1200px] pr-1 mx-auto"
                    style={{ scrollMarginTop: '120px' }}
                  >
                    <BusinessImpactMetric
                      customer360BusinesImpactGraphData={
                        DefaultCustomer360BusinesImpactGraphData
                      }
                      synthesisData={customerDetailSynthesis?.data?.data}
                      isTargetThresholdEditEnabled={
                        isTargetThresholdEditEnabled
                      }
                      allowStatusInsightsToggle={allowStatusInsightsToggle}
                      displayName={
                        customer360ConfigValue?.Impact?.enabled
                          ? customer360ConfigValue?.Impact?.display_name
                          : 'Business Impact'
                      }
                      formatKey={formatKey}
                      isGroup_customer={isGroup_customer}
                    />
                  </div>
                );
              }

              if (key === 'Performance' && value.enabled) {
                return (
                  <div
                    id="PerformanceRef"
                    className="border-[#000000] max-w-[1200px] pr-1 mx-auto"
                    style={{ scrollMarginTop: '120px' }}
                  >
                    <PerformanceAndErrorMetric
                      customer360PerformanceGraphData={
                        DefaultCustomer360PerformanceGraphData
                      }
                      // customer360DefectsGraphData={
                      //   DefaultCustomer360DefectsGraphData
                      // }
                      synthesisData={customerDetailSynthesis?.data?.data}
                      isTargetThresholdEditEnabled={
                        isTargetThresholdEditEnabled
                      }
                      allowStatusInsightsToggle={allowStatusInsightsToggle}
                      displayName={
                        customer360ConfigValue?.Performance?.enabled
                          ? customer360ConfigValue?.Performance?.display_name
                          : 'Performance Report'
                      }
                      formatKey={formatKey}
                      isGroup_customer={isGroup_customer}
                    />
                  </div>
                );
              }

              if (
                key === 'CustomerService' &&
                value.enabled &&
                !isGroup_customer
              ) {
                return (
                  <div
                    id="CustomerServiceRef"
                    className="pb-[30px] max-w-[1200px] pr-1 mx-auto"
                    style={{ scrollMarginTop: '120px' }}
                  >
                    {customerTickets?.data && (
                      <NoOfTicktes
                        customerTickets={customerTickets?.data}
                        id={Number(id)}
                        synthesisData={customerDetailSynthesis?.data?.data}
                        displayName={
                          customer360ConfigValue?.CustomerService?.enabled
                            ? customer360ConfigValue?.CustomerService
                                ?.display_name
                            : 'Customer Service'
                        }
                      />
                    )}
                  </div>
                );
              }

              if (key === 'Projects' && value.enabled) {
                return (
                  <div
                    id="ProjectsRef"
                    className="bg-white mb-[30px] max-w-[1200px] pr-1 mx-auto"
                    style={{ scrollMarginTop: '120px' }}
                  >
                    <Playbook
                      customerProjectPlanData={
                        customerProjectPlanData?.data ?? []
                      }
                      setProjectStatus={setProjectStatus}
                      customerId={Number(id)}
                      selectedProject={selectedProject}
                      setSelectedProject={setSelectedProject}
                      displayName={
                        customer360ConfigValue?.Projects?.enabled
                          ? customer360ConfigValue?.Projects?.display_name
                          : 'Projects'
                      }
                    />
                  </div>
                );
              }

              if (key === 'Stakeholder' && value.enabled) {
                return (
                  <div
                    id="StakeholderRef"
                    className="bg-white mb-[30px] max-w-[1200px] pr-1 mx-auto"
                    style={{ scrollMarginTop: '140px' }}
                  >
                    <h2 className="text-[#141C24] text-[16px] font-medium py-[10px] mb-[16px]">
                      {customer360ConfigValue?.Stakeholder?.enabled
                        ? customer360ConfigValue?.Stakeholder?.display_name
                        : 'Stakeholders'}
                    </h2>
                    {customerDetailSynthesis?.data?.data?.map(
                      (index: number, ele: any) => {
                        if (
                          ele?.type?.toLowerCase() == 'pillar' &&
                          ele?.subtype?.toLowerCase() == 'stakeholder'
                        ) {
                          return (
                            <Synthesis
                              key={index}
                              synthesisData={ele?.synthesis}
                            />
                          );
                        }
                      }
                    )}
                    <StakeHolder
                      stakeholders={AllStakeholders?.data?.data}
                      synthesisData={customerDetailSynthesis?.data?.data}
                      meetingStakeholderId={meetingStakeholderId}
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
          {customerCommercialsDetails?.data &&
            customer360ConfigValue?.PurchasesAndRenewals?.enabled && (
              <div id="ARR" className="max-w-[1200px] pr-1 mx-auto">
                <AnnualCommercialValues
                  customerCommercialsDetails={customerCommercialsDetails?.data}
                  displayName={
                    customer360ConfigValue?.PurchasesAndRenewals?.enabled
                      ? customer360ConfigValue?.PurchasesAndRenewals
                          ?.display_name
                      : 'Commercials'
                  }
                />
              </div>
            )}
        </div>
      ) : activeTab === 'timeline' ? (
        <div
          style={{
            marginTop: `${
              document.getElementById('card-body')?.clientHeight
            }px`,
          }}
        >
          <Journey
            customerId={Number(id)}
            customerName={`${customer?.data[0]?.customer_name}`}
            customerCurrentPhase={customer?.data[0]?.current_phase || ''}
            usersList={usersList}
            stakeholdersList={AllStakeholders?.data?.data ?? []}
          />
        </div>
      ) : activeTab === 'open_issues' ? (
        <div
          style={{
            marginTop: `${
              document.getElementById('card-body')?.clientHeight
            }px`,
          }}
        >
          <Signals
            customerId={Number(id)}
            signals={signalsData?.data?.data || []}
            userinfo={userinfo?.data}
            isLoading={signalsLoading}
            isError={signalsError}
            filterHook={openIssuesFilters}
          />
        </div>
      ) : activeTab === 'tasks' ? (
        <div
          style={{
            marginTop: `${
              document.getElementById('card-body')?.clientHeight
            }px`,
          }}
        >
          <Tasks360 id={id} />
        </div>
      ) : activeTab === 'risk' ? (
        <div
          style={{
            marginTop: `${
              document.getElementById('card-body')?.clientHeight
            }px`,
          }}
        >
          <Risk360 id={id} />
        </div>
      ) : activeTab === 'opportunities' ? (
        <div
          style={{
            marginTop: `${
              document.getElementById('card-body')?.clientHeight
            }px`,
          }}
        >
          <Opportunity360 id={id} />
        </div>
      ) : (
        activeTab === 'summary_and_notes' && (
          <div
            style={{
              marginTop: `${
                document.getElementById('card-body')?.clientHeight
              }px`,
            }}
          >
            <ExecutiveSummary
              id={id}
              customerDetailSynthesis={customerDetailSynthesis}
              customerSuccessPlan={
                customer?.data?.[0]?.customer_success_plan || ''
              }
            />
          </div>
        )
      )}
      {addStakeholderForm && (
        <AddStakeholderModal
          addStakeholderForm={addStakeholderForm}
          setAddStakeholderForm={setAddStakeholderForm}
        />
      )}

      {customerDetailsModal && (
        <CustomerDetailForm
          setCustomerDetailsModal={setCustomerDetailsModal}
          customer={customer}
          customerDetailsModal={customerDetailsModal}
        />
      )}
      {
        <ExpandChartModal
          modalOpen={onExpandChartModalOpen}
          handleCancel={() => {
            setOnExpandChartModalOpen(false);
            setOnExpandChartModalArray([]);
            setOnExpandChartFrequency('');
          }}
          id={Number(id)}
          customerName={`${customer?.data[0]?.customer_name}`}
          is_group={isGroup_customer}
          chartFrequency={onExpandChartFrequency}
          formatKey={formatKey}
          defaultGraphData={{
            adoption: DefaultCustomer360AdoptionGraphData,
            business: DefaultCustomer360BusinesImpactGraphData,
            performance: DefaultCustomer360PerformanceGraphData,
          }}
        />
      }
      {customerAttributesModal && (
        <CustomerAttributesPanel
          onClose={() => setCustomerAttributesModal(false)}
          customerAttributesModal={customerAttributesModal}
          customerId={Number(id)}
          attribute_type={'account'}
        />
      )}
      {customerChurnModal && (
        <CustomerChurnModal
          customerName={`${customer?.data[0]?.customer_name}`}
          modalOpen={customerChurnModal}
          handleCancel={() => setCustomerChurnModal(false)}
          handleChurn={handleChurnCustomer}
        />
      )}
      {customerReactivateConfirmationModal && (
        <ConfirmationModalForEmail
          header={`Do you want to reactivate ${customer?.data[0]?.customer_name} account?`}
          modalOpen={customerReactivateConfirmationModal}
          handleCancel={() => setCustomerReactivateConfirmationModal(false)}
          handleYes={handleReactivateCustomer}
          yesText="Yes, reactivate it"
        />
      )}
      <SignalDetails
        isOpen={isSignalDrawerOpen}
        onClose={() => {
          setIsSignalDrawerOpen(false);
          setSelectedSignalId('');
        }}
        signalId={selectedSignalId}
        handleDelete={signalDeleteToggle}
        userInfo={userinfo?.data}
        fromPage="group-customers"
      />
      <DeleteModal
        show={signalDeleteModal}
        onHide={signalDeleteToggle}
        onDelete={handleSignalDelete}
        title={'signal'}
      />
    </div>
  );
};

export default Page;
