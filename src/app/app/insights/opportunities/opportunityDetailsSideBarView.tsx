import React, { useEffect, useState } from 'react';
import SideDrawer from '../../../../common/components/SideDrawer';
// import { LightBulb } from '../../../assests/icons/icons';
import { useQuery } from '@tanstack/react-query';
import { getInsightDetails } from '../../../api/insights/insights';
import Guidance from '.././guidance';
import InsightDeatils from '.././insightDetails';
import Loading from '../../../../common/components/loading';
import ResearchChatbotModal from '../Research/reasearchchatbot';
import { apiRequest } from '../../../../common/api-request';
import dayjs from 'dayjs';
interface OpportunityDetailsSideBarViewProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOpportunityId: string;
}

const OpportunityDetailsSideBarView: React.FC<
  OpportunityDetailsSideBarViewProps
> = ({ isOpen, onClose, selectedOpportunityId }) => {
  const [isGuidaceSectionOpen, setIsGuidaceSectionOpen] = useState(false);
  const [selectedActionStatus, setSelectedActionStatus] = useState<string>('');
  const [ignoredMessages, setIgnoredMessages] = useState<{}>({});
  // const [dummy, setDummy] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [title, setTitle] = useState('Research Assistant');
  const [showSideChatbot, setShowSideChatbox] = useState(false);
  const [researchArray, setResearchArray] = useState<any[]>([]);
  const [custom_research_id, setCustom_research_id] = useState<string>('');
  const [customerId, setCustomerId] = useState<number>(0);
  const [insightObjectId, setInsightObjectId] = useState<string>('');

  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
  });

  const { data: insightDetails, isLoading: insightDetailsLoading } = useQuery({
    queryKey: ['insightDetails', selectedOpportunityId],
    queryFn: () => getInsightDetails(String(selectedOpportunityId)),
    enabled: !!selectedOpportunityId,
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
  useEffect(() => {
    if (insightDetails?.data) {
      const insight_instance = insightDetails?.data?.insight_instance;
      if (
        insight_instance &&
        insight_instance?.insight_type === 'Opportunity'
      ) {
        setInsightObjectId(insight_instance?._id);
        setCustomerId(insight_instance?.customer_id);
        const research = insight_instance?.research;
        setResearchArray(research || []);
        setCustom_research_id(insight_instance?.custom_research_id || '');
        setTitle(insight_instance?.title);
      }
    }
  }, [insightDetails?.data]);

  const handleOnClose = () => {
    setIsGuidaceSectionOpen(false);
    setShowSideChatbox(false);
    onClose();
  };
  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={handleOnClose}
      title={title}
      width={isGuidaceSectionOpen || showSideChatbot ? 'w-[1237px]' : 'w-[800px]'}
    // zIndex={999}
    >
      <div className="flex">
        <div
          className={`${(isGuidaceSectionOpen && insightDetails?.data?.guidance) ||
            showSideChatbot
            ? 'w-[656px] px-6'
            : 'w-[792px] px-6'
            } h-[calc(100vh-3.8rem)] overflow-x-hidden overflow-y-auto scroll`}
        >
          {insightDetailsLoading ? (
            <Loading />
          ) : insightDetails?.data ? (
            <InsightDeatils
              insightDetails={insightDetails?.data}
              // dummy={dummy}
              setIsGuidaceSectionOpen={setIsGuidaceSectionOpen}
              isGuidaceSectionOpen={
                insightDetails?.data?.guidance ? isGuidaceSectionOpen : false
              }
              setIsCollapsed={setIsCollapsed}
              setIgnoredMessages={setIgnoredMessages}
              ignoredMessages={ignoredMessages}
              selectedActionStatus={selectedActionStatus}
              setSelectedActionStatus={setSelectedActionStatus}
              isCollapsed={isCollapsed}
              isSideBarView={true}
              setShowSideChatbox={setShowSideChatbox}
              userinfo={userinfo}
              showSideChatbox={showSideChatbot}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center pt-[119px] text-gray-800">
              No insight details to show
            </div>
          )}
        </div>
        <div>
          {isGuidaceSectionOpen &&
            insightDetails?.data?.guidance &&
            !showSideChatbot && (
              <div
                className={`${'w-[530px] border-l-[1px] border-gray-200 h-[calc(100vh-5.35rem)] overflow-y-auto'}`}
              >
                <Guidance
                  data={insightDetails?.data?.guidance}
                  insightDetails={insightDetails?.data}
                  // setDummyvalue={setDummy}
                  setIsGuidaceSectionOpen={setIsGuidaceSectionOpen}
                  setIsCollapsed={setIsCollapsed}
                />
              </div>
            )}
        </div>
        <div>
          {showSideChatbot && !isGuidaceSectionOpen && (
            <ResearchChatbotModal
              title={title}
              setShowSideChatbox={setShowSideChatbox}
              showSideChatbot={showSideChatbot}
              user_id={userinfo?.data?.id ?? ''}
              researchArray={researchArray}
              customer_id={customerId}
              insight_id={insightObjectId}
              custom_research_id={custom_research_id}
            />
          )}
        </div>
      </div>
    </SideDrawer>
  );
};

export default OpportunityDetailsSideBarView;
