import React, { useContext } from 'react';
import { Dropdown, DropDownContext } from '../Dropdown';
import { ColorBar } from '../../app/app/customers/[id]/journey/colorBar';

interface RiskLevelDropdownProps {
  intensity: number;
  onIntensityChange: (newIntensity: number) => void;
  isIssue?: boolean;
  disabled?: boolean;
}

// Inner component to access dropdown context
export const RiskLevelDropdownContent: React.FC<{
  intensity: number;
  onIntensityChange: (newIntensity: number) => void;
  disabled?: boolean;
  onClose?: () => void; // Optional callback for standalone usage
}> = ({ intensity, onIntensityChange, disabled = false, onClose }) => {
  // Context is optional - will be undefined when used outside Dropdown
  const dropdownContext = useContext(DropDownContext);

  const handleCircleClick = (level: number) => {
    if (!disabled) {
      onIntensityChange(level);
      // Close dropdown if inside Dropdown context, or call onClose callback
      dropdownContext?.setOpen(false);
      onClose?.();
    }
  };

  return (
    <div className="flex items-center justify-between gap-1 aligned-center">
      {[1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          onClick={() => handleCircleClick(level)}
          className={`
            rounded-full 
            border-2 
            transition-all 
            duration-200 
            box-border
            w-5 h-5
            flex 
            items-center 
            justify-center
            ${!disabled ? 'hover:border-[#1A75FF] cursor-pointer' : 'cursor-not-allowed opacity-50'}
            ${level <= intensity
              ? 'border-[#1A75FF]'
              : 'border-[#CED2DA] bg-white'
            }
          `}
          disabled={disabled}
        >
          <div className={`
            rounded-full transition-all duration-200
            ${level <= intensity
              ? 'w-3 h-3 bg-[#1A75FF]'
              : 'w-0 h-0 bg-transparent'
            }
          `} />
        </button>
      ))}
    </div>
  );
};

const RiskLevelDropdown: React.FC<RiskLevelDropdownProps> = ({
  intensity,
  onIntensityChange,
  isIssue = false,
  disabled = false,
}) => {

  return (
    <Dropdown className="relative inline-block">
      <Dropdown.Trigger
        type="button"
        className={`flex items-center gap-2 text-xs font-medium text-[#202B37] py-2 px-3 border border-[#E4E7EC] rounded-[6px] cursor-pointer ${disabled ? 'opacity-80 !cursor-not-allowed' : ''}`}
        disabled={disabled}
      >
        <span>Intensity</span>
        <ColorBar intensity={intensity} isIssue={isIssue} />
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="#637083"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Dropdown.Trigger>

      <Dropdown.Content
        placement="bottom-start"
        className="w-[150px] h-[44px] absolute z-50 bg-white rounded-[12px] border border-[#CED2DA] p-3 top-[-5px] left-0 box-border"
      >
        <RiskLevelDropdownContent
          intensity={intensity}
          onIntensityChange={onIntensityChange}
          disabled={disabled}
        />
      </Dropdown.Content>
    </Dropdown>
  );
};

export default RiskLevelDropdown;
