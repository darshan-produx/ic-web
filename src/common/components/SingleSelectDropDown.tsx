
import { Dropdown } from '../../common/Dropdown';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SearchBox from './SearchBox';
interface SingleSelectDropDownProps {
    filteredArr: any[];
    dataFieldToUseForSelection?: string;
    uniqueIdFieldToUseForSelection?: string;
    // selectedSortBy: any[];
    wantToShowSearchBox?: boolean;
    setSearchText?: (text: string) => void;
    typeOfData?: string;
    needOfSortOrder?: boolean;
    triggerTextCss?: string;
    disabled?: boolean;
    // setSelectedSortBy: (value: any[] | ((prev: any[]) => any[])) => void;
    handleSelection: (value: any) => void;
    contentCss?: string;
    customAction?: {
        label: string;
        onClick: () => void;
    };
    isSelected?: boolean;
}
const SingleSelectDropDown = ({
    filteredArr,
    dataFieldToUseForSelection = '',
    // uniqueIdFieldToUseForSelection = '',
    wantToShowSearchBox = false,
    setSearchText,
    typeOfData = ' ',
    needOfSortOrder = false,
    triggerTextCss = '',
    handleSelection,
    disabled = false,
    contentCss = '',
    customAction,

}: SingleSelectDropDownProps) => {
    // const handleSelection = (value: any) => {
    //     const arr = filteredArr?.map((item: any) => (item?.[uniqueIdFieldToUseForSelection] === value?.[uniqueIdFieldToUseForSelection]) ? { ...item, selected: true } : { ...item, selected: false });
    //     setSelectedSortBy([value]);
    // }
    return (
        <Dropdown className="inline-flex h-full w-full relative">
            <Dropdown.Trigger
                type="button"
                className={`h-8 bg-white w-full text-[#202B37] border-[1px] border-[#CED2DA] font-[500] rounded-[8px] text-[12px] px-2 py-2 flex items-center justify-center ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerTextCss} box-border`}
                id="dropdownMenuButton"
                data-bs-toggle="dropdown"
                disabled={disabled}
            >
                <div className="flex items-center justify-between w-full text-nowrap gap-1">
                    <p className="w-fit flex-shrink-0 leading-[20px] tracking-[0%]">
                        {' '}
                        {typeOfData || 'Select'}
                        {/* {selectedSortBy
                        ? '*'
                        : ''} */}
                    </p>
                    <ChevronDown className=" w-[16px] h-[16px] flex-shrink-0" />
                </div>
            </Dropdown.Trigger>
            <Dropdown.Content
                placement="bottom-start"
                className={`absolute z-[9999] h-fit max-h-[350px] p-2 min-w-[250px] ltr:text-left rtl:text-right w-fit bg-white border-[1px] border-[#CED2DA] rounded-lg shadow-md !left-[calc((100wh-1360px)/2)] dropdown-menu dark:bg-zink-600 bg-white scroll max-h-[300px] overflow-y-auto ${contentCss}`}
                aria-labelledby="dropdownMenuButton"
            >
                <ul
                    className="text-sm text-gray-700 dark:text-gray-200 dropdownClick"
                    aria-labelledby="dropdownMenuIconButton"
                >
                    {wantToShowSearchBox && (<li className="h-12 rounded-[6px] py-[6px] mb-1">
                        <SearchBox
                            setSearchText={setSearchText}
                            dataType={"Search"}
                            needBorder={true}
                        />
                    </li>)}
                    {customAction && (
                        <li className="mb-2 pb-2 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={customAction.onClick}
                                className="w-full text-left py-2 px-2 text-[#1A75FF] text-[14px] font-normal hover:bg-gray-50 rounded"
                            >
                                {customAction.label}
                            </button>
                        </li>
                    )}
                    {Array.isArray(filteredArr) && filteredArr.length > 0 ? (
                        filteredArr?.map((item: any, i: number) => (
                            <li key={i}
                                onClick={() => handleSelection && handleSelection(item)
                                }>
                                <div className="flex items-center rounded dark:hover:bg-gray-600 close-dropdown">
                                    <div
                                        className={`w-full py-2 px-2 text-[14px] font-normal text-[#141C24] cursor-pointer hover:text-[#3B82F6] rounded-[8px] flex items-center justify-between text-nowrap flex-shrink-0 close-dropdown ${item?.selected ? 'bg-[#F0F6FF] text-[#3B82F6]' : ''}`}
                                    >
                                        <span className='min-w-0 flex-1 truncate close-dropdown'>
                                            {item?.[dataFieldToUseForSelection]}
                                        </span>
                                        <span className='ml-2 flex items-center gap-2 close-dropdown'>
                                            {item?.is_prospect ? (
                                                <span className="close-dropdown inline-flex items-center px-1 py-0.5 rounded-full border border-[#1A75FF] text-[#1A75FF] text-[9px] leading-[10px] font-medium">
                                                    Prospect
                                                </span>
                                            ) : null}
                                            {needOfSortOrder && (<span className={`flex flex-col gap-1 ${(item?.selected) ? 'visible' : 'invisible'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none" className={`rotate-180 ${item?.sortOrder === 'desc' ? 'opacity-40' : ''}`}>
                                                    <path d="M1.07733 0.912031C1.40277 0.586615 1.9304 0.586615 2.25584 0.912031L4.99992 3.65612L7.744 0.912031C8.06942 0.586615 8.59709 0.586615 8.9225 0.912031C9.24792 1.23745 9.24792 1.76511 8.9225 2.09053L5.58917 5.42387C5.26375 5.74928 4.73609 5.74928 4.41067 5.42387L1.07733 2.09053C0.751894 1.76511 0.751894 1.23745 1.07733 0.912031Z" fill="#3B82F6" />
                                                </svg>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none" className={`${item?.sortOrder === 'asc' ? 'opacity-40' : ''}`}>
                                                    <path d="M1.07733 0.912031C1.40277 0.586615 1.9304 0.586615 2.25584 0.912031L4.99992 3.65612L7.744 0.912031C8.06942 0.586615 8.59709 0.586615 8.9225 0.912031C9.24792 1.23745 9.24792 1.76511 8.9225 2.09053L5.58917 5.42387C5.26375 5.74928 4.73609 5.74928 4.41067 5.42387L1.07733 2.09053C0.751894 1.76511 0.751894 1.23745 1.07733 0.912031Z" fill="#3B82F6" />
                                                </svg>
                                            </span>)}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="py-2 px-2 text-[14px] text-[#637083] text-center">
                            No {typeOfData?.toLowerCase().replace(/select\s*/i, '').replace(/\*/g, '').replace(/\bcase\b/g, 'cases').trim() || 'items'} found
                        </li>
                    )}
                </ul>
            </Dropdown.Content>
        </Dropdown>);
}
export default SingleSelectDropDown;

// item?.[uniqueIdFieldToUseForSelection]?.toLowerCase() === selectedSortBy?.[uniqueIdFieldToUseForSelection as keyof typeof selectedSortBy]?.toString().toLowerCase()


{/* <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none">
<path d="M1.07733 0.912031C1.40277 0.586615 1.9304 0.586615 2.25584 0.912031L4.99992 3.65612L7.744 0.912031C8.06942 0.586615 8.59709 0.586615 8.9225 0.912031C9.24792 1.23745 9.24792 1.76511 8.9225 2.09053L5.58917 5.42387C5.26375 5.74928 4.73609 5.74928 4.41067 5.42387L1.07733 2.09053C0.751894 1.76511 0.751894 1.23745 1.07733 0.912031Z" fill="#3B82F6"/>
</svg> */}