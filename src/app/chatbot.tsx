import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { MultiValue } from 'react-select';
import { getAllDirectAssignedCustomers } from './api/customers/customers';
import { Dropdown } from '../common/Dropdown';
import { ChevronDown, Send } from 'lucide-react';
import { useAskAIChatbotApi } from '../services/mutations/askAIMutations';
import { AakAIIcon, DefaultImg } from './assests/icons/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Tippy from '@tippyjs/react';
import { useParams } from 'next/navigation';
import { useHeaderContext } from './app/headerContext';
import { getPrompts } from './api/askAI/askAI';
import { useMixpanel } from '../common/mixpanel/useMixpanel';
import CustomerDropdown from './customerdropdown/customerDropdown';
interface Props {
  setShowSideChatbox: any;
  showSideChatbot: any;
  user_id?: string;
}
interface Option {
  value: string[] | string;
  label: string;
  sources?: any[];
}

const ChatbotModal = ({
  setShowSideChatbox,
  showSideChatbot,
  user_id,
}: Props) => {
  const { headerVariable } = useHeaderContext();
  const [disabled, setDisabled] = useState(true);
  const [chatHistory, setChatHistory] = useState<any>([]);
  const [isCopied, setIsCopied] = useState(false);
  const [company, setCompany] = useState({ label: '', value: '' });
  const [copiedId, setCopiedId] = useState('');
  const [source, setSource] = useState({
    label: 'Account',
    value: ['account'],
    sources: ['Adoption', 'Impact', 'Health'],
  });
  const { id } = useParams();
  const [selectedOption, setSelectedOption] = useState('company');

  const { data: allDirectAssignedCustomers } = useQuery({
    queryKey: ['getAllDirectAssignedCustomers'],
    queryFn: getAllDirectAssignedCustomers,
    refetchOnWindowFocus: false,
  });

  const { data: allPrompts } = useQuery({
    queryKey: ['getAllPrompts'],
    queryFn: getPrompts,
    refetchOnWindowFocus: false,
  });

  const { trackEvent, MIXPANEL_EVENTS } = useMixpanel();
  const askAIMutation = useAskAIChatbotApi();

  const handleOptionChange = (e: any) => {
    setChatHistory([]);
    setSelectedOption(e.target.value);
  };
  const customer_id = id ? id : headerVariable;
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async (
    event: any,
    newInputValue?: string,
    isTryAgain?: boolean
  ) => {
    event?.preventDefault();

    if (isTryAgain == true) {
      const charArr: any[] = chatHistory;

      charArr?.pop();

      setChatHistory(charArr);
    }

    const queryText = newInputValue ? newInputValue : inputValue;
    if (!queryText || !queryText.trim()) return;

    setChatHistory((prev: any) => [
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

    let payload;
    setDisabled(false);

    if (selectedOption === 'company') {
      payload = {
        customer_id: company?.value,
        chat_history: chatHistory?.filter((ele: any) => ele?.error == false),
        query: queryText,
        type: selectedOption,
        source: source?.value[0] ? source?.value[0] : '',
        user_id,
      };
    } else {
      payload = {
        chat_history: chatHistory?.filter((ele: any) => ele?.error == false),
        query: queryText,
        type: selectedOption === 'global' ? null : selectedOption,
        user_id,
      };
    }
    setInputValue('');
    const TIMEOUT_DURATION = 120000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), TIMEOUT_DURATION)
    );

    try {
      const response: any = await Promise.race([
        askAIMutation.mutateAsync(payload),
        timeoutPromise,
      ]);
      setDisabled(true);

      trackEvent('AskAI Interaction', {
        // query: queryText,
        type: selectedOption,
        context: selectedOption === 'company' ? company?.value : '',
        success: true,
        response_length: response?.data?.length,
      });

      const isFailure = response?.data?.success === false;
      const isBadRequest = isFailure && response?.data?.status === 402;
      const agentMessage = isFailure
        ? isBadRequest
          ? response?.data?.message
          : 'Sorry, I am unable to respond to your query'
        : response?.data?.answer;

      const sources = isFailure ? [] : response?.data?.source_documents;
      const error = isFailure;
      const loading = false;
      setChatHistory((prev: any) => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1] = {
          ...updatedHistory[updatedHistory.length - 1],
          agent: agentMessage,
          source: sources,
          loading,
          error,
        };
        return updatedHistory;
      });
    } catch (error: any) {
      setDisabled(true);
      trackEvent('AskAI Interaction', {
        // query: queryText,
        type: selectedOption,
        context: selectedOption === 'company' ? company?.value : '',
        success: false,
        error: error?.toString(),
      });
      setChatHistory((prev: any) => {
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1] = {
          ...updatedHistory[updatedHistory.length - 1],
          agent:
            error.message === 'Request timed out'
              ? 'Request timed out'
              : 'Sorry, I am unable to respond to your query',
          source: [],
          loading: false,
          error: true,
          timedOut: error.message === 'Request timed out',
        };
        return updatedHistory;
      });
    }
  };

  useEffect(() => {
    if (allDirectAssignedCustomers?.data?.length > 0) {
      const customer = allDirectAssignedCustomers?.data?.filter(
        (ele: any) => ele?.customer_id == customer_id
      );
      if (customer_id && customer?.length > 0 && chatHistory?.length == 0) {
        setCompany({
          label: customer[0]?.customer_name,
          value: customer[0]?.customer_id,
        });
      } else if (
        allDirectAssignedCustomers?.data?.length > 0 &&
        chatHistory?.length == 0 &&
        !company?.value
      ) {
        setCompany({
          label: allDirectAssignedCustomers?.data[0]?.customer_name,
          value: allDirectAssignedCustomers?.data[0]?.customer_id,
        });
      }
    }
  }, [allDirectAssignedCustomers, customer_id]);

  useEffect(() => {
    document
      ?.getElementById('lastMessage')
      ?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

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
      document.body.classList.remove('overflow-hidden'); // Ensure overflow is reset
      window.removeEventListener('keydown', handleKeyDown);
      // setCompany({
      //   label: allCustomers?.data[0]?.customer_name,
      //   value: allCustomers?.data[0]?.customer_id,
      // });
    };
  }, [showSideChatbot, setShowSideChatbox]);

  return (
    <div>
      <div
        className={`${
          showSideChatbot
            ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[500]'
            : 'hidden'
        }`}
        onClick={() => {
          setSource({
            label: 'Account',
            value: ['account'],
            sources: ['Adoption', 'Impact', 'Health'],
          }),
            setShowSideChatbox(false);
        }}
      >
        <div className=""></div>
        <div
          className={`relative w-[850px] ml-auto z-[501] overflow-hidden bg-gray-50 ${
            showSideChatbot ? 'translate-x-0' : 'translate-x-full'
          }  transition-transform duration-800 ease-in-out      
  `}
          style={{ height: '100dvh' }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="border-b-[1px] border-gray-200 px-[20px] py-[15px] flex justify-between">
            <h3 className="text-[16px] !font-[400] text-gray-800">Ask AI</h3>
            <button
              onClick={() => {
                setSource({
                  label: 'Account',
                  value: ['account'],
                  sources: ['Adoption', 'Impact', 'Health'],
                });
                setShowSideChatbox(false);
                setChatHistory([]);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              &#x2715;
            </button>
          </div>
          <div className="border-b-[1px] border-gray-200 px-[20px] py-[22px]  flex justify-between mb-2">
            <div className="flex">
              {/* Radio Button 1 */}
              <label className="inline-flex items-center mr-[24px]">
                <input
                  type="radio"
                  value="company"
                  checked={selectedOption === 'company'}
                  onChange={handleOptionChange}
                  className="form-radio text-blue-600 cursor-pointer focus:ring-blue-500 w-[20px] h-[20px]"
                />
                <span className="text-gray-800 text-[14px] ml-[8px] cursor-pointer">
                  About customer
                </span>
              </label>

              {/* Radio Button 2 */}
              <label className="inline-flex items-center mx-[24px]">
                <input
                  type="radio"
                  value="knowledge"
                  checked={selectedOption === 'knowledge'}
                  onChange={handleOptionChange}
                  className="form-radio text-blue-600 cursor-pointer focus:ring-blue-500 w-[20px] h-[20px]"
                />
                <span className="text-gray-800 text-[14px] ml-[8px] cursor-pointer">
                  Knowledge base
                </span>
              </label>

              {/* Radio Button 3 */}
              {/* <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="global"
                  checked={selectedOption === 'global'}
                  onChange={handleOptionChange}
                  className="form-radio text-blue-600 cursor-pointer focus:ring-blue-500 w-[20px] h-[20px]"
                />
                <span className="text-gray-800 text-[14px] ml-[8px] cursor-pointer">
                  Global
                </span>
              </label> */}
            </div>
            {chatHistory?.length > 0 ? (
              <div
                className="text-[14px] text-[#3B82F6] cursor-pointer"
                onClick={() => {
                  setChatHistory([]);
                  setInputValue('');
                }}
              >
                Clear
              </div>
            ) : (
              ''
            )}
          </div>
          {selectedOption === 'company' ? (
            <div className="border-b-[1px] border-gray-200 px-[20px] py-[16px] mb-3 flex justify-between">
              <div className="flex flex-grow">
                <div className="mr-[12px]">
                  <CustomerDropdown
                    // placeholder={company?.label}
                    selectedName={company?.label}
                    data={allDirectAssignedCustomers?.data}
                    setFilterOption={setCompany}
                    setChatHistory={setChatHistory}
                  />
                </div>

                <RenderDropdown
                  placeholder="sources"
                  label={source?.label}
                  options={[
                    {
                      label: 'Account',
                      value: ['account'],
                      sources: ['Adoption', 'Impact', 'Health'],
                    },
                    {
                      label: 'External sources',
                      value: ['external'],
                      sources: ['News', 'Press-releases'],
                    },
                    {
                      label: 'Communication',
                      value: ['communication'],
                      sources: ['Emails', 'Online meetings'],
                    },
                    {
                      label: 'Documents',
                      value: ['documents'],
                      sources: ['Customer-specific documents'],
                    },
                  ]}
                  setFilterOption={setSource}
                />
              </div>
            </div>
          ) : (
            ''
          )}
          <div
            className={`flex ${
              chatHistory?.length != 0 ? '' : ' flex-col items-center'
            } justify-center overflow-y-auto mx-[20px] scroll`}
            style={{
              height:
                selectedOption === 'company'
                  ? 'calc(100dvh - 16rem)'
                  : 'calc(100dvh - 11rem)',
            }}
          >
            <div className={`t-[25px] w-full place-content-end`}>
              {chatHistory?.length != 0 ? (
                <>
                  {chatHistory.map((message: any, index: number) => (
                    <div key={index} className="mb-4 w-full ">
                      {/* User Message */}
                      <div className="text-right">
                        <p className="inline-block bg-gray-200 text-gray-800 text-[14px] px-[16px] py-[12px] rounded-[6px]">
                          {message.user}
                        </p>
                      </div>
                      {/* Agent Message */}
                      <div className="text-left mt-2 flex">
                        <div className="w-[5%] mt-[4px]">
                          <AakAIIcon />
                        </div>
                        <div className="w-[95%]">
                          {message?.loading ? (
                            <>
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
                                    <stop
                                      stopColor="#3B82F6"
                                      stopOpacity="0.3"
                                    />
                                    <stop offset="1" stopColor="#3770CE" />
                                  </linearGradient>
                                </defs>
                              </svg>
                            </>
                          ) : (
                            <div className="">
                              {message.timedOut ? (
                                <span className="text-[14px] font-[500] text-gray-500">
                                  Request timed out.
                                  <span
                                    onClick={(e) =>
                                      handleSendMessage(e, message.user, true)
                                    }
                                    className="text-[14px] font-[500] text-[#3B82F6] hover:no-underline cursor-pointer"
                                  >
                                    Try again
                                  </span>
                                </span>
                              ) : (
                                <ReactMarkdown
                                  children={message.agent}
                                  remarkPlugins={[remarkGfm]}
                                  className={
                                    message?.error
                                      ? 'text-gray-500 relative top-[3px]'
                                      : 'markdown list-inside'
                                  }
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {message.error || message?.loading ? (
                        ''
                      ) : (
                        <div>
                          <div className="flex items-center gap-[10px]">
                            <div className="w-[3%]"></div>
                            <button
                              className="px-[10px] py-[8px] rounded-[6px] mt-[20px] bg-gray-100 flex"
                              onClick={() => {
                                navigator.clipboard.writeText(message.agent);
                                setIsCopied(true);
                                setCopiedId('Message-' + index);
                                setTimeout(() => {
                                  setIsCopied(false);
                                  setCopiedId('');
                                }, 2000);
                              }}
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
                              {copiedId === 'Message-' + index && (
                                <span
                                  className={`${
                                    isCopied && copiedId === 'Message-' + index
                                      ? '  '
                                      : 'hidden'
                                  } text-[14px] text-gray-500 ml-[4px] mt-[-2px]`}
                                >
                                  Copied
                                </span>
                              )}
                            </button>
                            {message?.source?.length > 0 && message?.source && (
                              <Tippy
                                interactive={true}
                                trigger="click"
                                placement="top-start"
                                className={`border border-gray-300 !max-w-[410px] rounded-[6px] py-[20px] !bg-white `}
                                content={
                                  <ul className="text-sm text-gray-700 mx-auto">
                                    <li className="text-[14px] text-gray-500 px-[20px]">
                                      Sources
                                    </li>
                                    <div className="max-h-[230px] overflow-hidden overflow-y-auto scroll px-[20px]">
                                      {message?.source?.length > 0 &&
                                        message?.source &&
                                        message?.source?.map(
                                          (ele: any, i: number) => (
                                            <li key={i}>
                                              <a
                                                href={
                                                  ele?.conversation_id &&
                                                  ele?.uri
                                                    ? `/app/emails?email_message_id=${ele?.uri}`
                                                    : ele?.url
                                                }
                                                target="_blank"
                                              >
                                                <div className="my-[10px] bg-white hover:!no-underline border-[1px] border-gray-300 rounded-[6px] px-[16px] py-[12px] !max-w-[370px] flex between gap-[15px]">
                                                  {ele?.image ? (
                                                    <img
                                                      src={ele?.image}
                                                      className="w-[44px] h-[44px] rounded-[6px]"
                                                      alt={ele?.title}
                                                    />
                                                  ) : (
                                                    <DefaultImg className="w-[44px] h-[44px] rounded-[6px]" />
                                                  )}
                                                  <span className="w-[283px]">
                                                    <h1 className="text-[14px] font-[600] text-gray-900">
                                                      {ele?.title
                                                        ? ele?.title
                                                        : ele?.file_name}
                                                    </h1>
                                                    {/* <p
                                                    title={ele?.title}
                                                    className="w-[283px] text-gray-600 text-[14px] my-[0px] overflow-hidden text-ellipsis whitespace-nowrap"
                                                  >
                                                    {ele?.title}
                                                  </p> */}
                                                  </span>
                                                </div>
                                              </a>
                                            </li>
                                          )
                                        )}
                                    </div>
                                  </ul>
                                }
                              >
                                <button className="flex items-center px-[10px] py-[6px] mt-[20px] bg-gray-100 text-[14px] text-gray-500 rounded-[6px]">
                                  <span>
                                    From {message?.source?.length} sources
                                  </span>
                                  <ChevronDown className="relative left-[5px] top-[1px] h-[16px] w-[16px] text-gray-500" />
                                </button>
                              </Tippy>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div id="lastMessage" className="py-2"></div>
                </>
              ) : (
                <>
                  {selectedOption === 'company' &&
                  allPrompts?.data?.length > 0 ? (
                    <>
                      <p className="text-gray-500 mb-[12px] text-center text-[16px]">
                        Ask me anything or pick a suggestion to get started
                      </p>

                      <div className="flex gap-2.5 justify-center flex-wrap">
                        {allPrompts?.data?.map((ele: any, i: number) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              handleSendMessage(e, ele?.keyword);
                            }}
                            className="bg-white border-[1px] border-gray-200 rounded-[6px] px-[16px] py-[6px] text-gray-800"
                          >
                            {ele?.text ?? ele?.keyword}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : selectedOption === 'knowledge' ? (
                    <>
                      <svg
                        width="150"
                        height="151"
                        viewBox="0 0 150 151"
                        fill="none"
                        className="m-auto"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M146.875 36.1342H137.949V29.4174C137.949 28.1657 137.202 27.0348 136.051 26.5432C117.199 18.4959 94.006 21.9065 74.9998 35.3871C55.994 21.9065 32.8 18.4969 13.9493 26.5432C12.7978 27.0348 12.051 28.1657 12.051 29.4174V36.1342H3.12495C1.39934 36.1342 0 37.5332 0 39.2591V125.635C0 127.361 1.39934 128.76 3.12495 128.76H75.0002H146.875C148.601 128.76 150 127.361 150 125.635V39.2595C150 37.5335 148.601 36.1342 146.875 36.1342ZM6.24991 122.51V42.3844H12.051V115.794C12.051 116.843 12.5782 117.823 13.4539 118.401C14.3298 118.979 15.4372 119.079 16.4027 118.667C31.0404 112.419 48.7174 113.982 64.4069 122.51H6.24991ZM71.8752 119.66C60.4697 112.392 47.7823 108.618 35.5355 108.618C29.6229 108.618 23.8139 109.498 18.3013 111.289V39.2956C18.3013 39.2833 18.3032 39.2715 18.3032 39.2595C18.3032 39.2474 18.3016 39.2353 18.3013 39.2233V31.5312C34.9693 25.2838 55.1802 28.7776 71.8752 40.8353V119.66ZM78.1251 40.8353C94.8198 28.7773 115.032 25.2838 131.699 31.5312V39.223C131.699 39.235 131.697 39.2471 131.697 39.2591C131.697 39.2712 131.699 39.2833 131.699 39.2953V111.288C114.767 105.788 95.0366 108.883 78.1251 119.66V40.8353ZM143.75 122.51H85.5928C101.283 113.982 118.959 112.419 133.597 118.667C134.563 119.08 135.671 118.98 136.546 118.401C137.422 117.823 137.949 116.843 137.949 115.794V42.3844H143.75V122.51Z"
                          fill="#E4E7EC"
                        />
                      </svg>
                      <p className="text-gray-500 mt-[12px] text-center text-[16px]">
                        You can find answers to your questions in the company's
                        knowledge-base
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        width="120"
                        height="121"
                        viewBox="0 0 120 121"
                        fill="none"
                        className="m-auto"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_4599_146336)">
                          <path
                            d="M71.25 23H26.25C24.18 23 22.5 24.68 22.5 26.75C22.5 28.82 24.18 30.5 26.25 30.5H71.25C73.32 30.5 75 28.82 75 26.75C75 24.68 73.32 23 71.25 23Z"
                            fill="#E4E7EC"
                          />
                          <path
                            d="M56.25 38H26.25C24.18 38 22.5 39.68 22.5 41.75C22.5 43.82 24.18 45.5 26.25 45.5H56.25C58.32 45.5 60 43.82 60 41.75C60 39.68 58.32 38 56.25 38Z"
                            fill="#E4E7EC"
                          />
                          <path
                            d="M82.5 0.5H15C6.7275 0.5 0 7.2275 0 15.5V90.5C0 91.955 0.84 93.2825 2.16 93.8975C2.6625 94.13 3.21 94.25 3.75 94.25C4.6125 94.25 5.4675 93.95 6.15 93.38L27.6075 75.5H82.5C90.7725 75.5 97.5 68.7725 97.5 60.5V15.5C97.5 7.2275 90.7725 0.5 82.5 0.5ZM90 60.5C90 64.6325 86.64 68 82.5 68H26.25C25.3725 68 24.525 68.3075 23.85 68.87L7.5 82.4975V15.5C7.5 11.3675 10.86 8 15 8H82.5C86.64 8 90 11.3675 90 15.5V60.5Z"
                            fill="#E4E7EC"
                          />
                          <path
                            d="M105 30.5C102.93 30.5 101.25 32.18 101.25 34.25C101.25 36.32 102.93 38 105 38C109.14 38 112.5 41.3675 112.5 45.5V108.942L99.84 98.8175C99.18 98.2925 98.3475 98 97.5 98H45C40.86 98 37.5 94.6325 37.5 90.5V86.75C37.5 84.68 35.82 83 33.75 83C31.68 83 30 84.68 30 86.75V90.5C30 98.7725 36.7275 105.5 45 105.5H96.18L113.903 119.682C114.585 120.222 115.418 120.5 116.25 120.5C116.798 120.5 117.353 120.38 117.878 120.132C119.175 119.503 120 118.19 120 116.75V45.5C120 37.2275 113.272 30.5 105 30.5Z"
                            fill="#E4E7EC"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_4599_146336">
                            <rect
                              width="120"
                              height="120"
                              fill="white"
                              transform="translate(0 0.5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      <p className="text-gray-500 mt-[12px] text-center text-[16px]">
                        Use this as your thought partner
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          {/* Input Section */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-center px-[20px] absolute w-full bottom-4"
            // style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
          >
            <div
              className=" flex items-center w-full shadow-customForInput bg-white rounded-[100px] h-[50px]"
              style={{ zIndex: 10000 }}
            >
              <input
                type="text"
                placeholder="Ask me anything"
                value={inputValue}
                autoFocus
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-grow  mx-[20px] w-[90%] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!disabled}
                className="bg-blue-500 text-white rounded-full w-[30px] h-[30px] text-center mx-[10px] my-[10px] disabled:bg-gray-200"
              >
                <Send className="h-[12px] w-[12px] mx-auto" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotModal;

const RenderDropdown = ({
  placeholder,
  label,
  options,
  setFilterOption,
  setChatHistory,
}: {
  placeholder: string;
  label: string;
  options: MultiValue<Option>;
  setFilterOption?: any;
  setChatHistory?: any;
}) => (
  <Dropdown className="inline-flex">
    <Dropdown.Trigger
      type="button"
      className="text-center bg-white  border-gray-200 border-[1px] rounded-[6px] "
      id="dropdownMenuButton"
      data-bs-toggle="dropdown"
    >
      <div
        className={`flex justify-between items-center px-[12px] py-[7px] ${
          placeholder == 'sources' ? 'min-w-[216px]' : 'min-w-[250px]'
        }`}
      >
        <span className="text-[16px] text-gray-900">{label}</span>
        <ChevronDown className="relative left-[6px] h-[16px] w-[16px] text-gray-900 " />
      </div>
    </Dropdown.Trigger>
    <Dropdown.Content
      placement="bottom-start"
      className={`absolute border border-gray-300 z-50 px-[6px] py-[8px] ltr:text-left rtl:text-right bg-white scroll max-h-[300px] overflow-y-auto overflow-x-hidden rounded-md shadow-md  dropdown-menu ${
        placeholder == 'sources' ? 'w-[216px]' : 'w-[250px]'
      }
         dark:bg-zink-600`}
      aria-labelledby="dropdownMenuButton"
    >
      <ul
        className="text-sm text-gray-700 dark:text-gray-200 "
        aria-labelledby="dropdownMenuIconButton"
      >
        {options?.map((item, i) => (
          <li key={i} className="close-dropdown">
            <div
              className=" px-[12px] cursor-pointer py-[6px] close-dropdown"
              onClick={() => {
                setFilterOption(item);
                if (label != item?.label && placeholder != 'sources') {
                  setChatHistory([]);
                }
              }}
            >
              <span
                className={`w-full   text-[16px]  ${
                  label?.includes(item?.label)
                    ? 'text-[#3B82F6]'
                    : 'text-gray-700'
                } rounded dark:text-gray-300 cursor-pointer flex`}
              >
                <div className="w-[85%] close-dropdown">{item.label}</div>
              </span>
              {item?.sources && item?.sources?.length > 0 ? (
                <div
                  className={`text-[12px] pt-[2px]  cursor-pointer  close-dropdown ${
                    label?.includes(item?.label)
                      ? 'text-[#3B82F6]'
                      : 'text-gray-700'
                  } `}
                >
                  {item?.sources?.map((ele: string, index: number) => (
                    <span className="close-dropdown" key={index}>
                      {ele
                        .split('_')
                        .map(
                          (word: string) =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(' ')}
                      {`${
                        index < Number(item?.sources?.length || 0) - 1
                          ? ', '
                          : ''
                      }`}
                    </span>
                  ))}
                </div>
              ) : (
                ''
              )}
            </div>
          </li>
        ))}
      </ul>
    </Dropdown.Content>
  </Dropdown>
);
