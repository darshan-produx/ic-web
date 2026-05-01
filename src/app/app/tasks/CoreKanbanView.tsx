// import React, { useState } from 'react';
// import TaskCard from './taskCard';
// import { FilePlusIcon } from '../../assests/icons/icons';
// import { Plus } from 'lucide-react';
// import { toast } from 'react-toastify';

// interface CoreKanbanViewProps {
//   statusBars: Array<{
//     status_name: string;
//     items: any[];
//     _id: string;
//   }>;
//   showDone: boolean;
//   doneTasks: any[];
//   toggle: () => void;
//   setIsEditStaskMode: (mode: boolean) => void;
//   userinfo?: { data: { first_name: string } };
//   isLoading?: boolean;
//   external?: boolean;
//   props: {
//     tasksData?: any[];
//     checkboxItemStatus?: any[];
//     userDetails?: any;
//     external?: boolean;
//   };
//   updateItemFunc?: (data: any) => void;
// }

// const CoreKanbanView: React.FC<CoreKanbanViewProps> = ({
//   statusBars,
//   showDone,
//   doneTasks,
//   toggle,
//   setIsEditStaskMode,
//   userinfo,
//   isLoading,
//   props,
// }) => {
//     const [draggedOver, setDraggedOver] = useState<any>();
//     const [draggedItem, setDraggedItem] = useState<any>();
//     const [dragOverIndex, setDragOverIndex] = useState<any>();
//     const [cssFordraggedItem, setCssFordraggedItem] = useState<string>();

//     const onDragOver = (event: any, status: string) => {
//         event.preventDefault();
//         setDraggedOver(status);
//         };
    
//     const itemSeqNumMap: Record<string, number> = {};

    
//     // Function to handle the drop event
//     const onDrop = async (event: any) => {
//         event.preventDefault();
//         const statusId = props?.statusArr?.filter(
//             (ele: any) => ele?.status_name == draggedOver
//         )[0]?._id;
//         if (statusId === draggedItem?.task_status_id) {
//             setDraggedOver(null);
//             setDraggedItem(null);
//         } else {
//             // for (let status of statusBars)
//             const droppedStatusBar = statusBars.find(
//             (status) => status._id === statusId
//             );
//             if (droppedStatusBar) {
//             for (let i = 0; i < droppedStatusBar.items.length; i++) {
//                 if (droppedStatusBar.items[i]._id === dragOverIndex) {
//                 const dropSeqNum = itemSeqNumMap[dragOverIndex];
//                 const dropPrevSeqNum =
//                     i === 0 ? 0 : itemSeqNumMap[droppedStatusBar.items[i - 1]._id];
//                 itemSeqNumMap[draggedItem._id] = (dropSeqNum + dropPrevSeqNum) / 2;
//                 }
//             }
//             }
//             let data;
//             if (draggedOver.toLowerCase() === 'in-progress') {
//             data = {
//                 _id: draggedItem?._id,
//                 task_status_id: statusId,
//                 start_datetime: new Date(),
//             };
//             } else if (draggedOver.toLowerCase() === 'done') {
//             data = {
//                 _id: draggedItem?._id,
//                 task_status_id: statusId,
//                 end_datetime: new Date(),
//             };
//             } else {
//             data = {
//                 _id: draggedItem?._id,
//                 task_status_id: statusId,
//             };
//             }
//             try {
//             const res = await updateItemFunc?.mutateAsync(data);
//             if (res?.status == 200 || res?.status == 201) {
//                 toast?.success('Task moved to ' + draggedOver + ' successfully.');
//             }
//             } catch (err: any) {
//             toast?.error(err?.message);
//             }
//             setCssFordraggedItem('');
//             setDraggedOver(null);
//             setDraggedItem(null);
//             setDragOverIndex(null);
//         }
//     };


