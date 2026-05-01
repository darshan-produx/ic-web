import Link from 'next/link';
import { JourneySignal } from './journey';
import { CommitmentSvgIcon, AppreciationSvgIcon, ExpectationSvgIcon, InformationSvgIcon, IssueSvgIcon, OpportunitySvgIcon, SemiCricleCheckIcon, MeetingMembersdividerLineIcon } from '../../../../../app/assests/icons/icons';
import ReactMarkdown from 'react-markdown';
// import { getIntensityColor } from '../../../common/components/RiskLevelDropdown';
import { ColorBar } from './colorBar';
import dayjs from 'dayjs';

interface SignalProps {
  signal: JourneySignal;
  onMarkAsResolved?: (signalId: string) => void;
  onRemove?: (signalId: string) => void;
  onSignalClick?: (signalId: string) => void;
  setIsSideDrawerOpen: (isOpen: boolean) => void;
  setSelectedSignalId: (signalId: string) => void;
  showTimeline?: boolean;
  showYearOnTimeline?: boolean;
  sortBy?: 'signal_created_at' | 'signal_updated_at';
}

const getSignalBackground = (signal: JourneySignal): string => {
  if (signal?.source === 'manual' && signal?.collection_type === 'phase_changes') {
    return 'bg-[#FEF7E6]';
  }
  if (signal?.source === 'meeting' && signal?.collection_type === 'customer_meeting') {
    return 'bg-gray-50';
  }
  return `bg-white border border-[#E4E7EC] ${signal.is_deleted ? '' : 'cursor-pointer'}`;
};

export const getExpressionSvgIcon = (expression: string, color: string, className = "w-4 h-[13.7px] font-normal mb-[1px]") => {
  const iconProps = { className, stroke: color };
  switch (expression) {
    case 'commitment':
      return <CommitmentSvgIcon {...iconProps} />;
    case 'expectation':
      return <ExpectationSvgIcon {...iconProps} />;
    case 'issue':
      return <IssueSvgIcon {...iconProps} />;
    case 'appreciation':
      return <AppreciationSvgIcon {...iconProps} />;
    case 'information':
      return <InformationSvgIcon {...iconProps} />;
    case 'fact':
      return <InformationSvgIcon {...iconProps} />;
    case 'opportunity':
      return <OpportunitySvgIcon {...iconProps} />;
    default:
      return null;
  }
};

export const getColorForExpressionAndIntensity = (expression: string, intensity: number = 1, is_deleted?: boolean, is_for_border?: boolean, isClosed?: boolean): string => {
  if (is_deleted) {
    return '#97A1AF';
  }
  if (expression === 'appreciation' || isClosed) {
    return '#249782';
  }
  if (expression === 'issue' && intensity >= 4) {
    return '#EF4444';
  } else if (expression === 'issue' && intensity === 3) {
    return '#FF8800';
  } else if (is_for_border) {
    return '#97A1AF';
  } else {
    return '#202B37';
  }
}

export const getBgColorForExpressionAndIntensity = (expression: string, intensity: number, is_deleted?: boolean, isClosed?: boolean): string => {
  if (is_deleted) {
    return '#F2F4F7';
  }
  if (expression === 'appreciation' || isClosed) {
    return '#D9F2E5';
  }
  // if(expression === 'fact' || expression === 'information' || expression === 'commitment' || expression === 'expectation') {
  //   return '#F2F4F7';
  // }
  if (expression === 'issue' && intensity >= 4) {
    return '#FEE7E7';
  } else if (expression === 'issue' && intensity === 3) {
    return '#FFF3E5';
  } else {
    return '#F2F4F7';
  }
}

