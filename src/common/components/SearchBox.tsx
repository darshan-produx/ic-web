import { useEffect, useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

interface SearchBoxProps {
    searchText?: string;
    dataType?: string;
    needBorder?: boolean;
    needSearchIcon?: boolean;
    setSearchText?: (text: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ dataType = '', needBorder = false, needSearchIcon = true, searchText, setSearchText }) => {
    const [searchTextInput, setSearchTextInput] = useState<string>(searchText || '');
    const debouncedSearchText = useDebounce(searchTextInput, 300);
    const isInitialMount = useRef(true);
    const prevSearchTextProp = useRef(searchText);

    // Update local state when prop changes (from external source like reset)
    useEffect(() => {
        // Only sync if the prop changed from external source (not from our own setSearchText call)
        if (prevSearchTextProp.current !== searchText) {
            setSearchTextInput(searchText || '');
            prevSearchTextProp.current = searchText;
        }
    }, [searchText]);

    // Update parent state when local state changes (user typing)
    useEffect(() => {
        // Skip the initial mount to prevent resetting the prop value
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        
        if (setSearchText && debouncedSearchText !== searchText) {
            setSearchText(debouncedSearchText);
            prevSearchTextProp.current = debouncedSearchText;
        }
    }, [debouncedSearchText, setSearchText, searchText]);
    return (
        <div className={`h-full w-full flex items-center border-[1px] border-[#CED2DA] rounded-[8px] px-[8px]  ${needBorder ? 'border-1' : 'border-none'} box-border`}>
            <span>
                {needSearchIcon && <Search className="h-[20px] w-[20px] text-[#97A1AF]" />}
            </span>
            <input
                type="text"
                name="firstName"
                id="firstName"
                value={searchTextInput}
                autoComplete="off"
                onChange={(e) => setSearchTextInput(e.target.value)}
                className="form-input border-none placeholder:font-normal placeholder:text-[#637083] text-[#202B37] !text-[14px] !pl-1 !pt-0 !pb-0 float-end  dark:border-zink-500 focus:outline-none focus:border-[#202B37] disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800  dark:placeholder:text-zink-200"
                placeholder={`${dataType ? dataType : ''}`}
            />
            <span>
                <X
                    className={`h-[20px] w-[20px] text-black cursor-pointer ${searchTextInput != '' ? 'visible' : 'invisible'
                        }`}
                    onClick={() => setSearchTextInput('')}
                />
            </span>
        </div>
    );
};

export default SearchBox;