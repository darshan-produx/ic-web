import { useEffect, useState } from 'react';
import TreeNode from './treeNode';
import FocusedView, { RecipeNode } from './focusedView';
import {
  ExitFullScreen,
  FullScreen,
  StarIcon,
} from '../../assests/icons/icons';
import {
  useIntelligenceChatInsight,
  useUpdateGuidance,
  useUpdateInsight,
} from '../../../services/mutations/insightMutations';
import { Send } from 'lucide-react';
// import ActionTaken from './actionTaken';
import { toast } from 'react-toastify';
import replaceVariables from '../../utils/replaceVariables';
import { useMixpanel } from '../../../common/mixpanel/useMixpanel';
export default function Guidance({
  data,
  // setDummyvalue,
  insightDetails,
  setIsGuidaceSectionOpen,
  setIsCollapsed,
  isLoading
}: any) {
  const [selectedNode, setSelectedNode] = useState(data?.selected_node_id);
  const [answerMapVersion, setAnswerMapVersion] = useState(0);
  const [isFocusedView, setIsFocusedView] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const updateGuidance = useUpdateGuidance();
  const [selectedTab, setSelectedTab] = useState(
    data?.recipe_tree?.length > 0 ? 'guidance' : 'askAI'
  );
  const [curMessage, setcurMessage] = useState<string>('');
  const intelligenceChatInsight = useIntelligenceChatInsight();
  const [messages, setMessages] = useState<any>([]);
  const [askAiAboutCompany, setAskAiAboutCompany] = useState<any>(true);
  const { trackEvent, MIXPANEL_EVENTS } = useMixpanel();
  const handleNodeClick = (id: any) => {
    data.selected_node_id = id;
    setSelectedNode(id);
  };

  const updateInsight = useUpdateInsight();
  const handleAnswerClick = (node: RecipeNode, answer: any) => {
    const updatedAnswerMap = { ...data.answer_map, [node.node_id]: answer };
    data.answer_map = updatedAnswerMap;

    // Increment version to trigger useEffect for updateGuidance API call
    setAnswerMapVersion((prev) => prev + 1);

    // Only update action_notes if insightDetails is available
    if (insightDetails?.insight_instance) {
      let strToAppend: string =
        '--------------\nHypothesis: ' +
        `${replaceVariables(node.hypothesis, insightDetails?.insight_instance)}` +
        '\nQ: ' +
        `${replaceVariables(node.question, insightDetails?.insight_instance)}` +
        '\nA: ' +
        `${answer}`;
      if (node.resolution && answer && node.resolution[answer]) {
        strToAppend = strToAppend + '\nSuggestion: ' + node.resolution[answer];
      }
      strToAppend = strToAppend + '\n--------------\n';
      insightDetails.insight_instance.action_notes =
        (insightDetails.insight_instance.action_notes ?? '') + strToAppend;

      updateInsight.mutateAsync({
        id: insightDetails?.insight_instance?._id,
        data: {
          action_notes: insightDetails.insight_instance.action_notes,
        },
      });
    }

    trackEvent(MIXPANEL_EVENTS.GUIDANCE_ACTION, {
      guidance_id: data?._id,
      node_id: node?.node_id,
      selected_node: selectedNode,
      answer: answer,
      recipe_id: data?.recipe_id,
      insight_instance_id: data?.insight_instance_id,
      customer_id: insightDetails?.insight_instance?.customer_id,
      insight_type: insightDetails?.insight_instance?.insight_data_type,
      environment: process.env.NODE_ENV,
      org_id: localStorage.getItem('org_id'),
    });
    // setDummy(Math.random());
  };
  async function handleNodeClickAiInput() {
    const requestData = {
      query: curMessage,
      customer_id: askAiAboutCompany
        ? insightDetails?.insight_instance?.customer_id
        : undefined,
      insight_instance_id: insightDetails?.insight_instance?._id ?? null,
      guidance_id: insightDetails?.guidance?._id ?? null,
      recipe_tree_node_id: insightDetails?.guidance?.selected_node_id ?? null,
      chat_history: messages,
    };
    const response = await intelligenceChatInsight.mutateAsync(requestData);
    setMessages([
      ...messages,
      { user: curMessage, agent: response.data.response },
    ]);
    setcurMessage('');
  }
  useEffect(() => {
    // data?.recipe_tree.length > 0
    setSelectedTab('guidance')
    // : setSelectedTab('guidance');
    setMessages([]);
    setSelectedNode(data?.selected_node_id);
  }, [insightDetails?.guidance?._id, data?._id]);

  let debounceTimerIds: Record<string, number | undefined> = {};

  function debounce(debounceId: string, func: any, timeout = 500) {
    window.clearTimeout(debounceTimerIds[debounceId]);
    debounceTimerIds[debounceId] = window.setTimeout(func, timeout);
  }

  const handleOnChangeInput = (action_notes: string, id?: string) => {
    if (!insightDetails?.insight_instance) return;
    setActionNotes(action_notes);
    insightDetails.insight_instance.action_notes = action_notes;
    debounce('actionNotes', () => {
      updateInsight.mutateAsync({
        id: id,
        data: {
          action_notes,
        },
      });
    });
  };
  const handleOnclick = async (action_status: string, id?: string) => {
    const response = await updateInsight.mutateAsync({
      id: id,
      data: {
        action_status,
      },
    });
    if (response?.status === 200 || response?.status === 201) {
      if (action_status === 'completed') {
        toast.success('Marked as completed successfully.');
      } else {
        toast.success('Ignored successfully.');
      }
    }
  };
  // useEffect(() => {
  //   setDummyvalue(dummy);
  // }, [dummy]);
  useEffect(() => {
    const payload: {
      id: string;
      data: any;
    } = {
      id: data?._id,
      data: {
        selected_node_id: data?.selected_node_id,
        answer_map: data?.answer_map,
      },
    };
    if (data) updateGuidance.mutateAsync(payload);
  }, [answerMapVersion, data?.selected_node_id]);

  return (
    <div className="">
      <div className="flex justify-between border-b border-gray-200 rounded-t-xl">
        <div className="flex gap-[30px] px-[20px]">
          {/* {data?.recipe_tree?.length > 0 && ( */}
          <span
            className={
              selectedTab === 'guidance'
                ? // ? 'border-b-2 pb-[16px] text-[14px] pt-[15px]  border-gray-900 text-gray-900 cursor-pointer'
                'pb-[16px] text-[14px] pt-[15px]  border-gray-900 text-gray-900 '
                : 'text-gray-400 pb-[16px] text-[14px] pt-[15px]  cursor-pointer'
            }
            onClick={() => setSelectedTab('guidance')}
          >
            Guidance
          </span>
          {/* )} */}
          {/* <span
            className={
              selectedTab === 'askAI'
                ? 'border-b-2 pb-[16px] text-[14px] pt-[15px]  border-gray-900 text-gray-900 cursor-pointer'
                : 'text-gray-400 pb-[16px] text-[14px] pt-[15px]  cursor-pointer'
            }
            onClick={() => setSelectedTab('askAI')}
          >
            Ask AI
          </span> */}
        </div>
        <div
          className="px-4 pb-1 cursor-pointer flex items-center"
        // onClick={() => setIsFocusedView(!isFocusedView)}
        >
          {/* <span>
            {isFocusedView
              ? selectedTab !== 'askAI' && (
                  <FullScreen className="text-gray-400 h-4 w-4" />
                )
              : selectedTab !== 'askAI' && (
                  <ExitFullScreen className="text-gray-400 h-4 w-4" />
                )}
          </span> */}
          <span
            className="text-[14px] text-[#344051]"
            onClick={() => {
              setIsGuidaceSectionOpen(false);
              if (setIsCollapsed && typeof setIsCollapsed === 'function') {
                setIsCollapsed(true);
              }
            }}
          >
            Close
          </span>
        </div>
      </div>
      {selectedTab === 'askAI' ? (
        <div
          className="overflow-auto scroll h-[calc(100vh-8.9rem)] flex flex-col justify-between "
          style={{
            scrollbarWidth: 'none',
          }}
        >
          <div
            className="overflow-auto scroll  pb-[16px] flex flex-col justify-between h-[calc(100vh-8.9rem)]"
            style={{
              scrollbarWidth: 'none',
            }}
          >
            <div className="px-5  pt-5 overflow-y-scroll scroll ">
              <div
                style={{
                  scrollbarWidth: 'none',
                }}
              >
                <div
                  className="hide-scrollbar"
                // style={{ scrollSnapType: 'y mandatory' }}
                >
                  {messages.map((ele: any, index: number) => (
                    <>
                      <div className="flex justify-end">
                        <p className="bg-gray-200 text-gray-800 text-md py-2 px-4 rounded-md text-sm w-3/4">
                          {ele.user}
                        </p>
                      </div>
                      <div
                        className="flex my-4"
                        style={{ scrollSnapAlign: 'start' }}
                      >
                        <span className="w-6 pt-1 items-center">
                          <StarIcon />
                        </span>
                        <p className="text-gray-800 w-full text-sm items-center px-2 pt-1">
                          {ele.agent}
                        </p>
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </div>
            <div className="card-body flex gap-4 py-4 ">
              <div className="flex items-center text-sm justify-between bg-white border border-gray-200 shadow-sm w-full rounded-full pl-5 pr-2 mx-5 py-1 gap-2">
                <div className="grow">
                  <input
                    type="text"
                    id="inputText"
                    className="  dark:border-zink-500 w-full focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                    placeholder="Ask AI for the help on the insight"
                    value={curMessage}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNodeClickAiInput();
                      }
                    }}
                    onChange={(e) => setcurMessage(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="text-white rounded-full btn !px-1.5 !py-1 bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                  disabled={!curMessage}
                  onClick={() => handleNodeClickAiInput()}
                >
                  <Send className="inline-block size-4 align-middle" />
                </button>
              </div>
            </div>
          </div>
          {/* {insights?.length > 0 && (
            <div className="">
              <ActionTaken
                insightDetails={insightDetails}
                handleOnChangeInput={handleOnChangeInput}
                handleOnclick={handleOnclick}
              />
            </div>
          )} */}
        </div>
      ) : data ? (
        <div
          className=" h-[calc(100vh-7rem)] overflow-y-auto overflow-hidden scroll-container"
          key={data?.recipe_id}
        >
          {isFocusedView && data ? (
            <FocusedView
              treeData={data}
              insightDetails={insightDetails}
              answerMap={data?.answer_map}
              selectedNode={selectedNode}
              onNodeClick={handleNodeClick}
              onAnswerClick={handleAnswerClick}
            // dummy={dummy}
            />
          ) : (
            <div className="px-4 pt-[21px]">
              {data?.recipe_tree.map((node: any) => (
                <TreeNode
                  key={node?.node_id}
                  treeData={data}
                  node={node}
                  guidanceId={data._id}
                  insightDetails={insightDetails}
                  selectedNode={selectedNode}
                  onNodeClick={handleNodeClick}
                  onAnswerClick={handleAnswerClick}
                  answerMap={data?.answer_map}
                // dummy={dummy}
                />
              ))}
            </div>
          )}
        </div>
      ) :
        isLoading ? (
          <div className="w-full h-[calc(100vh-8.9rem)] flex justify-center text-gray-400">
            <div className="animate-pulse py-4">
              <div className="h-[40px] w-[540px] bg-gray-100 rounded-[6px] mb-4"></div>
              <div className="h-[40px] w-[540px] bg-gray-100 rounded-[6px] mb-4"></div>
              <div className="h-[40px] w-[540px] bg-gray-100 rounded-[6px] mb-4"></div>
            </div>
          </div>
        )
          : (
            <div className="w-full h-[calc(100vh-8.9rem)] flex items-center justify-center text-gray-400">
              No guidance steps to show
            </div>
          )}
    </div>
  );
}
