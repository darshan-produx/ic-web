import React, { useState, useRef, useEffect, use } from 'react';
import Modal from '../../../common/components/Modal';
import { Dropdown } from '../../../common/Dropdown';
import { X, Search } from 'lucide-react';
import dayjs from 'dayjs';
import { toUTCEndOfDay } from '../../utils/date-util';
export const DependentTaskModal = ({
  dependentTaskModal,
  setDependentTaskModal,
  ele,
  dependentTasksList,
  setDependentTasksList,
  delayAfterDependentTask,
  setDelayAfterDependentTask,
  setIsDataChanged,
  isTaskDone,
  dependencySelectionList,
}: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [startDateDelay, setStartDateDelay] = useState(0);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [localDependentTasksList, setLocalDependentTasksList] = useState<any[]>([]);
  useEffect(() => {
    setLocalDependentTasksList(dependentTasksList);
    setStartDateDelay(delayAfterDependentTask || 0);
  }, [dependentTasksList, delayAfterDependentTask]);
  useEffect(() => {
    const filtered = dependencySelectionList?.filter(
      (task: any) =>
        ele?._id !== task._id &&
        !localDependentTasksList?.some((td: any) => td._id === task._id)
    ) || [];

    setAvailableTasks(() => {
      const unique = filtered.filter(
        (t: any, index: number, self: any[]) =>
          t && index === self.findIndex((x: any) => x._id === t._id)
      );
      return unique;
    });
  }, [dependencySelectionList, localDependentTasksList]);

  const removeTask = (taskId: string) => {
    setLocalDependentTasksList(
      localDependentTasksList.filter((task: any) => task._id !== taskId)
    );
  };
  const handleAddTaskInDependentList = (task: any) => {
    setLocalDependentTasksList((prev) => {
      const merged = [...prev, task];
      const unique = merged.filter(
        (t, index, self) =>
          t && index === self.findIndex((x) => x._id === t._id)
      );
      return unique;
    });
  };

  return (
    <Modal
      show={dependentTaskModal}
      onHide={() => setDependentTaskModal(false)}
      id="dependentTaskModal"
      modal-center="true"
      className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-[65%]" // <-- changed here
      dialogClassName="w-screen md:w-[28rem] bg-white shadow rounded-md dark:bg-zink-600"
    >
      <div className="p-4">
        <Modal.Title className="font-semibold text-[#202B37] text-[16px]">
          Dependent Tasks
        </Modal.Title>
      </div>

      <Modal.Body className="px-4">
        <div className="space-y-2">
          <div className="space-y-2 max-h-[200px] overflow-y-auto scroll">
            {localDependentTasksList.map((task: any) => (
              <div
                key={task.id}
                className="flex items-start justify-between px-3 py-2 bg-gray-50 rounded-lg dark:bg-zink-700"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-normal text-[#141C24] leading-[20px]">
                    {task?.title}
                  </p>
                  <p className="text-[12px] text-[#637083] mt-1">
                    Ends {dayjs(toUTCEndOfDay(task?.end_datetime)).format('MMM DD')}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeTask(task?._id);
                  }}
                  className="ml-3 p-1 text-[#000000]"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div
            className="relative"
            ref={dropdownRef}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Dropdown className="w-full">
              <Dropdown.Trigger
                type="button"
                className="w-full text-left px-3 py-2 text-[#202B37] text-[14px] border border-gray-200 rounded-md focus:outline-none outline-none active:outline-none"
              >
                Add new task
              </Dropdown.Trigger>

              <Dropdown.Content
                placement="top"
                className="absolute w-full border border-gray-200 rounded-md shadow-lg bg-white dark:bg-zink-700 dark:border-zink-500 mt-1 z-50"
              >
                <div className="p-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSearchQuery(e.target.value);
                      }}
                      className="w-full pl-8 pr-2 py-2 text-sm text-[#141C24] border border-[#CED2DA] rounded-[8px] focus:outline-none placeholder-[#637083]"
                    />
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-[#141C24]" />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto scroll py-1">
                  {availableTasks.length === 0 ? (
                    <div className="py-2 text-sm text-gray-400 w-full text-center">
                      No tasks available
                    </div>
                  ): availableTasks
                    .filter(
                      (task: any) =>
                        task?.title
                          ?.toLowerCase()
                          ?.includes(searchQuery.toLowerCase()) &&
                        !localDependentTasksList.some(
                          (t: any) => t._id === task._id
                        )
                    )
                    .map((task: any) => (
                      <div
                        key={task.id}
                        className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-zink-600 cursor-pointer flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddTaskInDependentList(task);
                          setSearchQuery('');
                        }}
                      >
                        <div className="w-[100%]">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {task.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Ends on:{' '}
                            {dayjs(toUTCEndOfDay(task?.end_datetime)).format('MMM DD')}
                          </div>
                        </div>
                        {task?.type === 'milestone' && (
                          <div className="h-full text-center items-center">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 21 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="10.5"
                                y="0.707107"
                                width="13.1422"
                                height="13.1422"
                                transform="rotate(45 10.5 0.707107)"
                                stroke={
                                  task?.is_completed ? '#249782' : '#97A1AF'
                                }
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </Dropdown.Content>
            </Dropdown>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="p-4 mt-2 border-t border-slate-200 dark:border-zink-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[14px] text-gray-600 dark:text-gray-300">
            <span>Start task with</span>
            <input
              type="number"
              // min="0"
              // max="30"
              value={startDateDelay}
              // onBlur={() => {this.focus()}}
              autoFocus
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setStartDateDelay(Number(e.target.value));
              }}
              className="!w-[60px] text-[16px] text-[#141C24] px-1 py-1 pl-3 border border-gray-200 rounded-[8px] outline-none active:outline-none focus:outline-none"
            ></input>
            <span className="text-[14px]">days offset</span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 text-[14px] font-semibold text-[#202B37] bg-white border border-gray-300 rounded-md outline-none"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDataChanged(false);
                setDependentTaskModal(false);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isTaskDone}
              className={`px-4 py-2 text-[14px] font-semibold text-white bg-[#1A75FF] border border-transparent rounded-md outline-none ${isTaskDone ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isTaskDone) return;
                setDependentTasksList(localDependentTasksList);
                setDelayAfterDependentTask(startDateDelay);
                setDependentTaskModal(false);
                setIsDataChanged(true);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default DependentTaskModal;
