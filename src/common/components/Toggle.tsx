interface ToggleProps {
    toggleOptions: Array<{
        id: string;
        label: string;
        path: string;
        formatter?: string;
        use_default?: boolean;
    }>;
    selectedToggle: any;
    onToggleChange: (option: any) => void;
}
export const Toggle: React.FC<ToggleProps> = (
    {
        toggleOptions, // array of objects
        // is_multi_select, // boolean
        selectedToggle,
        onToggleChange
    }
) => {
    return (
        <div className="w-fit h-8 flex items-center box-border">
            {toggleOptions.map((option: any, index: number) => (
                <span
                    key={index}
                    className={`h-full w-fit text-[#202B37] flex items-center justify-center border-[1px] border-[#CED2DA] box-border border-l-[0px] first:border-l-[1px] first:rounded-l-[8px] last:rounded-r-[8px] cursor-pointer px-3 text-[12px] font-medium ${selectedToggle?.path === option?.path ? 'bg-[#F2F4F7]' : ''} `} // add left border only for the first element
                    onClick={() => onToggleChange && onToggleChange(option)}
                >
                    {option.label}
                </span>
            ))
            }
        </div >
    )
}