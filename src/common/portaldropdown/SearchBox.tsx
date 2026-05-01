import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBoxProps {
    onSearch?: (searchText: string) => void;
    placeholder?: string;
    className?: string;
    showIcon?: boolean;
    debounceMs?: number;
}

const SearchBox: React.FC<SearchBoxProps> = ({
    onSearch,
    placeholder = 'Search...',
    className = '',
    showIcon = true,
    debounceMs = 300
}) => {
    const [searchText, setSearchText] = useState('');

    React.useEffect(() => {
        if (!onSearch) return;

        const timer = setTimeout(() => {
            onSearch(searchText);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchText, onSearch, debounceMs]);

    return (
        <div className={`relative ${className}`}>
            {showIcon && (
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            )}
            <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={placeholder}
                className={`w-full text-sm border border-gray-200 rounded-md focus:outline-none focus:border-gray-400 ${
                    showIcon ? 'pl-8 pr-3 py-2' : 'px-3 py-2'
                }`}
            />
        </div>
    );
};

export default SearchBox;