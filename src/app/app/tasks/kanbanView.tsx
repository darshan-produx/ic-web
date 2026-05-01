'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import TaskCard from './taskCard';
import Modal from '../../../common/components/Modal';
import MultiSelectDropDown from '../../../common/components/MultiSelectDropDown';
import SearchBox from '../../../common/components/SearchBox';
import OutlineButton from '../../../common/components/OutlineButton';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '../../api/customers/customers';
import React from 'react';
import CreateNewTask from './createNewTask';
import { useUpdateTask } from '../../../services/mutations/tasksMutations';
import { toast } from 'react-toastify';
import { apiRequest } from '../../../common/api-request';
import { FilePlusIcon } from '../../assests/icons/icons';

interface KanBanViewProps {
  statusArr: any[];
  tasksData: any[];
  existingUsers: any[];
  userDetails?: any;
  assignedToOthers?: boolean;
  setAssignedToOthers?: any;
  assignedToMe?: boolean;
  setAssignedToMe?: any;
  checkboxItemsCustomer?: any;
  setCheckboxItemsCustomer?: any;
  checkboxItemStatus: any[];
  setCheckboxItemStatus: any;
  external?: boolean;
  setSearchText?: any;
  searchText?: string;
  isLoading?: boolean;
}
const taskSeqNumMap: Record<string, number> = {};

