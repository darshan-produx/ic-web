import Modal from '../../../common/components/Modal';
import { Dropdown } from '../../../common/Dropdown';
import { MoreHorizontal } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '../../api/customers/customers';
import { getUsersForTask } from '../../api/users/users';
import { apiRequest } from '../../../common/api-request';
import { getAllTasksStatus } from '../../api/tasks/tasks';
import { useUpdateInsight } from '../../../services/mutations/insightMutations';
import TaskCardGuidance from './taskCardGuidance';
import { toast } from 'react-toastify';
import CreateNewTask from '../tasks/createNewTask';
import replaceVariables from '../../utils/replaceVariables';

export interface RecipeNode {
  node_id: string;
  hypothesis: string;
  suggestion: string;
  question: string;
  answers: string[];
  assistance?: any;
  resolution?: any;
  children?: Record<string, RecipeNode[]>;
}

interface props {
  selectedNode: string;
  answerMap: Record<string, string>;
  onNodeClick: (nodeId: string) => void;
  onAnswerClick: (node: RecipeNode, answer: string) => void;
  treeData: any;
  insightDetails: any;
  // dummy: any;
}

let debounceTimerIds: Record<string, number | undefined> = {};

function debounce(debounceId: string, func: any, timeout = 500) {
  window.clearTimeout(debounceTimerIds[debounceId]);
  debounceTimerIds[debounceId] = window.setTimeout(func, timeout);
}

export function getNodeById(
  nodeArr: RecipeNode[],
  nodeId: string
): RecipeNode | undefined {
  for (const node of nodeArr) {
    if (node.node_id === nodeId) {
      return node;
    }
    for (const answer in node.children) {
      const foundNode = getNodeById(node.children[answer], nodeId);
      if (foundNode) {
        return foundNode;
      }
    }
  }
  return undefined;
}

