'use client';
import React, { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { ProgressDots } from './ProgressDots';

export interface QnAItem {
  _id: string;
  question: string;
  answer: string;
  file_name?: string;
  url?: string;
  relevance_score?: number;
  folder_type?: 'knowledge' | 'customer' | 'no_selection';
  customer_id?: number;
  customer_name?: string;
}

interface QnAResultsProps {
  qnaItems: QnAItem[];
  // onContinue?: () => void;
  isLoading?: boolean;
  hideFooter?: boolean;
}

const TRUNCATE_LENGTH = 150;

const SkeletonCard = ({ delay = 0 }: { delay?: number }) => {
  return (
    <div
      className="border border-gray-200 rounded-xl overflow-hidden relative animate-[fadeIn_0.3s_ease-out_forwards] opacity-0"
      style={{
        height: '66px',
        padding: '14px 16px',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

      <div className="space-y-2">
        <div
          className="bg-gray-200 animate-pulse"
          style={{
            width: '100%',
            height: '15px',
            borderRadius: '40px',
          }}
        ></div>
        <div
          className="bg-gray-200 animate-pulse"
          style={{
            width: '43.6%',
            height: '15px',
            borderRadius: '40px',
          }}
        ></div>
      </div>
    </div>
  );
};

const QnAResults: React.FC<QnAResultsProps> = ({
  qnaItems,
  // onContinue,
  isLoading = false,
  hideFooter = false,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const visibleItems = showAll ? qnaItems : qnaItems.slice(0, 3);
  const remainingCount = qnaItems.length - 3;

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, isExpanded: boolean) => {
    if (isExpanded || text.length <= TRUNCATE_LENGTH) return text;
    return text.slice(0, TRUNCATE_LENGTH) + '...';
  };

  // Calculate skeleton cards needed (only show 3 total items max when loading)
  const loadedCount = qnaItems.length;
  const skeletonCount = isLoading ? Math.max(0, 3 - loadedCount) : 0;
  const displayItems = isLoading ? qnaItems.slice(0, 3) : visibleItems;

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-gray-700 mb-2">
          {isLoading
            ? 'I am finding QnA for you'
            : 'Here are the QnA I have found for you'}
        </h1>
        {isLoading && (
          <ProgressDots totalSteps={3} currentStep={3} className="mt-3" />
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-6">
        {/* QnA Cards Container */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col gap-4">
            {displayItems.map((item, index) => {
              const isExpanded = expandedItems.has(item._id);
              const needsTruncation = item.answer.length > TRUNCATE_LENGTH;

              return (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50/50 transition-colors animate-[fadeInUp_0.5s_ease-out_forwards] opacity-0"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-inter font-normal text-[14px] leading-[20px] text-[#111827]">
                        {item.question}
                      </h3>
                      {item.folder_type === 'customer' && item.customer_name && (
                        <p className="font-inter text-xs text-gray-500 mt-1">
                          {item.customer_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.folder_type && item.folder_type !== 'no_selection' && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {item.folder_type === 'knowledge' ? 'Knowledge' : 'Customer'}
                        </span>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                          title="Open source"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <p className="font-inter font-[350] text-[14px] leading-[20px] text-[#6B7280] flex-1">
                      <span>
                        Answer: {truncateText(item.answer, isExpanded)}
                      </span>
                      {needsTruncation && !isExpanded && (
                        <button
                          onClick={() => toggleExpand(item._id)}
                          className="font-inter font-medium text-[14px] leading-[20px] text-[#374151] hover:text-[#1F2937] ml-1"
                        >
                          More
                        </button>
                      )}
                      {isExpanded && (
                        <button
                          onClick={() => toggleExpand(item._id)}
                          className="font-inter font-medium text-[14px] leading-[20px] text-[#374151] hover:text-[#1F2937] ml-1"
                        >
                          Less
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Show skeleton cards for remaining slots */}
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonCard
                key={`skeleton-${index}`}
                delay={loadedCount * 150 + index * 150}
              />
            ))}

            {/* Show More/Less Button */}
            {!isLoading && qnaItems.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-2 text-gray-700 text-sm font-normal hover:text-gray-900 transition-colors self-start"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showAll ? 'rotate-180' : ''
                  }`}
                />
                <span>
                  {showAll ? 'Show less' : `Show ${remainingCount} more`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Message and Continue Button - Only show when not loading and not hidden */}
        {!isLoading && !hideFooter && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-700 mb-4">
              You can continue working, I will keep tracking in the background
            </p>
            <button
              // onClick={onContinue}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default QnAResults;
