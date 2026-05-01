import Modal from '../../../common/components/Modal';
import { Dropdown } from '../../../common/Dropdown';
import { MoreHorizontal } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '../../api/customers/customers';
import { getUsersForTask } from '../../api/users/users';
import { apiRequest } from '../../../common/api-request';
import { getAllTasksStatus } from '../../api/tasks/tasks';
import replaceVariables from '../../utils/replaceVariables';
import CreateNewTask from '../tasks/createNewTask';
import TaskCardGuidance from './taskCardGuidance';

const TreeNode = ({
  node,
  selectedNode,
  answerMap,
  onNodeClick,
  guidanceId,
  onAnswerClick,
  insightDetails,
  treeData,
  // dummy,
}: any) => {
  const isSelected = node?.node_id === selectedNode;
  const selectedAnswer = answerMap[node?.node_id ?? []];
  const [show, setShow] = useState<boolean>(false);
  const [remindType, setRemindType] = useState('Never');
  const [selectDate, setSelectedDate] = useState<Date | null>();
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
  });
  const { data: statusArr } = useQuery({
    queryKey: ['statusArr'],
    queryFn: () => getAllTasksStatus(),
  });
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
    <div>
      <div
        onClick={() => onNodeClick(node.node_id)}
        className={`border text-sm font-normal bg-white  border-gray-200 dark:bg-slate-400/20 dark:border-slate-600 rounded-lg mb-2 cursor-pointer `}
      >
        <div
          className={
            isSelected
              ? 'text-lg px-4 pt-2 pb-2'
              : 'text-gray-800 px-4 py-2 bg '
          }
        >
          {/* {node.hypothesis} */}
          {replaceVariables(node.hypothesis, insightDetails?.insight_instance)}
        </div>
        {!isSelected && selectedAnswer && (
          <div className="flex gap-2 pt-1 px-4 pb-2">
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
            <p className="text-gray-900 pb-3 pt-2 px-4 border-gray-400">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    //  node.suggestion
                    replaceVariables(
                      node.suggestion,
                      insightDetails?.insight_instance
                    ),
                }}
              />
            </p>
            <div className=" bg-gray-50 px-4 pb-2 rounded-b-xl">
              <p className="text-gray-600 py-3">
                {/* {node.question} */}
                {replaceVariables(
                  node.question,
                  insightDetails?.insight_instance
                )}
              </p>

              <div className="flex justify-between gap-4">
                <div className="flex gap-2 overflow-hidden">
                  {' '}
                  {node.answers.map((answer: any) => (
                    <div>
                      <button
                        className={
                          selectedAnswer === answer
                            ? 'text-white px-2 py-0.5 btn bg-custom-500 border-custom-500 rounded-md hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600  active:ring-custom-100 dark:ring-custom-400/20'
                            : 'bg-white px-2 py-0.5 text-[#141C24] btn border-[#637083] rounded-md hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600  active:ring-custom-100 dark:ring-custom-400/20'
                        }
                        key={answer}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnswerClick(node, answer);
                        }}
                      >
                        {answer}
                      </button>
                    </div>
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
                      className="absolute z-[1000]  ltr:text-left rtl:text-right bg-white rounded-md shadow-md !top-16 !right-3 dropdown-menu w-[10rem] dark:bg-zink-600"
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
                        <div className="w-[140px] flex flex-col space-y-2 px-[18px] py-[14px]">
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
                        <div className="text-center text-base text-gray-400 h-full w-full px-[18px] py-[14px] cursor-default">
                          Create task
                        </div>
                      )}
                    </Dropdown.Content>
                  </Dropdown>
                </div>
                {/* <Dropdown className="relative dropdown shrink-0">
                  <Dropdown.Trigger
                    type="button"
                    className="inline-block p-0 transition-all duration-200 ease-linear  rounded-full text-topbar-item dropdown-toggle btn hover:text-topbar-item-hover group-data-[topbar=dark]:text-topbar-item-dark group-data-[topbar=dark]:bg-topbar-dark group-data-[topbar=dark]:hover:bg-topbar-item-bg-hover-dark group-data-[topbar=dark]:hover:text-topbar-item-hover-dark group-data-[topbar=brand]:bg-topbar-brand group-data-[topbar=brand]:hover:bg-topbar-item-bg-hover-brand group-data-[topbar=brand]:hover:text-topbar-item-hover-brand group-data-[topbar=dark]:dark:bg-zink-700 group-data-[topbar=dark]:dark:hover:bg-zink-600 group-data-[topbar=brand]:text-topbar-item-brand group-data-[topbar=dark]:dark:hover:text-zink-50 group-data-[topbar=dark]:dark:text-zink-200"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                  >
                    <MoreHorizontal
                      className="size-5 rotate-[90deg] !float-end cursor-pointer text-[#414E62] ml-2"
                      onClick={() => setRemindType('Never')}
                    />
                  </Dropdown.Trigger>
                  <Dropdown.Content
                    placement="top-end"
                    className="absolute z-[1000] p-4 ltr:text-left rtl:text-right bg-white rounded-md shadow-md !top-16 !right-3 dropdown-menu w-[10rem] dark:bg-zink-600"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <div className="text-center" onClick={() => setShow(true)}>
                      Create new task
                    </div>
                  </Dropdown.Content>
                </Dropdown> */}
              </div>
              <div className="flex pt-[10px]">
                {node.resolution && selectedAnswer && node.resolution[selectedAnswer] && (
                  <div className="w-full max-h-full flex items-center bg-[#D9F2E5] rounded-md shadow-sm mb-2">
                    <span className="pl-[12px] flex items-center justify-center text-[#249782] mr-3 h-full">
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
                      {replaceVariables(
                        node.resolution[selectedAnswer],
                        insightDetails?.insight_instance
                      )}
                    </p>
                  </div>
                )}
              </div>
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
          </>
        )}
      </div>
      {node.children && selectedAnswer && (
        <div className="pl-14" style={{ paddingLeft: '' }}>
          {node.children[selectedAnswer]?.map((child: any) => (
            <TreeNode
              key={child.node_id}
              node={child}
              selectedNode={selectedNode}
              answerMap={answerMap}
              onNodeClick={onNodeClick}
              onAnswerClick={onAnswerClick}
              insightDetails={insightDetails}
              treeData={treeData}
            />
          ))}
        </div>
      )}
      <Modal
        show={show}
        onHide={toggle}
        id="defaultModal"
        modal-center="true"
        className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
        dialogClassName="w-screen md:w-[50rem] bg-white shadow rounded-md dark:bg-zink-600"
      >
        <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
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
            guidanceId={guidanceId}
            recipeTreeNodeId={selectedNode}
          /> */}
          <CreateNewTask
            onHide={toggle}
            allCustomers={allCustomers ?? []}
            existingUsers={existingUsers?.data?.data}
            customerId={insightDetails?.insight_instance?.customer_id ?? treeData?.customer_id}
            remindType={remindType}
            setRemindType={setRemindType}
            statusArr={statusArr?.data?.data}
            userDetails={userinfo?.data}
            guidanceId={guidanceId ?? treeData?._id}
            recipeTreeNodeId={selectedNode?.toString()}
            isEditMode={false}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TreeNode;
