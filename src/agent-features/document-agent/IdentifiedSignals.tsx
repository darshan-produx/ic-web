// //3
// 'use client';
// import React, { useState } from 'react';
// import { ProgressDots } from '../components/ProgressDots';
// import { OnboardingLayoutApp } from '../components/OnboardingLayoutApp';
// import { ActionButtons } from '../components/ActionButtons';
// import {
//   IssueIcon,
//   DelightIcon,
//   ChevronDownIcon,
// } from '../../app/assests/icons/icons';

// interface Signal {
//   id: string;
//   title: string;
//   type: 'Issue' | 'Delight';
//   date: string;
//   icon: 'issue' | 'delight';
// }

// interface IdentifiedSignalsProps {
//   activation_id: string;
//   onDone?: () => void;
//   signals?: Signal[];
// }

// // Mock data - TODO: Replace with actual signals from event journey API
// // These signals should come from the same source as the event journey UI
// // The format should match: { id, title, type: 'Issue' | 'Delight', date, icon }
// const mockSignals: Signal[] = [
//   {
//     id: '1',
//     title: 'Critical Issue Escalated - Resolution In Progress',
//     type: 'Issue',
//     date: 'August 21, 2025, (Thursday)',
//     icon: 'issue',
//   },
//   {
//     id: '2',
//     title: 'Critical Issue Escalated - Resolution In Progress',
//     type: 'Issue',
//     date: 'August 21, 2025, (Thursday)',
//     icon: 'issue',
//   },
//   {
//     id: '3',
//     title: 'John Doe promoted to VP of Finance',
//     type: 'Delight',
//     date: 'July 14, 2025, (Monday)',
//     icon: 'delight',
//   },
//   {
//     id: '4',
//     title: 'New partnership announced with Tech Corp',
//     type: 'Delight',
//     date: 'July 10, 2025, (Sunday)',
//     icon: 'delight',
//   },
//   {
//     id: '5',
//     title: 'Product launch delayed due to supply chain',
//     type: 'Issue',
//     date: 'July 5, 2025, (Tuesday)',
//     icon: 'issue',
//   },
//   {
//     id: '6',
//     title: 'Record quarterly revenue achieved',
//     type: 'Delight',
//     date: 'June 30, 2025, (Thursday)',
//     icon: 'delight',
//   },
// ];

// const IdentifiedSignals: React.FC<IdentifiedSignalsProps> = ({
//   activation_id,
//   onDone = () => console.log('Done clicked'),
//   signals = mockSignals,
// }) => {
//   const [showAllSignals, setShowAllSignals] = useState(false);
//   const visibleSignals = showAllSignals ? signals : signals.slice(0, 3);
//   const remainingCount = signals.length - 3;

//   return (
//     <OnboardingLayoutApp>
//       {/* Header */}
//       <div className="text-center mb-8">
//         <h1 className="text-xl font-semibold text-gray-900 mb-4">
//           Agent has identified below signals
//         </h1>
//         <ProgressDots totalSteps={3} currentStep={3} />
//       </div>

//       {/* Content Section */}
//       <div className="flex flex-col gap-6">
//         {/* Signals Section */}
//         {signals.length > 0 && (
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full p-6">
//             <div className="flex flex-col gap-3">
//               {visibleSignals.map((signal) => (
//                 <div
//                   key={signal.id}
//                   className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50/50 transition-colors"
//                 >
//                   <div className="flex items-start gap-3">
//                     {signal.icon === 'issue' ? (
//                       <IssueIcon className="w-4 h-4 flex-shrink-0" />
//                     ) : (
//                       <DelightIcon className="w-4 h-4 flex-shrink-0" />
//                     )}
//                     <div className="flex-1">
//                       <h3 className="font-inter text-sm font-medium text-gray-900">
//                         {signal.title}
//                       </h3>
//                       <p className="font-inter text-xs text-gray-500 mt-1">
//                         {signal.type} {signal.date}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {remainingCount > 0 && !showAllSignals && (
//                 <button
//                   onClick={() => setShowAllSignals(true)}
//                   className="flex items-center gap-2 px-4 py-2 text-sm font-inter text-gray-700 hover:text-gray-900 transition-colors"
//                 >
//                   <ChevronDownIcon className="w-4 h-4" />
//                   Show {remainingCount} more
//                 </button>
//               )}
//             </div>
//           </div>
//         )}

//         <ActionButtons
//           onContinue={onDone}
//           continueLabel="Done"
//           layout="centered"
//           className="w-full"
//         />
//       </div>
//     </OnboardingLayoutApp>
//   );
// };

// export default IdentifiedSignals;