const FocusedView = ({
  answerMap,
  insightDetails,
  onNodeClick,
  onAnswerClick,
  treeData,
  // dummy,
}: props) => {
  const [show, setShow] = useState<boolean>(false);
  const [selectDate, setSelectedDate] = useState<Date | null>();
  const [remindType, setRemindType] = useState('Never');
  const [actionNotes, setActionNotes] = useState('');

  const node = getNodeById(treeData?.recipe_tree, treeData?.selected_node_id);
  const answer = node ? treeData.answer_map[node.node_id] : undefined;
  const children = node
    ? (answer ? node.children && node.children[answer] : undefined) ?? []
    : treeData.recipe_tree;

  const isSelected = node?.node_id === treeData.selected_node_id;
  const selectedAnswer = node && answerMap[node.node_id];
  const updateInsight = useUpdateInsight();
  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
  });

  const { data: existingUsers, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsersForTask,
  });
  const { data: userinfo } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
  });
  const { data: statusArr } = useQuery({
    queryKey: ['statusArr'],
    queryFn: () => getAllTasksStatus(),
  });
  const handleOnclick = async (action_status: string, id?: string) => {
    if (!insightDetails?.insight_instance?._id) return;
    const response: any = await updateInsight.mutateAsync({
      id: insightDetails?.insight_instance?._id,
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
  const handleOnChangeInput = (action_notes: string, id?: string) => {
    if (!insightDetails?.insight_instance) return;
    setActionNotes(action_notes);
    insightDetails.insight_instance.action_notes = action_notes;
    debounce('actionNotes', () => {
      updateInsight.mutateAsync({
        id: insightDetails?.insight_instance?._id,
        data: {
          action_notes,
        },
      });
    });
  };
  const toggle = useCallback(() => {
    if (show) {
      setRemindType('Never');
      setSelectedDate(null);
      setShow(false);
    } else {
      setShow(true);
    }
  }, [show]);
  return (
    <>
      <div className="flex flex-col justify-between h-full">
        <div className="mb-20">
          {node && (
            <div className="px-[20px] pt-[20px]">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeClick(node.node_id);
                }}
                className={`border text-sm font-normal border-gray-200 bg-white dark:bg-slate-400/20 dark:border-slate-600 rounded-xl  cursor-pointer`}
              >
                <div className="text-gray-900 text-lg px-[20px] pt-[20px] rounded-t-lg">
                  {/* {node.hypothesis} */}
                  {replaceVariables(
                    node.hypothesis,
                    insightDetails?.insight_instance
                  )}
                </div>
                {!isSelected && selectedAnswer && (
                  <div className="flex gap-4 px-4 py-2">
                    {node.answers.map((answer: any) => (
                      <button
                        className={
                          selectedAnswer === answer
                            ? 'text-white px-2 py-0.5 btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600  active:ring-custom-100 dark:ring-custom-400/20'
                            : 'bg-white px-2 py-0.5 text-[#141C24] btn border-[#637083] hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600  active:ring-custom-100 dark:ring-custom-400/20'
                        }
                        key={answer}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnswerClick(node, answer);
                        }}
                      >
                        {answer}
                      </button>
                    ))}
                  </div>
                )}

                {isSelected && (
                  <>
                    <p className="text-gray-900 px-[20px] pt-[12px] pb-[20px] border-gray-50 bg-white">
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            // node.suggestion
                            replaceVariables(
                              node.suggestion,
                              insightDetails?.insight_instance
                            ),
                        }}
                      />
                    </p>
                    <p className="text-gray-600 px-[20px] pt-[20px] bg-gray-50">
                      {/* {node.question} */}
                      {replaceVariables(
                        node.question,
                        insightDetails?.insight_instance
                      )}
                    </p>

                    <div className="flex flex-col gap-4 px-[20px] pt-[12px] pb-[20px] bg-gray-50 rounded-b-xl">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          {node.answers.map((answer: any) => (
                            <button
                              className={
                                selectedAnswer === answer
                                  ? 'text-white px-[12px] py-[8px] btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring-custom-100 dark:ring-custom-400/20'
                                  : 'bg-white px-[12px] py-[8px] !text-[#141C24] btn !border-[#637083] hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring-custom-100 dark:ring-custom-400/20'
                              }
                              key={answer}
                              onClick={(e) => {
                                e.stopPropagation();
                                onAnswerClick(node, answer);
                              }}
                            >
                              {answer}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center">
                          <Dropdown className="relative dropdown shrink-0">
                            <Dropdown.Trigger
                              type="button"
                              className="inline-block p-0 transition-all duration-200 ease-linear rounded-full text-topbar-item dropdown-toggle btn hover:text-topbar-item-hover"
                              id="dropdownMenuButton"
                              data-bs-toggle="dropdown"
                            >
                              <span className="flex items-center">
                                <MoreHorizontal
                                  className="size-5 rotate-[90deg] cursor-pointer text-[#637083] ml-2"
                                  onClick={() => setRemindType('Never')}
                                />
                              </span>
                            </Dropdown.Trigger>
                            <Dropdown.Content
                              placement="top-end"
                              className="absolute z-[1000] px-[18px] py-[14px] ltr:text-left rtl:text-right bg-white rounded-md shadow-md !top-16 !right-3 dropdown-menu w-[10rem] dark:bg-zink-600"
                              aria-labelledby="dropdownMenuButton"
                            >
                              {!treeData?.task_map?.hasOwnProperty(
                                treeData?.selected_node_id.toString()
                              ) ? (
                                // <div
                                //   className="text-center text-[16px] font-[400] text-gray-700"
                                //   onClick={() => setShow(true)}
                                // >
                                //   Create new task
                                // </div>
                                <div className="w-[140px] flex flex-col space-y-2">
                                  {[
                                    {
                                      label: 'Create task',
                                      onClick: () => setShow(true),
                                    },
                                    // {
                                    //   label: 'Ignore',
                                    //   onClick: () => setShow(true),
                                    // },
                                  ].map((action) => (
                                    <button
                                      key={action.label}
                                      onClick={action.onClick}
                                      // Button styling
                                      className="w-full h-9 text-start text-[16px] leading-[24px] font-[400] text-[#344051] bg-transparent rounded-md transition-colors duration-200 px-2"
                                      type="button"
                                    >
                                      {action.label}
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center text-base text-gray-400">
                                  Create task
                                </div>
                              )}
                            </Dropdown.Content>
                          </Dropdown>
                        </div>
                      </div>
                      <div className="flex">
                        {selectedAnswer === 'Yes' &&
                          Object.keys(node?.resolution || {}).map(
                            (key, index) => (
                              <div
                                key={index}
                                className="w-full max-h-full flex items-center bg-[#D9F2E5] rounded-md shadow-sm mb-2" // Added mb-2 for spacing
                              >
                                <span className="top-[2.4px] pl-[12px] pb-[40.4px] pt-[12.4px] flex items-center justify-center  text-[#249782] mr-3">
                                  <svg
                                    width="20"
                                    height="16"
                                    viewBox="0 0 20 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.8 14.0013C12.8 13.7101 12.7216 13.4365 12.5848 13.2013H12.8C13.6824 13.2013 14.4 12.4837 14.4 11.6013C14.4 11.2725 14.3 10.9661 14.1296 10.7117C14.752 10.4925 15.2 9.89808 15.2 9.20128C15.2 8.91007 15.1216 8.63648 14.9848 8.40128H18.4C19.2824 8.40128 20 7.68366 20 6.80128C20 5.9189 19.2824 5.20128 18.4 5.20128H8.47199C8.36559 5.20128 8.27199 5.10769 8.27199 5.00128C8.27199 4.94526 8.28879 4.89808 8.28078 4.90206L10.5088 3.33726C11.2168 2.84366 11.4104 1.80847 10.9128 1.09327C10.6648 0.737257 10.292 0.499679 9.86238 0.423663C9.43519 0.348468 9.00797 0.442882 8.6616 0.686866L2.56082 4.86925C0.981602 5.93089 0 7.81167 0 9.7773C0 12.9885 2.61281 15.6013 5.82398 15.6013H11.2C12.0824 15.6013 12.8 14.8837 12.8 14.0013Z"
                                      fill="#249782"
                                    />
                                  </svg>
                                </span>
                                <p className="text-[14px] leading-[24px] py-[10px] pl-[16px] pr-[12px] font-medium text-[#202B37]">
                                  {/* {node?.resolution[key]} */}
                                  {replaceVariables(
                                    node?.resolution[key],
                                    insightDetails?.insight_instance
                                  )}
                                </p>
                              </div>
                            )
                          )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          <div
            className={`pt-[16px] mr-4 flex flex-col gap-1 ${
              treeData.selected_node_id ? 'ml-[82px] ' : 'ml-[20px] '
            }`}
          >
            {children.map((childNode: RecipeNode) => (
              <div
                className="border text-sm font-normal bg-white border-gray-200 dark:bg-slate-400/20 dark:border-slate-600 px-[12px] py-[12.5px] rounded-lg mb-2 cursor-pointer"
                key={childNode.node_id}
                onClick={(e) => onNodeClick(childNode.node_id)}
              >
                {/* {childNode.hypothesis} */}
                {replaceVariables(
                  childNode.hypothesis,
                  insightDetails?.insight_instance
                )}
              </div>
            ))}
          </div>
          {treeData?.task_map?.hasOwnProperty(
            treeData?.selected_node_id.toString()
          ) && (
            <div className="px-5 pt-2">
              <span className="text-sm text-gray-800">Task Assigned</span>
              <TaskCardGuidance
                taskId={treeData?.task_map[treeData?.selected_node_id]}
              />
            </div>
          )}
        </div>
        {/* <div className="align-bottom">
          <ActionTaken
            insightDetails={insightDetails}
            handleOnChangeInput={handleOnChangeInput}
            handleOnclick={handleOnclick}
          />
        </div> */}
        <Modal
          show={show}
          onHide={toggle}
          id="defaultModal"
          modal-center="true"
          className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
          dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
        >
          <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] p-4 overflow-y-auto barScroll">
            {/* <AddNewTask
            onHide={toggle}
            allCustomers={allCustomers}
            existingUsers={existingUsers?.data?.data}
            remindType={remindType}
            setRemindType={setRemindType}
            statusArr={statusArr?.data?.data}
            userDetails={userinfo?.data}
            selectDate={selectDate}
            setSelectedDate={setSelectedDate}
            guidanceId={treeData?._id}
            recipeTreeNodeId={treeData?.selected_node_id}
          /> */}
            <CreateNewTask
              onHide={toggle}
              allCustomers={allCustomers ?? []}
              existingUsers={existingUsers?.data?.data}
              customerId={insightDetails?.insight_instance?.customer_id}
              remindType={remindType}
              setRemindType={setRemindType}
              statusArr={statusArr?.data?.data}
              userDetails={userinfo?.data}
              guidanceId={treeData?._id}
              recipeTreeNodeId={treeData?.selected_node_id}
              isEditMode={false}
            />
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default FocusedView;