export const Signal: React.FC<SignalProps> = ({
  signal,
  setIsSideDrawerOpen,
  setSelectedSignalId,
  showTimeline = false,
  showYearOnTimeline = false,
  sortBy = 'signal_updated_at',
}) => {

  const isIssueCommitmentExpectation = signal.signal_types?.some((type: string) =>
    ['issue', 'commitment', 'expectation'].includes(type)
  )
  const isClosed = (signal?.status === "closed" || signal?.status === "resolved") && isIssueCommitmentExpectation;
  const isMeeting = signal?.source === 'meeting' && signal?.collection_type === 'customer_meeting';
  const isPhaseChange = signal?.source === 'manual' && signal?.collection_type === 'phase_changes';
  const isMeetOrPhaseChange = isMeeting || isPhaseChange;

  const getSymbol = () => {
    const borderColor = getColorForExpressionAndIntensity(signal.signal_types[0], signal.intensity, signal?.is_deleted, true, isClosed);
    const bgColor = getBgColorForExpressionAndIntensity(signal.signal_types[0], signal.intensity, signal?.is_deleted, isClosed);
    return (
      <span
        className={`${isMeeting
          ? 'w-5 h-5 border-[3px] rounded-full'
          : 'w-3 h-3 border border-[1px] rounded-full'
          }`}
        style={{
          borderColor: borderColor,
          backgroundColor: bgColor
        }}
      />
    );
  };

  return (
    <div>
      <div className={`relative h-fit mx-auto w-full flex items-start justify-start ${showTimeline ? 'gap-7' : 'gap-0'} ${showTimeline ? 'pb-6' : 'pb-0'}`}>
        {showTimeline && (
          <div className={`absolute h-full w-[30px] flex flex-col items-center gap-1 ${isMeetOrPhaseChange ? 'top-[10px] pb-1 mt-1' : 'top-[10px] pb-1 mt-1'} left-[14.5px]`}>
            {(isPhaseChange) ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" rx="10" fill="#EAB308" />
                <path d="M9.99519 14.6358L6.86999 16.2784C6.19659 16.6326 5.40992 16.0609 5.53825 15.3109L6.13499 11.8306L3.60652 9.36551C3.06139 8.83465 3.36225 7.90958 4.11479 7.79958L7.60919 7.29205L9.17179 4.12518C9.50845 3.44265 10.4811 3.44265 10.8177 4.12518L12.3803 7.29205L15.8748 7.79958C16.6273 7.90878 16.9282 8.83378 16.3832 9.36551L13.8547 11.8306L14.4514 15.3109C14.5797 16.061 13.793 16.6326 13.1197 16.2784L9.99519 14.6358Z" fill="white" />
              </svg>
            ) : (
              getSymbol()
            )}
            <span className='flex-1 border-l border-[#CED2DA]'></span>
            {showYearOnTimeline && <span className='text-xs text-[#97A1AF]'>{dayjs(signal[sortBy]).format('YYYY')}</span>}
          </div>)}
        <div
          className={`${getSignalBackground(
            signal
          )} flex-1 min-w-0 overflow-hidden py-3 px-4 rounded-[12px] ${showTimeline ? 'ml-[70px]' : 'ml-0'}`}
          onClick={() => {
            if (isMeetOrPhaseChange || signal.is_deleted) { return; } else {
              setIsSideDrawerOpen(true);
              setSelectedSignalId(signal._id);
            }
          }}
        >
          {/* Title */}
          {(isMeeting && !signal.is_deleted) ? (<Link
            key={`signal-${signal._id}`}
            href={`/app/communication/meetings/${signal._id}`}
          >

            <ReactMarkdown className="text-[16px] font-medium mb-1 text-[#202B37] hover:text-[#3B82F6] cursor-pointer leading-[24px]">
              {signal?.title || ''}
            </ReactMarkdown>

          </Link>)
            : (
              <ReactMarkdown
                className={`w-full ${signal.is_deleted ? 'text-[#637083]' : 'text-[#202B37]'} ${isMeetOrPhaseChange ? 'text-[16px] font-medium leading-[24px] mb-1' : 'text-[14px] font-normal leading-[20px] mb-2'}
             [&>p]:truncate [&>p]:m-0`}
                components={{
                  p: ({ children }) => (
                    <p className="truncate m-0" title={typeof children === 'string' ? children : undefined}
                    >
                      {children}
                    </p>
                  )
                }}
              >
                {signal?.title || ''}
              </ReactMarkdown>)}

          {isMeetOrPhaseChange && (<ReactMarkdown className="text-[14px] text-[#414E62] mb-2 leading-relaxed">
            {signal?.description || ''}
          </ReactMarkdown>)}
          {/* Signal Types and Status */}
          {/* <div className='flex items-center justify-start mb-1 gap-2'> */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center justify-start gap-2'>
              {!isMeetOrPhaseChange && signal?.signal_types?.map((type, index) => {
                const defaultColor = getColorForExpressionAndIntensity(type, signal.intensity, signal?.is_deleted);
                const finalColor = isClosed && !signal?.is_deleted ? "#249782" : defaultColor;
                return (
                  <span
                    key={index}
                    className="flex items-center text-xs font-medium"
                    style={{ color: finalColor }}
                  >
                    {/* If closed, show green check icon */}
                    {isClosed ? (
                      <SemiCricleCheckIcon className="w-[13.33px] h-[13.33px] mb-[1px]" stroke={finalColor} />
                    ) : (
                      getExpressionSvgIcon(type, finalColor, `${type == 'appreciation' ? 'w-[16.37px] h-[14.53px] font-normal mb-[1px]' : 'w-4 h-[13.7px] font-normal mb-[1px]'}`)
                    )}

                    &nbsp;
                    {/* here if the signal_type is fact then i want to show information */}
                    {type === 'fact' ? 'Information' : type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                );
              })}
              {!isMeetOrPhaseChange && (<span><MeetingMembersdividerLineIcon /></span>)}
              <span className="text-xs text-[#97A1AF]">{dayjs(signal[sortBy]).format('MMM D, YYYY')}</span>
            </div>
            {isIssueCommitmentExpectation && (<ColorBar intensity={signal.intensity} is_deleted={signal.is_deleted} isClosed={isClosed} isIssue={signal.signal_types?.includes('issue') || false} />)}
          </div>
          {/* </div> */}
        </div>
      </div>
    </div>
  );
};