//   return (
//     <div className="">
//       {isLoading ? (
//         <div className="h-screen flex flex-col items-center justify-center space-y-2 ">
//           <div
//             className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-white border-r-[#80c2fe] align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
//             role="status"
//           >
//             <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
//               Loading...
//             </span>
//           </div>
//         </div>
//       ) : (
//         <div className="flex border-t-[1px] border-gray-200  bg-[#F9FAFB] overflow-x-auto pl-[calc((100vw-1232px)/2)] overflow-y-hidden scroll h-[calc(100vh-8.875rem)]">
//           {(props?.tasksData && props?.tasksData?.length > 0) ||
//           props?.checkboxItemStatus?.some((ele) => ele?.selected) ? (
//             <div className="flex ">
//               {statusBars?.map((bucket, i) => (
//                 <div
//                   key={i}
//                   className={`column-container !scroll !w-[470px]  h-[calc(100vh-8.5rem)] first:!pl-[16px] !px-[30px] overflow-y-auto   ${'border-r-[1px] last:border-none border-[#E4E7EC]'}`}
//                   onDragOver={(e) => onDragOver(e, bucket?.status_name)}
//                   onDrop={onDrop}
//                 >
//                   <div className="mt-[24px] relative">
//                     <h6 className="text-[#637083] font-normal text-[14px] mb-4">
//                       {bucket?.status_name}
//                     </h6>
//                     {bucket?.status_name === 'New' && !props?.external && (
//                       <div className="my-4 ">
//                         <button
//                           type="button"
//                           onClick={() => {
//                             toggle();
//                             setIsEditStaskMode(false);
//                           }}
//                           className="text-[#414E62] text-base btn text-left w-full rounded-md px-3 border-[#E4E7EC]"
//                         >
//                           <Plus className="inline-block size-4 mr-2" />
//                           <span className="align-middle relative top-[-1px]">
//                             Create task
//                           </span>
//                         </button>
//                       </div>
//                     )}
//                     {bucket?.items?.length == 0 ? (
//                       <div className="flex justify-center mt-20 text-center">
//                         <span className="text-[24px] text-center"></span>
//                       </div>
//                     ) : (
//                       bucket?.items?.map((ele, j) => (
//                         <React.Fragment key={j}>
//                           <TaskCard
//                             j={j}
//                             ele={ele}
//                             isDraggable={true}
//                             setDraggedItem={setDraggedItem}
//                             userDetails={props?.userDetails}
//                             draggedItem={draggedItem}
//                             draggedOver={draggedOver}
//                             setDragOverIndex={setDragOverIndex}
//                             setCssFordraggedItem={setCssFordraggedItem}
//                             cssFordraggedItem={cssFordraggedItem}
//                           />
//                         </React.Fragment>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               ))}
//               {showDone ? (
//                 <div
//                   className={`column-container w-[470px] !flex-1  h-[calc(100vh-8.275rem)] px-4 overflow-auto hover:overflow-y-auto border-none`}
//                   onDragOver={(e) => onDragOver(e, 'Done')}
//                   onDrop={onDrop}
//                 >
//                   <div className="">
//                     <h6 className="text-[#141C24] text-[16px] mb-4">Done</h6>
//                     {doneTasks?.length == 0 ? (
//                       <div className="flex justify-center mt-20 text-center">
//                         <span className="text-[24px] text-center">
//                           No items to display
//                         </span>
//                       </div>
//                     ) : (
//                       doneTasks?.map((ele, j) => (
//                         <React.Fragment key={j}>
//                           <TaskCard
//                             j={j}
//                             ele={ele}
//                             done={true}
//                             isDraggable={true}
//                             setDraggedItem={setDraggedItem}
//                             draggedItem={draggedItem}
//                             draggedOver={draggedOver}
//                             setDragOverIndex={setDragOverIndex}
//                             setCssFordraggedItem={setCssFordraggedItem}
//                             cssFordraggedItem={cssFordraggedItem}
//                           />
//                         </React.Fragment>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               ) : null}
//             </div>
//           ) : (
//             !isLoading && (
//               <div className="flex flex-col gap-5 items-center w-[1200px] h-screen">
//                 <div className="flex flex-col items-center justify-center pt-[150px] gap-6">
//                   <span>
//                     <FilePlusIcon className="text-[#141C24]" />
//                   </span>
//                   <div className="flex text-center !text-[#141C24] !font-normal">
//                     {' '}
//                     {userinfo?.data?.first_name}, you don't have any task{' '}
//                     <br /> Let's create a new task to plan your day
//                   </div>
//                   <button
//                     type="button"
//                     onClick={toggle}
//                     className={`bg-[#F9FAFB] px-[14px] font-medium rounded-md pb-[8px] text-[#141C24] btn border-[#637083]  dark:ring-custom-400/20`}
//                   >
//                     Create new
//                   </button>
//                 </div>
//               </div>
//             )
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CoreKanbanView;