'use client';
import { useEffect, useState } from 'react';
import { CollapseIcon, LightBulb } from '../../assests/icons/icons';
import Insights from './insights';
import { useQuery } from '@tanstack/react-query';
import {
  getInsightByFilter,
  getInsightDetails,
} from '../../api/insights/insights';
import Guidance from './guidance';
import InsightDeatils from './insightDetails';
import { MultiValue } from 'react-select';
// import { apiRequest } from '../../../../../common/api-request';
import Loading from '../../../common/components/loading';
import dayjs from 'dayjs';

interface Option {
  value: string;
  id: string;
  label: string;
  selected: boolean;
}

const Page = () => {
  const [selectedCompanies, setSelectedCompanies] = useState<
    MultiValue<Option>
  >([]);
  const [selectedSegments, setSelectedSegments] = useState<MultiValue<Option>>(
    []
  );
  const [selectedPillars, setSelectedPillars] = useState<MultiValue<Option>>(
    []
  );
  const [selectedStatuses, setSelectedStatuses] = useState<MultiValue<Option>>(
    []
  );
  const [isGuidaceSectionOpen, setIsGuidaceSectionOpen] = useState(false);
  const [selectedActionStatus, setSelectedActionStatus] = useState<string>('');
  const [flg, setFlg] = useState(false);
  const [insightType, setInsightType] = useState('Risk');
  const [ignoredMessages, setIgnoredMessages] = useState<{}>({});
  const [isCollapsed, setIsCollapsed] = useState(true);
  // const { data: insights } = useQuery({
  //   queryKey: ['allInsights'],
  //   queryFn: getAllInsights,
  // });
  // const { data: userinfo } = useQuery({
  //   queryKey: ['info'],
  //   queryFn: () =>
  //     apiRequest({
  //       url: '/api/app-service/v1/userinfo',
  //     }),
  // });
  const url = new URL(window.location.href);
  const urlSelectedId = url.searchParams.get('selected');
  const { data: insights, isLoading } = useQuery({
    queryKey: [
      'allInsights',
      selectedCompanies,
      selectedPillars,
      selectedStatuses,
      selectedSegments,
      insightType,
      urlSelectedId,
    ],
    queryFn: () =>
      getInsightByFilter({
        segments: selectedSegments
          ?.map((ele: any) => {
            if (ele?.selected) {
              return ele?.id;
            }
          })
          .filter((ele: any) => ele != undefined),
        customers: selectedCompanies
          ?.map((ele: any) => {
            if (ele?.selected) {
              return ele?.id;
            }
          })
          .filter((ele: any) => ele != undefined),
        pillars: selectedPillars
          ?.map((ele: any) => {
            if (ele?.selected) {
              return ele?.value;
            }
          })
          .filter((ele: any) => ele != undefined),
        status: selectedStatuses
          ?.map((ele: any) => {
            if (ele?.selected) {
              return ele?.value || ele?.group_status || ele?.label;
            }
          })
          .filter((ele: any) => ele != undefined),
        insightType: insightType === 'All' ? undefined : insightType,
        urlSelectedId: urlSelectedId ? String(urlSelectedId) : '',
      }),
    refetchOnWindowFocus: false,
  });
  const [dummy, setDummy] = useState(0);
  const [selectedInsightCardId, setSelectedInsightCardId] = useState('');
  // const [insightDetails, setInsightDetails] = useState<any>();
  const { data: insightDetails, isLoading: insightDetailsLoading } = useQuery({
    queryKey: ['insightDetails', selectedInsightCardId],
    queryFn: () => getInsightDetails(String(selectedInsightCardId)),
    enabled: !!selectedInsightCardId,
    refetchOnWindowFocus: false,
    refetchInterval: (data: any): number | false => {
      const MIN_SECONDS_TO_REFETCH = 30;
      const MAX_SECONDS_TO_REFETCH = 600;
      const REFETCH_MS = 10_000;
      const insight = data?.state?.data?.data?.insight_instance;
      if (!insight) return false;
      if (insight?.insight_data_type === 'data') return false;
      const { research, researched_at: researchedAt } = insight;
      if (Array.isArray(research) && research.length > 0) return false;
      if (!researchedAt) return false;
      const started = dayjs(researchedAt);
      if (!started.isValid()) return false;
      const secondsSince = dayjs().diff(started, 'seconds');
      const isResearchEmpty = Array.isArray(research)
        ? research.length === 0
        : !research;
      if (
        secondsSince >= MIN_SECONDS_TO_REFETCH &&
        secondsSince <= MAX_SECONDS_TO_REFETCH &&
        isResearchEmpty
      ) {
        return REFETCH_MS;
      }
      return false;
    },
  });

  const handleCardSelection = async (id: any) => {
    setSelectedInsightCardId(id);
    const selectedInsight = insights?.data.data.find(
      (insight: any) => insight._id === id
    );
    if (selectedInsight) {
      selectedInsight.is_viewed = true;
    }
  };

  useEffect(() => {
    if (insights?.data.data.length > 0 && !flg) {
      setFlg(true);
    }
    if (insights?.data.data.length === 0) {
      setSelectedInsightCardId('');
    }
  }, [insights?.data.data]);

  return (
    <div className=" ">
      {flg ? (
        <div className="flex items-center justify bg-gradient bg-gradient-to-r from-[#F2F4F7] from-50%  to-white to-50%">
          <div className="flex max-w-[1200px] mx-auto w-full bg-white h-[calc(100vh-3.875rem)] pb-[10px] overflow-hidden relative">
            <div
              className={
                isGuidaceSectionOpen
                  ? `w-[295px] ${!isCollapsed ? 'hidden ' : ''}`
                  : `w-[495px] ${!isCollapsed ? 'hidden ' : ''}`
              }
              style={{ height: innerHeight }}
            >
              <div
                className={`bg-[#F2F4F7] ${
                  !isGuidaceSectionOpen ? 'pr-[16px]' : 'pr-[8px]'
                }`}
                style={{ height: innerHeight }}
              >
                <Insights
                  insightType={insightType}
                  setInsightType={setInsightType}
                  setSelectedCompanies={setSelectedCompanies}
                  selectedCompanies={selectedCompanies}
                  setSelectedSegments={setSelectedSegments}
                  selectedSegments={selectedSegments}
                  setSelectedPillars={setSelectedPillars}
                  selectedPillars={selectedPillars}
                  setSelectedStatuses={setSelectedStatuses}
                  selectedStatuses={selectedStatuses}
                  insights={insights?.data.data ?? []}
                  handleCardSelection={handleCardSelection}
                  selectedInsightCardId={selectedInsightCardId}
                  ignoredMessages={ignoredMessages}
                  setIgnoredMessages={setIgnoredMessages}
                  urlSelectedId={urlSelectedId ? String(urlSelectedId) : ''}
                  setSelectedActionStatus={setSelectedActionStatus}
                />
              </div>
            </div>

            <div className="bg-[#F2F4F7] h-screen ">
              <div className="bg-[#F2F4F7] border-r ml-3 mt-1 relative border-[#CED2DA] h-screen items-center">
                <div
                  className=" absolute -ml-3 py-[24px] cursor-pointer"
                  onClick={() => {
                    setIsCollapsed(!isCollapsed),
                      setIsGuidaceSectionOpen(
                        isCollapsed ? true : isGuidaceSectionOpen
                      );
                  }}
                >
                  <CollapseIcon
                    className={`bg-white cursor-pointer text-white rounded-full  ${
                      isCollapsed ? '' : 'rotate-180'
                    } `}
                  />
                </div>
              </div>
            </div>
            <div
              className={`${
                !isCollapsed
                  ? 'w-1/2 pl-[24px] '
                  : isGuidaceSectionOpen && insightDetails?.data?.guidance
                  ? 'w-[402px] pl-[24px] '
                  : 'w-[903px] pl-[24px] pr-[9px] '
              } h-[calc(100vh-3.8rem)] overflow-y-auto scrollhide`}
            >
              {insightDetailsLoading && !isLoading ? (
                <Loading />
              ) : insightDetails?.data ? (
                <InsightDeatils
                  insightDetails={insightDetails?.data}
                  insights={insights?.data.data}
                  dummy={dummy}
                  setIsGuidaceSectionOpen={setIsGuidaceSectionOpen}
                  isGuidaceSectionOpen={
                    insightDetails?.data?.guidance
                      ? isGuidaceSectionOpen
                      : false
                  }
                  setIsCollapsed={setIsCollapsed}
                  setIgnoredMessages={setIgnoredMessages}
                  ignoredMessages={ignoredMessages}
                  selectedActionStatus={selectedActionStatus}
                  setSelectedActionStatus={setSelectedActionStatus}
                  isCollapsed={isCollapsed}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center pt-[119px] text-gray-800">
                  No insight details to show
                </div>
              )}
            </div>
            {isGuidaceSectionOpen && insightDetails?.data?.guidance && (
              <div
                className={`${
                  !isCollapsed
                    ? 'w-1/2  ml-[30px] mr-[2px] border border-gray-200  h-[calc(100vh-5.35rem)] rounded-xl mt-[24px] overflow-hidden '
                    : 'w-[452px] ml-[30px] mr-[2px] border border-gray-200 h-[calc(100vh-5.35rem)] rounded-xl mt-[24px] overflow-hidden '
                }`}
              >
                <Guidance
                  data={insightDetails?.data?.guidance}
                  insightDetails={insightDetails?.data}
                  insights={insights?.data.data}
                  setDummyvalue={setDummy}
                  setIsGuidaceSectionOpen={setIsGuidaceSectionOpen}
                  setIsCollapsed={setIsCollapsed}
                />
              </div>
            )}
            {isLoading ? (
              <div className="absolute top-0 left-0 bottom-0 right-0 flex items-center justify-center bg-gray-100 opacity-50">
                <Loading />
              </div>
            ) : null}
          </div>
        </div>
      ) : isLoading ? (
        <Loading />
      ) : (
        <div className="justify-center items-center pt-[111px] !text-[#141C24] !font-normal flex flex-col gap-[22px]">
          <span className="flex justify-center">
            <LightBulb className="w-[42px] h-[42px] text-[#CED2DA]" />
          </span>
          <span className="justify-center text-[16px] text-[#97A1AF] font-normal">
            No insights to show
          </span>
        </div>
      )}
    </div>
  );
};

export default Page;