const KanBanView = (props: KanBanViewProps) => {
  const [show, setShow] = useState<boolean>(false);
  const [showDone, setShowDone] = useState<boolean>(false);
  const [remindType, setRemindType] = useState('Never');
  const [selectDate, setSelectedDate] = useState<Date | null>();
  const [selectAll, setSelectAll] = useState(true);
  const [draggedItem, setDraggedItem] = useState<any>();
  const [draggedOver, setDraggedOver] = useState<any>();
  const [dragOverIndex, setDragOverIndex] = useState<any>();
  const [cssFordraggedItem, setCssFordraggedItem] = useState<string>();
  const [isEditStaskMode, setIsEditStaskMode] = useState<boolean>(false);
  // const { data: allUserCustomers } = useQuery({
  //   queryKey: ['allUserCustomers'],
  //   queryFn: getCustomersByuser,
  //   refetchOnWindowFocus: false,
  // });
  const { data: allCustomers } = useQuery({
    queryKey: ['allCustomers'],
    queryFn: getCustomers,
    refetchOnWindowFocus: false,
  });

  const { data: userinfo } = useQuery({
    queryKey: ['info'],
    queryFn: () =>
      apiRequest({
        url: '/api/app-service/v1/userinfo?is_email_encrypt=true',
      }),
    refetchOnWindowFocus: false,
  });

  const [customerSearchText, setCustomerSearchText] = useState<string>();
  const updateTask = useUpdateTask();
  const statusBars = props?.statusArr
    ?.sort((a: any, b: any) => a?.seq_num - b?.seq_num)
    ?.map((item: any, i: number) => {
      let seqNum = 0;
      let tasksfilters = props?.tasksData
        ?.map((ele: any, j: number) => {
          const account = allCustomers?.data?.data?.filter(
            (data: any) => data?.customer_id == ele?.customer_id
          );
          if (item._id == ele?.task_status_id) {
            seqNum += 256;
            if (taskSeqNumMap[ele?._id] == undefined) {
              taskSeqNumMap[ele?._id] = seqNum;
            }
            return {
              ...ele,
              account: account?.length > 0 ? account[0]?.customer_name : '',
              userDetails: props?.userDetails,
            };
          }
        })
        .filter((ele: any) => ele !== undefined);
      tasksfilters?.sort(
        (a, b) => taskSeqNumMap[a?._id] - taskSeqNumMap[b?._id]
      );

      return {
        ...item,
        tasks: tasksfilters,
      };
    })
    .filter((ele: any) => ele !== undefined);

  const doneTaskId = props?.statusArr?.filter(
    (ele: any) => ele?.status_name == 'Done'
  )[0]?._id;

  const doneTasks = props?.tasksData
    ?.map((ele: any, j: number) => {
      const account = allCustomers?.data?.data?.filter(
        (data: any) => data?.customer_id == ele?.customer_id
      );
      if (doneTaskId == ele?.task_status_id)
        return {
          ...ele,
          account: account?.length > 0 ? account[0]?.customer_name : '',
          userDetails: props?.userDetails,
        };
    })
    .filter((ele: any) => ele !== undefined);

  const filterdedCustomers = useMemo(() => {
    return customerSearchText
      ? props?.checkboxItemsCustomer?.filter((ele: any) =>
        ele?.customer_name
          ?.toLowerCase()
          ?.includes(customerSearchText?.toLowerCase())
      )
      : props?.checkboxItemsCustomer;
  }, [customerSearchText, props?.checkboxItemsCustomer]);

  const toggle = useCallback(() => {
    if (show) {
      // setRemindType('Never');
      setSelectedDate(null);
      setShow(false);
    } else {
      setShow(true);
    }
  }, [show]);

  const handleCheckboxChange = (id: string) => {
    setSelectAll(false);
    props?.setCheckboxItemStatus((prevState: any) =>
      prevState.map((item: any) =>
        item._id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      setCustomerSearchText('');
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);


  const onDragOver = (event: any, status: string) => {
    event.preventDefault();
    setDraggedOver(status);
  };

  // Function to handle the drop event
  const onDrop = async (event: any) => {
    event.preventDefault();
    const statusId = props?.statusArr?.filter(
      (ele: any) => ele?.status_name == draggedOver
    )[0]?._id;
    if (statusId === draggedItem?.task_status_id) {
      setDraggedOver(null);
      setDraggedItem(null);
    } else {
      // for (let status of statusBars)
      const droppedStatusBar = statusBars.find(
        (status) => status._id === statusId
      );
      if (droppedStatusBar) {
        for (let i = 0; i < droppedStatusBar.tasks.length; i++) {
          if (droppedStatusBar.tasks[i]._id === dragOverIndex) {
            const dropSeqNum = taskSeqNumMap[dragOverIndex];
            const dropPrevSeqNum =
              i === 0 ? 0 : taskSeqNumMap[droppedStatusBar.tasks[i - 1]._id];
            taskSeqNumMap[draggedItem._id] = (dropSeqNum + dropPrevSeqNum) / 2;
          }
        }
      }
      let data;
      if (draggedOver.toLowerCase() === 'in-progress') {
        data = {
          _id: draggedItem?._id,
          task_status_id: statusId,
          start_datetime: new Date(),
        };
      } else if (draggedOver.toLowerCase() === 'done') {
        data = {
          _id: draggedItem?._id,
          task_status_id: statusId,
          end_datetime: new Date(),
        };
      } else {
        data = {
          _id: draggedItem?._id,
          task_status_id: statusId,
        };
      }
      try {
        const res = await updateTask?.mutateAsync(data);
        if (res?.status == 200 || res?.status == 201) {
          toast?.success('Task moved to ' + draggedOver + ' successfully.');
        }
      } catch (err: any) {
        toast?.error(err?.message);
      }
      setCssFordraggedItem('');
      setDraggedOver(null);
      setDraggedItem(null);
      setDragOverIndex(null);
    }
  };

  useEffect(() => {
    if (selectAll && props?.setCheckboxItemsCustomer) {
      const customerNewArr: any[] = allCustomers?.data?.data?.map(
        (item: any) => ({
          _id: item?._id,
          customer_name: item?.customer_name,
          customer_id: item?.customer_id,
          selected: false,
        })
      );
      props?.setCheckboxItemsCustomer(customerNewArr);
    }
    if (selectAll) {
      const statusArrNew: any[] = props?.statusArr
        // ?.filter((ele: any) => ele?.status_name != 'Done')
        ?.map((item: any) => ({
          _id: item?._id,
          status_name: item?.status_name,
          selected: false,
        })) ?? [];

      props?.setCheckboxItemStatus(statusArrNew);
    }
  }, [props?.statusArr, allCustomers?.data?.data, selectAll]);

  return (
    <div
      className={`${props?.external ? 'h-[100vh]' : '!h-[calc(100vh-3.375rem)]'
        } overflow-hidden`}
    >
      <div className="max-w-[1200px] my-[20px] mx-auto print:hidden">
        <div className="layout-width">
          <div className="flex w-full items-center justify-between gap-[10px]">
            <div className="h-8 w-fit flex items-center justify-start gap-[10px] flex-shrink-0">
              <div className="h-8 flex items-center box-border flex-shrink-0">
                <span
                  className={`h-full px-3 flex items-center justify-center border-[1px] border-[#CED2DA] rounded-l-[8px] ${props?.external ? 'rounded-r-[8px]' : ''} box-border cursor-pointer text-[12px] font-medium text-[#202B37] text-nowrap ${selectAll ? 'bg-[#F2F4F7]' : 'bg-white'}`}
                  onClick={() => {
                    setSelectAll(true);
                    props?.setAssignedToMe?.(true);
                    props?.setAssignedToOthers?.(true);
                  }}
                >All</span>
                {!props?.external && (
                  <>
                    <span
                      className={`h-full px-3 flex items-center justify-center border-[1px] border-[#CED2DA] border-l-0 box-border cursor-pointer text-[12px] font-medium text-[#202B37] text-nowrap ${!selectAll && props?.assignedToMe && !props?.assignedToOthers ? 'bg-[#F2F4F7]' : 'bg-white'}`}
                      onClick={() => {
                        setSelectAll(false);
                        props?.setAssignedToMe?.(true);
                        props?.setAssignedToOthers?.(false);
                      }}
                    >Assigned to me</span>
                    <span
                      className={`h-full px-3 flex items-center justify-center border-[1px] border-[#CED2DA] border-l-0 rounded-r-[8px] box-border cursor-pointer text-[12px] font-medium text-[#202B37] text-nowrap ${!selectAll && !props?.assignedToMe && props?.assignedToOthers ? 'bg-[#F2F4F7]' : 'bg-white'}`}
                      onClick={() => {
                        setSelectAll(false);
                        props?.setAssignedToMe?.(false);
                        props?.setAssignedToOthers?.(true);
                      }}
                    >Assigned to others</span>
                  </>
                )}
              </div>
              {!props?.external && (
                <>
                  <MultiSelectDropDown
                    filteredItems={filterdedCustomers ?? []}
                    dataFieldToUseForSelection="customer_name"
                    uniqueIdFieldToUseForSelection="customer_id"
                    checkboxItems={props?.checkboxItemsCustomer ?? []}
                    setCheckboxItems={(updater) => {
                      setSelectAll(false);
                      props?.setCheckboxItemsCustomer(updater);
                    }}
                    typeOfData="Customers"
                    wantToShowSearchBox={true}
                    setSearchText={setCustomerSearchText}
                    searchText={customerSearchText ?? ''}
                    triggerTextCss="h-[32px] text-nowrap"
                  />
                </>
              )}
              <MultiSelectDropDown
                filteredItems={props?.checkboxItemStatus ?? []}
                dataFieldToUseForSelection="status_name"
                uniqueIdFieldToUseForSelection="_id"
                checkboxItems={props?.checkboxItemStatus ?? []}
                setCheckboxItems={(updater) => {
                  setSelectAll(false);
                  props?.setCheckboxItemStatus(updater);
                }}
                typeOfData="Status"
                wantToShowSearchBox={false}
                setSearchText={() => {}}
                triggerTextCss="h-[32px] text-nowrap"
              />
            </div>
            <div className="h-8 w-[240px] flex justify-end items-center">
              <SearchBox
                searchText={props?.searchText}
                setSearchText={props?.setSearchText}
                dataType="Search tasks"
                needBorder={true}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="">
        {props?.isLoading ? (
          <div className="h-screen flex flex-col items-center justify-center space-y-2 ">
            <div
              className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-white border-r-[#80c2fe] align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            {/* <span className="text-white mx-10">Loading...</span> */}
          </div>
        ) : (
          <div className="flex border-t-[1px] border-gray-200  bg-[#F9FAFB] overflow-x-auto pl-[calc((100vw-1232px)/2)] overflow-y-hidden scroll h-[calc(100vh-8.875rem)]">
            {(props?.tasksData && props?.tasksData?.length > 0) ||
              props?.checkboxItemStatus?.some((ele) => ele?.selected) ? (
              <div className="flex ">
                {statusBars?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className={`column-container !scroll !w-[470px]  h-[calc(100vh-8.5rem)] first:!pl-[16px] !px-[30px] overflow-y-auto   ${'border-r-[1px] last:border-none border-[#E4E7EC]'}`}
                    onDragOver={(e) => onDragOver(e, item?.status_name)}
                    onDrop={onDrop}
                  >
                    <div className="mt-[24px] relative">
                      <h6 className="text-[#637083] font-normal text-[14px] mb-4">
                        {item?.status_name}
                      </h6>
                      {item?.status_name === 'New' && !props?.external && (
                        <div className="my-4 ">
                          <button
                            type="button"
                            onClick={() => {
                              toggle(), setIsEditStaskMode(false);
                            }}
                            className="text-[#414E62] text-base   btn text-left w-full rounded-md px-3 border-[#E4E7EC]"
                          >
                            <Plus className="inline-block size-4 mr-2" />
                            <span className="align-middle  relative top-[-1px]">
                              Create task
                            </span>
                          </button>
                        </div>
                      )}
                      {item?.tasks?.length == 0 ? (
                        <div className="flex justify-center mt-20 text-center">
                          <span className="text-[24px] text-center"></span>
                        </div>
                      ) : (
                        item?.tasks?.map((ele: any, j: number) => (
                          <React.Fragment key={j}>
                            <TaskCard
                              j={j}
                              ele={ele}
                              // existingUsers={props?.existingUsers}
                              // taskStatus={props?.statusArr}
                              isDraggable={true}
                              setDraggedItem={setDraggedItem}
                              userDetails={props?.userDetails}
                              draggedItem={draggedItem}
                              draggedOver={draggedOver}
                              setDragOverIndex={setDragOverIndex}
                              setCssFordraggedItem={setCssFordraggedItem}
                              cssFordraggedItem={cssFordraggedItem}
                            />
                          </React.Fragment>
                        ))
                      )}
                    </div>
                  </div>
                ))}
                {showDone ? (
                  <div
                    className={`column-container w-[470px] !flex-1  h-[calc(100vh-8.275rem)] px-4 overflow-auto hover:overflow-y-auto border-none`}
                    onDragOver={(e) => onDragOver(e, 'Done')}
                    onDrop={onDrop}
                  >
                    <div className="">
                      <h6 className="text-[#141C24] text-[16px] mb-4">Done</h6>

                      {doneTasks?.length == 0 ? (
                        <div className="flex justify-center mt-20 text-center">
                          <span className="text-[24px] text-center">
                            No tasks to display
                          </span>
                        </div>
                      ) : (
                        doneTasks?.map((ele: any, j: number) => (
                          <React.Fragment key={j}>
                            <TaskCard
                              j={j}
                              ele={ele}
                              // existingUsers={props?.existingUsers}
                              // taskStatus={props?.statusArr}
                              done={true}
                              isDraggable={true}
                              setDraggedItem={setDraggedItem}
                              draggedItem={draggedItem}
                              draggedOver={draggedOver}
                              setDragOverIndex={setDragOverIndex}
                              setCssFordraggedItem={setCssFordraggedItem}
                              cssFordraggedItem={cssFordraggedItem}
                            />
                          </React.Fragment>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
            ) : (
              !props?.isLoading && (
                <div className="flex flex-col gap-5 items-center w-[1200px] h-screen">
                  <div className="flex flex-col items-center justify-center pt-[150px] gap-6">
                    <span>
                      <FilePlusIcon className="text-[#141C24]" />
                    </span>
                    <div className="flex text-center !text-[#141C24] !font-normal">
                      {' '}
                      {userinfo?.data?.first_name}, you don’t have any task{' '}
                      <br /> Let’s create a new task to plan your day
                    </div>
                    <button
                      type="button"
                      onClick={toggle}
                      className={`bg-[#F9FAFB] px-[14px] font-medium rounded-md pb-[8px] text-[#141C24] btn border-[#637083]  dark:ring-custom-400/20`}
                    // onClick={handleSubmit(updateTaskDetails)}
                    >
                      Create new
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {show && (
        <Modal
          show={show}
          onHide={() => setShow(false)}
          id="defaultModal"
          modal-center="true"
          className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
          dialogClassName="w-screen md:w-[750px] bg-white shadow rounded-md dark:bg-zink-600"
        >
          <Modal.Body className="max-h-[calc(theme('height.screen')_-_61px)] p-4 overflow-y-auto barScroll">
            <CreateNewTask
              onHide={toggle}
              allCustomers={allCustomers}
              existingUsers={props?.existingUsers}
              remindType={remindType}
              setRemindType={setRemindType}
              statusArr={props?.statusArr}
              userDetails={props?.userDetails}
              isEditMode={isEditStaskMode}
            />
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default KanBanView;
