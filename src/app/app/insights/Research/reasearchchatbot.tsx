import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Send } from 'lucide-react';
import {
  useAskAIChatbotApi,
  useDeleteResearchCustomConversation,
} from '../../../../services/mutations/askAIMutations';
import { AakAIIcon } from '../../../assests/icons/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ConfirmationPopUp from '../../communication/meetings/components/confirmationPopUp';
import Tippy from '@tippyjs/react';
import { useQuery } from '@tanstack/react-query';
import { getCustomResearchChatHistory } from '../../../api/askAI/askAI';
import { toast } from 'react-toastify';

interface Props {
  title: string;
  setShowSideChatbox: (v: boolean) => void;
  showSideChatbot: boolean;
  user_id?: string;
  researchArray?: any[];
  customer_id?: number;
  insight_id?: string;
  custom_research_id?: string;
}

const ResearchChatbotModal: React.FC<Props> = ({
  title,
  setShowSideChatbox,
  showSideChatbot,
  user_id,
  researchArray = [],
  customer_id,
  insight_id,
  custom_research_id,
}) => {
  // isSending = true when request is in-flight
  const [isSending, setIsSending] = useState(false);

  // chat messages array
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  // copy-to-clipboard UX states
  const [isCopied, setIsCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string>('');

  const askAIMutation = useAskAIChatbotApi();
  const deleteResearchMutation = useDeleteResearchCustomConversation();
  const [inputValue, setInputValue] = useState('');
  const [isCustomResearchAvailable, setIsCustomResearchAvailable] =
    useState<boolean>(false);

  // query to load custom chat conversation (if provided)
  const { data: customResearchChatConversation } = useQuery({
    queryKey: [
      'customResearchChatConversation',
      custom_research_id,
      insight_id,
    ],
    queryFn: () => getCustomResearchChatHistory(custom_research_id ?? ''),
    refetchOnWindowFocus: false,
    enabled: !!custom_research_id && !!insight_id && showSideChatbot,
  });

  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Helper to copy text and give quick feedback
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // swallow errors for clipboard (optional: show toast)
    });
    setIsCopied(true);
    setCopiedId(id);
    setTimeout(() => {
      setIsCopied(false);
      setCopiedId('');
    }, 2000);
  };

  // Confirmation popup for clearing custom conversation
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const handleClearCustomConversation = () => {
    setShowClearConfirm(true);
  };
  const handleClearConfirmYes = async () => {
    setChatHistory(systemGeneratedResearch || []);
    setInputValue('');
    setShowClearConfirm(false);
    try {
      await deleteResearchMutation.mutateAsync(custom_research_id);
      toast.success('Custom conversation cleared');
    } catch (error) {
      console.log(error);
    }
  };
  const handleClearConfirmNo = () => {
    setShowClearConfirm(false);
  };

  // Send message handler. newInputValue optional used for "Try again"
  const handleSendMessage = async (
    event?: React.FormEvent | React.MouseEvent,
    newInputValue?: string,
    isTryAgain?: boolean
  ) => {
    // when called from onClick handlers we might get a MouseEvent; for onSubmit we get FormEvent
    event?.preventDefault();

    // Make copy of chat history when trying again and remove last (previous failed) entry
    if (isTryAgain === true) {
      setChatHistory((prev) => {
        const copy = [...prev];
        copy.pop();
        return copy;
      });
    }

    const queryText = newInputValue ?? inputValue;
    if (!queryText || !queryText.trim()) return;

    // append user entry with a placeholder agent (loading)
    setChatHistory((prev) => [
      ...prev,
      {
        user: queryText,
        agent: '',
        source: null,
        loading: true,
        error: false,
        timedOut: false,
      },
    ]);

    // start sending
    setIsSending(true);

    const payload = {
      insight_instance_id: insight_id,
      type: 'research',
      query: queryText,
      org_id:
        typeof window !== 'undefined' ? localStorage.getItem('org_id') : null,
      // add other fields if required
    };

    setInputValue('');

    const TIMEOUT_DURATION = 120000;
    let timeoutId: any = null;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error('Request timed out')),
        TIMEOUT_DURATION
      );
    });

    try {
      const response: any = await Promise.race([
        askAIMutation.mutateAsync(payload),
        timeoutPromise,
      ]);
      // clear timer if API resolved first
      if (timeoutId) clearTimeout(timeoutId);

      setIsSending(false);

      const isFailure = response?.data?.success === false;
      const isBadRequest = isFailure && response?.data?.status === 402;
      const agentMessage = isFailure
        ? isBadRequest
          ? response?.data?.message
          : 'Sorry, I am unable to respond to your query'
        : response?.data?.answer ?? '';

      const sources = isFailure ? [] : response?.data?.source_documents ?? [];
      const error = isFailure;
      const loading = false;

      setChatHistory((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            agent: agentMessage,
            source: sources,
            loading,
            error,
          };
        }
        return updated;
      });
    } catch (err: any) {
      if (timeoutId) clearTimeout(timeoutId);
      setIsSending(false);

      setChatHistory((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            agent:
              err?.message === 'Request timed out'
                ? 'Request timed out'
                : 'Sorry, I am unable to respond to your query',
            source: [],
            loading: false,
            error: true,
            timedOut: err?.message === 'Request timed out',
          };
        }
        return updated;
      });
    }
  };

  // scroll to bottom when chatHistory changes
  useEffect(() => {
    // prefer refs instead of document.getElementById
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // handle Escape & body overflow when modal opens/closes
  useEffect(() => {
    if (showSideChatbot) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSideChatbox(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSideChatbot, setShowSideChatbox]);

  // When researchArray prop changes (system generated), populate chatHistory
  useEffect(() => {
    if (
      Array.isArray(researchArray) &&
      researchArray.length > 0 &&
      showSideChatbot
    ) {
      const researchHistory = researchArray.map((item: any) => ({
        user: item?.question || '',
        agent: item?.answer || '',
        type: item?.type || '',
        source: Array.isArray(item?.source) ? item.source : [],
        loading: false,
        error: false,
        timedOut: false,
      }));
      setChatHistory(researchHistory);
    } else if (!customResearchChatConversation) {
      // if there is no custom research loaded, clear the chat (only when researchArray is empty)
      setChatHistory([]);
    }
  }, [researchArray, showSideChatbot, customResearchChatConversation]);

  // Append custom conversation once query finishes loading data
  useEffect(() => {
    if (
      showSideChatbot &&
      customResearchChatConversation &&
      Array.isArray(customResearchChatConversation?.data) &&
      customResearchChatConversation.data.length > 0
    ) {
      setIsCustomResearchAvailable(true);

      const customArr = customResearchChatConversation.data.map(
        (item: any) => ({
          user: item?.user || '',
          agent: item?.agent || '',
          type: 'custom',
          source: Array.isArray(item?.source_documents)
            ? item.source_documents
            : [],
          loading: false,
          error: false,
          timedOut: false,
        })
      );

      // append custom conversation after the existing history (preserve system messages)
      setChatHistory((prev) => {
        // Avoid duplicating: if prev already contains identical conversation, skip append
        const alreadyAppended = prev.some(
          (p) => p.type === 'custom' && p.user === customArr[0]?.user
        );
        if (alreadyAppended) return prev;
        return [...prev, ...customArr];
      });
    } else {
      // if no custom conversation returned, check if user has started a custom conversation in this session
      if (
        !customResearchChatConversation ||
        !customResearchChatConversation?.data?.length
      ) {
        // If chatHistory contains any custom message, set as available
        const hasCustom = chatHistory.some((msg) => msg.type !== 'system');
        setIsCustomResearchAvailable(hasCustom);
      }
    }
  }, [customResearchChatConversation, showSideChatbot, chatHistory]);

  const systemGeneratedResearch = chatHistory.filter(
    (item) =>
      item?.type &&
      typeof item?.type === 'string' &&
      item.type.toLowerCase() === 'system'
  );

  // render
  return (
    <div>
      {showSideChatbot && (
        <div
          // className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[500]`}
          className={`h-[calc(100vh-3.8rem)] flex `}
          onClick={() => {
            setShowSideChatbox(false);
          }}
        >
          <div
            // className={`relative w-[850px] ml-auto z-[501] overflow-hidden h-[100vh] bg-gray-50 translate-x-0 transition-transform duration-700 ease-in-out`}
            className={`relative overflow-hidden w-[570px] border-l-[1px] border-gray-200 bg-white`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="border-b-[1px] border-gray-200 px-[20px] py-[15px] flex justify-between">
              <h3 className="text-[14px] !font-normal text-gray-700 leading-5">
                {`Research run on ${title}`}
              </h3>
              <button
                onClick={() => {
                  setShowSideChatbox(false);
                  setChatHistory([]);
                }}
                className="text-[14px] !font-normal text-gray-700 leading-5 text-center"
                aria-label="Close chat"
              >
                {/* &#x2715; */}
                Close
              </button>
            </div>

            <div className="border-b-[1px] border-gray-200 px-5 py-2 flex justify-end mb-2">
              <div
                className="text-[14px] text-[#3B82F6] cursor-pointer leading-5 font-normal"
                onClick={handleClearCustomConversation}
              >
                Clear custom conversation
              </div>
            </div>
            {/* Confirmation popup for clear custom conversation */}
            {showClearConfirm && (
              <ConfirmationPopUp
                header={'Permanently delete this conversation?'}
                modalOpen={showClearConfirm}
                handleCancel={handleClearConfirmNo}
                handleYes={handleClearConfirmYes}
                yesText={'Yes'}
                noText={'No'}
                title={"You won't be able to retrieve it after it's cleared."}
              />
            )}

            <div
              ref={scrollContainerRef}
              className="flex flex-col h-[calc(100vh-13rem)] overflow-y-auto px-[24px] w-full scroll"
            >
              {/* System Divider */}
              {Array.isArray(systemGeneratedResearch) &&
                systemGeneratedResearch.length > 0 && (
                  <div className="flex items-center justify-center my-6 w-full">
                    <div className="flex-grow border-t border-gray-200 h-px ml-4" />
                    <span className="mx-4 text-[14px] text-gray-400 leading-5">
                      System generated
                    </span>
                    <div className="flex-grow border-t border-gray-200 h-px mr-4" />
                  </div>
                )}

              {/* render system messages first */}
              {Array.isArray(chatHistory) &&
                chatHistory.length > 0 &&
                chatHistory
                  .filter(
                    (item) =>
                      item?.type &&
                      typeof item.type === 'string' &&
                      item.type.toLowerCase() === 'system'
                  )
                  .map((message: any, idx: number) => (
                    <div
                      key={`system-${idx}`}
                      className="flex flex-col w-full gap-5 mb-3 last:!mb-0"
                    >
                      {/* User Message */}
                      <div className="flex justify-end w-full">
                        <p className="max-w-[600px] bg-gray-200 text-gray-800 text-[14px] leading-5 px-[16px] py-[12px] rounded-[6px]">
                          {message.user}
                        </p>
                      </div>

                      {/* Agent Message */}
                      <div className="flex justify-start w-full">
                        <div className="flex items-start max-w-[600px]">
                          <div className="mr-2 mt-[4px] w-[5%]">
                            <AakAIIcon />
                          </div>

                          <div>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {String(message.agent ?? '')}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-[10px]">
                          <div className="w-[2%]" />
                          <button
                            className="px-[10px] py-[8px] rounded-[6px] bg-gray-100 flex"
                            onClick={() =>
                              handleCopy(
                                String(message.agent ?? ''),
                                `SystemMessage-${idx}`
                              )
                            }
                            title="Copy"
                          >
                            {/* copy icon */}
                            <svg
                              width="17"
                              height="16"
                              viewBox="0 0 17 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5.59863 2H10.332C11.8254 2 12.5722 2 13.1426 2.29065C13.6444 2.54631 14.0523 2.95426 14.308 3.45603C14.5986 4.02646 14.5986 4.77319 14.5986 6.26667V11M4.73197 14H10.132C10.8787 14 11.2521 14 11.5373 13.8547C11.7882 13.7268 11.9921 13.5229 12.12 13.272C12.2653 12.9868 12.2653 12.6134 12.2653 11.8667V6.46667C12.2653 5.71993 12.2653 5.34656 12.12 5.06135C11.9921 4.81046 11.7882 4.60649 11.5373 4.47866C11.2521 4.33333 10.8787 4.33333 10.132 4.33333H4.73197C3.98523 4.33333 3.61186 4.33333 3.32665 4.47866C3.07576 4.60649 2.87179 4.81046 2.74396 5.06135C2.59863 5.34656 2.59863 5.71993 2.59863 6.46667V11.8667C2.59863 12.6134 2.59863 12.9868 2.74396 13.272C2.87179 13.5229 3.07576 13.7268 3.32665 13.8547C3.61186 14 3.98523 14 4.73197 14Z"
                                stroke="#637083"
                                strokeWidth="1.33333"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>

                            {copiedId === `SystemMessage-${idx}` &&
                              isCopied && (
                                <span className="text-[14px] text-gray-500 ml-[4px] mt-[-2px]">
                                  Copied
                                </span>
                              )}
                          </button>

                          {message?.source?.length > 0 && message?.source && (
                            <Tippy
                              interactive
                              trigger="click"
                              placement="top-start"
                              arrow={false}
                              offset={[0, 6]}
                              className="!border !border-gray-200 !shadow-md !max-w-[410px] !rounded-lg !bg-white !max-h-[230px] overflow-y-auto scroll"
                              content={
                                <ul>
                                  <div className="p-[11px]">
                                    {message?.source?.map(
                                      (src: any, sidx: number) => (
                                        <li
                                          key={sidx}
                                          className="pb-4 last:pb-0"
                                        >
                                          <a
                                            href={
                                              src?.conversation_id && src?.uri
                                                ? `/app/emails?email_message_id=${src?.uri}`
                                                : src?.url
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <h1
                                              className="text-[14px] font-normal text-[#3B82F6] leading-5"
                                              title={
                                                src?.title || src?.file_name
                                              }
                                            >
                                              {src?.title || src?.file_name}
                                            </h1>
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </div>
                                </ul>
                              }
                            >
                              <button className="flex items-center px-[10px] py-[6px] bg-gray-100 text-[14px] text-gray-500 rounded-[6px]">
                                <span>Sources</span>
                                <ChevronDown className="relative left-[5px] top-[1px] h-[16px] w-[16px] text-gray-500" />
                              </button>
                            </Tippy>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

              {/* Custom Divider */}
              {isCustomResearchAvailable && (
                <div className="flex items-center justify-center my-6 w-full">
                  <div className="flex-grow border-t border-gray-200 h-px ml-4" />
                  <span className="mx-4 text-[14px] text-gray-400 leading-5">
                    Custom
                  </span>
                  <div className="flex-grow border-t border-gray-200 h-px mr-4" />
                </div>
              )}

              {/* Chat History (non-system) */}
              {chatHistory.length > 0 &&
                chatHistory
                  .filter(
                    (item) =>
                      !item?.type ||
                      (typeof item.type === 'string' &&
                        item.type.toLowerCase() !== 'system')
                  )
                  .map((message: any, idx: number) => (
                    <div
                      key={`chat-${idx}`}
                      className="flex flex-col w-full gap-5 mb-3 last:!mb-0"
                    >
                      <div className="flex justify-end w-full">
                        <p className="max-w-[600px] bg-gray-200 text-gray-800 text-[14px] leading-5 px-[16px] py-[12px] rounded-[6px]">
                          {message.user}
                        </p>
                      </div>

                      <div className="flex justify-start w-full">
                        <div className="flex items-start max-w-[600px]">
                          <div className="mr-2 mt-[4px] w-[5%]">
                            <AakAIIcon />
                          </div>

                          {message.loading ? (
                            <svg
                              width="208"
                              height="20"
                              viewBox="0 0 208 20"
                              fill="none"
                              className="mt-1"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                opacity="0.2"
                                x="0.598633"
                                width="207"
                                height="20"
                                rx="6"
                                fill="url(#paint0_linear_4599_165559)"
                              />
                              <defs>
                                <linearGradient
                                  id="paint0_linear_4599_165559"
                                  x1="207.599"
                                  y1="10"
                                  x2="0.598633"
                                  y2="10"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#3B82F6" stopOpacity="0.3" />
                                  <stop offset="1" stopColor="#3770CE" />
                                </linearGradient>
                              </defs>
                            </svg>
                          ) : (
                            <div>
                              {message.timedOut ? (
                                <span className="text-[14px] font-[500] text-gray-500">
                                  Request timed out.{' '}
                                  <span
                                    onClick={(e) =>
                                      handleSendMessage(
                                        e as any,
                                        message.user,
                                        true
                                      )
                                    }
                                    className="text-[14px] font-[500] text-[#3B82F6] hover:no-underline cursor-pointer"
                                  >
                                    Try again
                                  </span>
                                </span>
                              ) : (
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {String(message.agent ?? '')}
                                </ReactMarkdown>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* actions: copy / sources */}
                      {message.error || message?.loading ? null : (
                        <div>
                          <div className="flex items-center gap-[10px]">
                            <div className="w-[2%]" />
                            <button
                              className="px-[10px] py-[8px] rounded-[6px] bg-gray-100 flex"
                              onClick={() =>
                                handleCopy(
                                  String(message.agent ?? ''),
                                  `ChatMessage-${idx}`
                                )
                              }
                              title="Copy"
                            >
                              <svg
                                width="17"
                                height="16"
                                viewBox="0 0 17 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M5.59863 2H10.332C11.8254 2 12.5722 2 13.1426 2.29065C13.6444 2.54631 14.0523 2.95426 14.308 3.45603C14.5986 4.02646 14.5986 4.77319 14.5986 6.26667V11M4.73197 14H10.132C10.8787 14 11.2521 14 11.5373 13.8547C11.7882 13.7268 11.9921 13.5229 12.12 13.272C12.2653 12.9868 12.2653 12.6134 12.2653 11.8667V6.46667C12.2653 5.71993 12.2653 5.34656 12.12 5.06135C11.9921 4.81046 11.7882 4.60649 11.5373 4.47866C11.2521 4.33333 10.8787 4.33333 10.132 4.33333H4.73197C3.98523 4.33333 3.61186 4.33333 3.32665 4.47866C3.07576 4.60649 2.87179 4.81046 2.74396 5.06135C2.59863 5.34656 2.59863 5.71993 2.59863 6.46667V11.8667C2.59863 12.6134 2.59863 12.9868 2.74396 13.272C2.87179 13.5229 3.07576 13.7268 3.32665 13.8547C3.61186 14 3.98523 14 4.73197 14Z"
                                  stroke="#637083"
                                  strokeWidth="1.33333"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {copiedId === `ChatMessage-${idx}` &&
                                isCopied && (
                                  <span className="text-[14px] text-gray-500 ml-[4px] mt-[-2px]">
                                    Copied
                                  </span>
                                )}
                            </button>

                            {message?.source?.length > 0 && message?.source && (
                              <Tippy
                                interactive
                                trigger="click"
                                placement="top-start"
                                arrow={false}
                                offset={[0, 6]}
                                className="!border !border-gray-200 !shadow-md !max-w-[410px] !rounded-lg !bg-white !max-h-[230px] overflow-y-auto scroll"
                                content={
                                  <ul>
                                    <div className="p-[11px]">
                                      {message?.source?.map(
                                        (src: any, sidx: number) => (
                                          <li
                                            key={sidx}
                                            className="pb-4 last:pb-0"
                                          >
                                            <a
                                              href={
                                                src?.conversation_id && src?.uri
                                                  ? `/app/emails?email_message_id=${src?.uri}`
                                                  : src?.url
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              <h1
                                                className="text-[14px] font-normal text-[#3B82F6] leading-5"
                                                title={
                                                  src?.title || src?.file_name
                                                }
                                              >
                                                {src?.title || src?.file_name}
                                              </h1>
                                            </a>
                                          </li>
                                        )
                                      )}
                                    </div>
                                  </ul>
                                }
                              >
                                <button className="flex items-center px-[10px] py-[6px] bg-gray-100 text-[14px] text-gray-500 rounded-[6px]">
                                  <span>Sources</span>
                                  <ChevronDown className="relative left-[5px] top-[1px] h-[16px] w-[16px] text-gray-500" />
                                </button>
                              </Tippy>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

              <div ref={lastMessageRef} id="lastMessage" className="py-8" />
            </div>

            {/* Input Section */}
            <form
              onSubmit={(e) => handleSendMessage(e)}
              className="flex items-center px-[20px] bottom-4 absolute w-full"
            >
              <div
                // className="flex items-center w-full shadow-customForInput bg-white rounded-[100px] h-[50px]"
                className="flex items-center w-full shadow-customForInput bg-white rounded-[100px] h-[50px]"
                style={{ zIndex: 502 }}
              >
                <input
                  type="text"
                  placeholder="Ask me anything"
                  value={inputValue}
                  autoFocus
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-grow mx-[20px] w-[90%] focus:outline-none"
                  aria-label="Ask a question"
                  onKeyDown={(e) => {
                    // optional: support Shift+Enter for newline; Enter to submit is already handled by form submit
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isSending}
                  className="bg-blue-500 text-white rounded-full w-[30px] h-[30px] text-center mx-[10px] my-[10px] disabled:bg-gray-200"
                  aria-label="Send message"
                >
                  <Send className="h-[12px] w-[12px] mx-auto" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchChatbotModal;
