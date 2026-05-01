import React, { useCallback, useMemo } from 'react';

type SizeVariant = 'sm' | 'md' | 'lg' ;

interface LevelSelectorProps {
  /** Total number of levels to display (e.g., 5 for levels 1-5) */
  totalLevels: number;
  /** Array of currently selected level numbers */
  selectedLevels: number[];
  /** Callback fired when selection changes */
  onSelectionChange: (levels: number[]) => void;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Size variant for the level blocks */
  size?: SizeVariant;
  /** Custom color for active/selected state (hex or tailwind class) */
  activeColor?: string;
  /** Custom color for inactive/unselected border */
  inactiveColor?: string;
  /** Custom color for inactive/unselected background */
  inactiveBgColor?: string;
  /** Minimum number of levels that must be selected */
  minSelection?: number;
  /** Maximum number of levels that can be selected */
  maxSelection?: number;
  /** Starting level number (default: 1) */
  startLevel?: number;
  /** Custom class name for the container */
  className?: string;
  /** Gap between level blocks (tailwind gap class) */
  gap?: string;
  /** Whether to show level numbers inside blocks (default: true) */
  showLabels?: boolean;
  /** Custom render function for each level button */
  renderLevel?: (props: LevelRenderProps) => React.ReactNode;
  /** Callback when selection is attempted but blocked (e.g., min/max constraints) */
  onSelectionBlocked?: (reason: 'min' | 'max', level: number) => void;
  /** Label to display before the level blocks */
  label?: string;
}

export interface LevelRenderProps {
  level: number;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  size: SizeVariant;
  activeColor: string;
  inactiveColor: string;
  inactiveBgColor: string;
}

const SIZE_CONFIG: Record<SizeVariant, { block: string; font: string; radius: string }> = {
  sm: { block: 'w-6 h-6', font: 'text-xs', radius: 'rounded' },
  md: { block: 'w-8 h-8', font: 'text-sm', radius: 'rounded-md' },
  lg: { block: 'w-10 h-10', font: 'text-base', radius: 'rounded-md' },
};
  
export const LevelSelector: React.FC<LevelSelectorProps> = ({
  totalLevels,
  selectedLevels,
  onSelectionChange,
  disabled = false,
  size = 'md',
  activeColor = '#1A75FF',
  inactiveColor = '#CED2DA',
  inactiveBgColor = 'white',
  minSelection,
  maxSelection,
  startLevel = 1,
  className = '',
  gap = 'gap-1',
  showLabels = true,
  renderLevel,
  onSelectionBlocked,
  label,
}) => {
  // Generate array of levels based on startLevel and totalLevels
  const levels = useMemo(() => {
    return Array.from({ length: totalLevels }, (_, i) => startLevel + i);
  }, [totalLevels, startLevel]);

  // Check if a level is selected
  const isLevelSelected = useCallback(
    (level: number) => selectedLevels.includes(level),
    [selectedLevels]
  );

  // Handle level toggle
  const handleLevelClick = useCallback(
    (level: number) => {
      if (disabled) return;

      const isSelected = isLevelSelected(level);

      if (isSelected) {
        // Trying to deselect
        if (minSelection !== undefined && selectedLevels.length <= minSelection) {
          onSelectionBlocked?.('min', level);
          return;
        }
        // Remove from selection
        onSelectionChange(selectedLevels.filter((l) => l !== level));
      } else {
        // Trying to select
        if (maxSelection !== undefined && selectedLevels.length >= maxSelection) {
          onSelectionBlocked?.('max', level);
          return;
        }
        // Add to selection (maintain sorted order)
        const newSelection = [...selectedLevels, level].sort((a, b) => a - b);
        onSelectionChange(newSelection);
      }
    },
    [disabled, isLevelSelected, selectedLevels, minSelection, maxSelection, onSelectionChange, onSelectionBlocked]
  );

  const sizeConfig = SIZE_CONFIG[size];

  // Default level renderer
  const defaultRenderLevel = useCallback(
    ({ level, isSelected, isDisabled, onClick }: LevelRenderProps) => {
      const canDeselect = minSelection === undefined || selectedLevels.length > minSelection;
      const canSelect = maxSelection === undefined || selectedLevels.length < maxSelection;
      const isInteractive = !isDisabled && (isSelected ? canDeselect : canSelect);

      return (
        <button
          key={level}
          type="button"
          onClick={onClick}
          className={`
            ${sizeConfig.block}
            ${sizeConfig.radius}
            border
            transition-all 
            duration-200 
            box-border
            flex 
            items-center 
            justify-center
            font-normal
            ${sizeConfig.font}
            ${isInteractive ? 'cursor-pointer' : ''}
            ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
            ${!isInteractive && !isDisabled ? 'cursor-not-allowed' : ''}
          `}
          style={{
            borderColor: isSelected ? activeColor : inactiveColor,
            // backgroundColor: isSelected ? activeColor : inactiveBgColor,
            color: isSelected ? activeColor : '#202B37',
          }}
          disabled={isDisabled}
          aria-pressed={isSelected}
          aria-label={`Level ${level}${isSelected ? ' selected' : ''}`}
        >
          {showLabels && level}
        </button>
      );
    },
    [sizeConfig, activeColor, inactiveColor, inactiveBgColor, showLabels, minSelection, maxSelection, selectedLevels.length]
  );

  return (
    <div
      className={`flex items-center ${gap} ${className}`}
      role="group"
      aria-label="Level selector"
    >
      {label && (
        <span className="text-sm text-gray-600 mr-2">{label}</span>
      )}
      {levels.map((level) => {
        const isSelected = isLevelSelected(level);
        const levelRenderProps: LevelRenderProps = {
          level,
          isSelected,
          isDisabled: disabled,
          onClick: () => handleLevelClick(level),
          size,
          activeColor,
          inactiveColor,
          inactiveBgColor,
        };

        return renderLevel
          ? renderLevel(levelRenderProps)
          : defaultRenderLevel(levelRenderProps);
      })}
    </div>
  );
};

/**
 * Utility hook for managing level selection state
 */
export const useLevelSelection = (initialLevels: number[] = []) => {
  const [selectedLevels, setSelectedLevels] = React.useState<number[]>(initialLevels);

  const clearSelection = useCallback(() => setSelectedLevels([]), []);
  
  const selectAll = useCallback((totalLevels: number, startLevel = 1) => {
    setSelectedLevels(Array.from({ length: totalLevels }, (_, i) => startLevel + i));
  }, []);

  const toggleLevel = useCallback((level: number) => {
    setSelectedLevels((prev) =>
      prev.includes(level)
        ? prev.filter((l) => l !== level)
        : [...prev, level].sort((a, b) => a - b)
    );
  }, []);

  return {
    selectedLevels,
    setSelectedLevels,
    clearSelection,
    selectAll,
    toggleLevel,
  };
};

export default LevelSelector;
