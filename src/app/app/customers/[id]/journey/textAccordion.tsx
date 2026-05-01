import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TextAccordionProps {
  content: string | string[];
  maxPreviewLength?: number;
}

export const TextAccordion: React.FC<TextAccordionProps> = ({
  content,
  maxPreviewLength = 100,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedHeight, setExpandedHeight] = useState<number>(0);
  const [collapsedHeight, setCollapsedHeight] = useState<number>(0);
  const expandedContentRef = useRef<HTMLDivElement>(null);
  const collapsedContentRef = useRef<HTMLDivElement>(null);

  // Handle both string and array of strings
  const contentArray = Array.isArray(content) ? content : [content];
  const fullContent = contentArray.join(' ');
  
  const shouldShowToggle = fullContent.length > maxPreviewLength;
  
  // Update height when expansion state changes
  useEffect(() => {
    if (expandedContentRef.current) {
      setExpandedHeight(expandedContentRef.current.scrollHeight);
    }
    if (collapsedContentRef.current) {
      setCollapsedHeight(collapsedContentRef.current.scrollHeight);
    }
  }, [content]);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Render content based on type and expansion state3
  const renderContent = () => {
    if (Array.isArray(content)) {
      // If it's an array of strings
      if (isExpanded || !shouldShowToggle) {
        return (
          <div className="space-y-2">
            {content.map((item, index) => (
              <p key={index} className="text-[14px] text-[#202B37] leading-relaxed">
                {item}
              </p>
            ))}
          </div>
        );
      } else {
        // Show truncated version of first item
        const firstItem = content[0] || '';
        const truncatedContent = firstItem.length > maxPreviewLength 
          ? `${firstItem.slice(0, maxPreviewLength)}...` 
          : firstItem;
        
        return (
          <p className="text-[14px] text-[#202B37] leading-relaxed">
            {truncatedContent}
            {content.length > 1 && ` (+${content.length - 1} more updates)`}
          </p>
        );
      }
    } else {
      // If it's a single string
      const displayContent = isExpanded || !shouldShowToggle 
        ? content 
        : `${content.slice(0, maxPreviewLength)}...`;
      
      return (
        <p className="text-[14px] text-[#202B37] leading-relaxed">
          {displayContent}
        </p>
      );
    }
  };

  return (
    <div className="mt-2">
      {/* Hidden elements to measure heights */}
      <div className="absolute opacity-0 pointer-events-none" style={{ top: '-9999px' }}>
        <div ref={expandedContentRef} className="space-y-2">
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <p key={index} className="text-[14px] text-[#202B37] leading-relaxed">
                {item}
              </p>
            ))
          ) : (
            <p className="text-[14px] text-[#202B37] leading-relaxed">
              {content}
            </p>
          )}
        </div>
        <div ref={collapsedContentRef}>
          {Array.isArray(content) ? (
            <p className="text-[14px] text-[#202B37] leading-relaxed">
              {(() => {
                const firstItem = content[0] || '';
                const truncatedContent = firstItem.length > maxPreviewLength 
                  ? `${firstItem.slice(0, maxPreviewLength)}...` 
                  : firstItem;
                return truncatedContent + (content.length > 1 ? ` (+${content.length - 1} more updates)` : '');
              })()}
            </p>
          ) : (
            <p className="text-[14px] text-[#202B37] leading-relaxed">
              {content.length > maxPreviewLength ? `${content.slice(0, maxPreviewLength)}...` : content}
            </p>
          )}
        </div>
      </div>

      {/* Visible animated content */}
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          height: isExpanded 
            ? (expandedHeight > 0 ? `${expandedHeight}px` : 'auto')
            : (collapsedHeight > 0 ? `${collapsedHeight}px` : 'auto')
        }}
      >
        <div>
          {renderContent()}
        </div>
      </div>

      {shouldShowToggle && (
        <button
          onClick={toggleExpanded}
          className="flex items-center gap-1 mt-2 text-sm font-normal text-[#202B37] transition-all duration-300 ease-in-out"
        >
          <div className="transition-transform duration-300 ease-in-out" style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            <ChevronDown size={16} />
          </div>
          <span className="transition-opacity duration-300 ease-in-out">
            {isExpanded ? 'less' : 'more'}
          </span>
        </button>
      )}
    </div>
  );
};