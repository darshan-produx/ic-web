import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState, useRef, ReactNode, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  ArrowPathIcon,
  SquaresPlusIcon,
  StarPlusIcon,
} from '../../../assests/icons/icons';
import { RenderDropdownUseCase } from './renderDropdownUsecase';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../../../common/api-request';
import ResearchChatbotModal from './reasearchchatbot';
import { getAllOpportunities } from '../../../api/insights/insights';
import {
  useReRunResearch,
  useUpdateInsight,
} from '../../../../services/mutations/insightMutations';
import { toast } from 'react-toastify';
import ConfirmationPopUp from '../../communication/meetings/components/confirmationPopUp';
dayjs.extend(relativeTime);

interface ResearchCardProps {
  title: string;
  runAt: string;
  children: ReactNode;
  researchArray?: any[]; // was qaArray
  onReRun?: () => void;
  insightId: number;
  useCaseId: number;
  insightObjectId: string;
  // customerId: number;
  // userinfo: any;
  // custom_research_id?: string;
  setShowSideChatbox: (value: boolean) => void;
  setIsGuidaceSectionOpen: (value: boolean) => void;
  is_customer_active?: boolean;
}

export default function ResearchCard({
  title,
  runAt,
  children,
  onReRun,
  researchArray,
  insightId,
  useCaseId,
  insightObjectId,
  // customerId,
  // userinfo,
  // custom_research_id,
  is_customer_active,
  setShowSideChatbox,
  setIsGuidaceSectionOpen,
}: ResearchCardProps) {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const toggleOpen = () => setIsOpen((prev) => !prev);
  const [changeUseCase, setChangeUseCase] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [selectedOpportunityUseCase, setSelectedOpportunityUseCase] =
    useState<any>(null);
  // const [showSideChatbot, setShowSideChatbox] = useState(false);
  const [
    reRunResearchConfirmationModalOpen,
    setReRunResearchConfirmationModalOpen,
  ] = useState(false);
  // const { data: userinfo, isLoading } = useQuery({
  //   queryKey: ['info'],
  //   queryFn: () =>
  //     apiRequest({
  //       url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
  //     }),
  // });

  const { data: allOpportunities = [] } = useQuery<any>({
    queryKey: ['getAllOpportunities'],
    queryFn: getAllOpportunities,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (
      !insightId ||
      !Array.isArray(allOpportunities?.data) ||
      (Array.isArray(allOpportunities?.data) && !allOpportunities?.data.length)
    )
      return;

    const matchedOpportunity =
      Array.isArray(allOpportunities?.data) &&
      allOpportunities?.data.find(
        (opportunity: any) => opportunity.insight_id === insightId
      );
    setSelectedOpportunity(matchedOpportunity || null);
    const matchedOpportunityUseCase =
      Array.isArray(matchedOpportunity?.usecase_details) &&
      matchedOpportunity?.usecase_details.length > 0 &&
      matchedOpportunity?.usecase_details.find(
        (usecase: any) => usecase.usecase_id === useCaseId
      );
    setSelectedOpportunityUseCase(matchedOpportunityUseCase || null);
  }, [insightId, allOpportunities, changeUseCase, useCaseId]);

  const researchNotRun =
    (!runAt && !researchArray) ||
    (!runAt && Array.isArray(researchArray) && researchArray.length === 0);
  let isResearchRunning = false;

  if (runAt && dayjs(runAt).isValid()) {
    const startedAt = dayjs(runAt);
    const secondsSince = dayjs().diff(startedAt, 'seconds');
    isResearchRunning = secondsSince >= 0 && secondsSince < 30;
  }

  const reRunResearch = useReRunResearch();
  const updateInsight = useUpdateInsight();

  const handleRunResearch = async () => {
    if (!selectedOpportunityUseCase) return toast.error('Select a usecase');
    try {
      await updateInsight.mutateAsync({
        id: insightObjectId,
        data: {
          usecase_id: selectedOpportunityUseCase.usecase_id,
          usecase: selectedOpportunityUseCase.name,
          researched_at: new Date().toISOString(),
          research: [],
        },
      });
      await reRunResearch.mutateAsync({
        insight_instance_id: insightObjectId as string,
        org_id: localStorage.getItem('org_id') || '',
      });
      toast.success('Research re-run and insight updated!');
      setChangeUseCase(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to run research');
    }
  };

  const handleCancel = () => {
    setReRunResearchConfirmationModalOpen(false);
  };

  const handleYes = () => {
    handleRunResearch();
    setReRunResearchConfirmationModalOpen(false);
  };

  return (
    <>
      <div className="w-full h-auto bg-white border border-gray-200 rounded-xl my-5 shadow-sm">
        {changeUseCase || isResearchRunning || researchNotRun ? (
          <div className="flex flex-col">
            <div
              className={`p-5 flex flex-col gap-4 ${
                isResearchRunning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex flex-col gap-1.5 flex-1 relative">
                <h3 className="text-[14px] font-medium text-gray-700 leading-5">
                  {researchNotRun
                    ? 'Research not run for this opportunity.'
                    : 'Select a use case'}
                </h3>

                <RenderDropdownUseCase
                  useCaseDetails={selectedOpportunity?.usecase_details || []}
                  selectedOpportunityUseCase={selectedOpportunityUseCase}
                  setSelectedOpportunityUseCase={setSelectedOpportunityUseCase}
                  setChangeUseCase={setChangeUseCase}
                  isResearchRunning={isResearchRunning}
                />
              </div>
              <div className="flex justify-start gap-2">
                <button
                  className={`py-[10px] bg-[#1A75FF] text-[#FFFFFF] px-5 text-[14px] font-semibold leading-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={() => setReRunResearchConfirmationModalOpen(true)}
                  disabled={
                    !selectedOpportunityUseCase ||
                    // selectedOpportunityUseCase.usecase_id === useCaseId ||
                    !is_customer_active
                  }
                >
                  Run research
                </button>

                <button
                  type="button"
                  className="py-[10px] px-5 border-[1px] border-[#637083] text-[14px] font-semibold text-[#344051] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setChangeUseCase(false)}
                  disabled={isResearchRunning as boolean}
                >
                  Cancel
                </button>
              </div>
            </div>

            {isResearchRunning && (
              <div className="text-center text-[14px] font-normal leading-5 text-gray-400 border-t border-gray-200 min-h-[161px] flex items-center justify-center">
                Running research...
              </div>
            )}
          </div>
        ) : (
          <div>
            <div
              className={`flex flex-col gap-3 px-4 py-3 ${
                isOpen ? 'border-b border-gray-200' : ''
              }`}
            >
              <div className="flex gap-3 items-start">
                <button
                  onClick={toggleOpen}
                  className="mt-0.5"
                  aria-expanded={isOpen}
                  aria-controls="research-content"
                >
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <div className="flex flex-col gap-3 flex-1">
                  <div>
                    <h3 className="text-[16px] font-normal text-gray-800 leading-6">
                      Research run for {title}
                    </h3>
                    <p className="mt-1 text-[12px] font-normal leading-4 text-gray-500">
                      On {dayjs(runAt).format('MMM DD, YYYY')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={onReRun}
                        disabled={!is_customer_active}
                        className="inline-flex items-center px-[10px] py-[4px] gap-1.5 border border-gray-300 rounded-[6px] text-[14px] font-normal text-gray-900 leading-5 hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArrowPathIcon className="w-5 h-5 mr-2" />
                        Re-Run
                      </button>
                      <button
                        onClick={() => setChangeUseCase(true)}
                        disabled={!is_customer_active}
                        className="inline-flex items-center px-[10px] py-[4px] gap-1.5 border border-gray-300 rounded-[6px] text-[14px] font-normal text-gray-900 hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <SquaresPlusIcon className="w-5 h-5 mr-2" />
                        Change Use Case
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          setShowSideChatbox &&
                          typeof setShowSideChatbox === 'function'
                        ) {
                          setShowSideChatbox(true);
                        }
                        setIsGuidaceSectionOpen(false);
                      }}
                      disabled={!is_customer_active}
                      className="inline-flex items-center px-[10px] py-[4px] gap-1.5 border border-[#3B82F6] rounded-[6px] text-[14px] font-normal text-[#3B82F6] hover:bg-gray-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <StarPlusIcon className="w-5 h-5 mr-2" />
                      Continue with AI
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div
              id="research-content"
              ref={contentRef}
              className={`pl-11 pt-5 pr-5 pb-4 transition-all duration-200 ease-in-out ${
                isOpen ? 'py-4' : 'hidden py-0'
              }`}
            >
              <div className="prose prose-sm text-gray-700">{children}</div>
            </div>
          </div>
        )}
      </div>
      {/* <ResearchChatbotModal
        title={title}
        setShowSideChatbox={setShowSideChatbox}
        showSideChatbot={showSideChatbot}
        user_id={userinfo?.data?.id ?? ''}
        researchArray={researchArray}
        customer_id={customerId}
        insight_id={insightObjectId}
        custom_research_id={custom_research_id}
      /> */}
      {reRunResearchConfirmationModalOpen && (
        <ConfirmationPopUp
          header={`This action will clear the research`}
          modalOpen={reRunResearchConfirmationModalOpen}
          handleCancel={handleCancel}
          handleYes={handleYes}
          yesText={'Yes'}
          noText={'No'}
          title={'Do you want to continue?'}
        />
      )}
    </>
  );
}
