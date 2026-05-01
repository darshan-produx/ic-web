import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsersForTask } from '../../app/api/users/users';
import { Check, UserRoundPlus, X, Loader2 } from 'lucide-react';
import { useCheckDomain } from '../../services/mutations/usersMutations';
import { emailRegEx } from '../../app/utils/constant';

interface User {
    email: string;
    value: string;
    label: string;
    name: string;
}

interface AssignToProps {
    value: string | null;
    setValue: (val: string | null) => void;
    setIsDataChanged?: (val: boolean) => void;
    placeholder?: string;
    disabled?: boolean;
    text?: string;
    border?: string;
    dropdown?: string;
    userIcon?: string;
    onChange?: (value: string | null) => void;
}

const AssignTo: React.FC<AssignToProps> = ({
    value,
    setValue,
    // setIsDataChanged,
    placeholder = 'Assign to',
    disabled = false,
    text,
    border,
    dropdown,
    userIcon,
    onChange,
}) => {
    const [searchText, setSearchText] = useState<string>('');
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [filteredOptions, setFilteredOptions] = useState<User[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [isCheckingDomain, setIsCheckingDomain] = useState<boolean>(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const checkDomainMutation = useCheckDomain();

    const { data: existingUsers, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: getUsersForTask,
    });

    // Transform existing users data
    const existingUserOptions = useMemo(() => {
        return (
            existingUsers?.data?.data
                ?.map((ele: any) =>
                    ele.user?._id
                        ? {
                            email: ele.user.email,
                            value: ele.user._id,
                            label: `${ele.user.first_name} ${ele.user.last_name}`,
                            name: `${ele.user.first_name} ${ele.user.last_name}`,
                        }
                        : null
                )
                ?.filter(Boolean) || []
        );
    }, [existingUsers]);
    // Search function
    const performSearch = useCallback(
        async (inputValue: string) => {
            if (inputValue.length < 3) {
                setErrorMessage('Type at least 3 characters to see options');
                setFilteredOptions([]);
                return;
            }

            setErrorMessage('');

            // Filter existing users first
            const matchingUsers = existingUserOptions.filter(
                (user: User) =>
                    user.email.toLowerCase().includes(inputValue.toLowerCase()) ||
                    user.name.toLowerCase().includes(inputValue.toLowerCase()) ||
                    user.label.toLowerCase().includes(inputValue.toLowerCase())
            );
            if (matchingUsers.length > 0) {
                setFilteredOptions(matchingUsers);
                return;
            }

            // If no existing users match and input looks like email, check domain
            if (emailRegEx.test(inputValue)) {
                setIsCheckingDomain(true);
                try {
                    const response = await checkDomainMutation.mutateAsync({
                        email: inputValue,
                    });

                    if (response?.data && [200, 201].includes(response.status)) {
                        setFilteredOptions([
                            {
                                value: inputValue,
                                label: inputValue,
                                name: '',
                                email: inputValue,
                            },
                        ]);
                    } else {
                        setErrorMessage(
                            `Assignment to users in ${inputValue.split('@')[1]} not allowed`
                        );
                        setFilteredOptions([]);
                    }
                } catch (error) {
                    setErrorMessage('Error checking email domain');
                    setFilteredOptions([]);
                } finally {
                    setIsCheckingDomain(false);
                }
            } else {
                setFilteredOptions([]);
            }
        },
        [existingUserOptions]
    );

    // Debounce the search with useEffect
    useEffect(() => {
        if (!searchText.trim()) {
            setFilteredOptions([]);
            setErrorMessage('');
            return;
        }

        const timeoutId = setTimeout(() => {
            performSearch(searchText);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchText, performSearch]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchText(newValue);
        if (newValue === '') {
            setValue(null);
        }
        setIsOpen(true);
    };

    // Handle option selection
    const handleOptionSelect = (option: User) => {
        setValue(option.value);
        setSearchText('');
        setIsOpen(false);
        onChange && onChange?.(option.value);
        // setIsDataChanged(true);
        inputRef.current?.blur();
    };

    // Handle clear selection
    const handleClear = () => {
        setValue('');
        setSearchText('');
        setIsOpen(false);
        onChange && onChange?.(null);
        // setIsDataChanged(true);
        inputRef.current?.focus();
    };

    // Handle input focus
    const handleInputFocus = () => {
        setIsOpen(true);
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get display value for selected user
    const selectedUser = existingUserOptions.find(
        (user: any) => user.value === value
    );
    const displayValue = selectedUser ? selectedUser.label : value;

    // Determine what message to show
    const getStatusMessage = () => {
        if (isLoading) return 'Loading users...';
        if (isCheckingDomain) return 'Checking email domain...';
        if (errorMessage) return errorMessage;
        if (!searchText) return 'Type at least 3 characters to see options';
        if (filteredOptions.length === 0 && searchText.length >= 3)
            return 'No users found';
        return '';
    };

    const statusMessage = getStatusMessage();
    return (
        // <div className='flex flex-col gap-[6px] py-[2.3px] flex-1'>
        <div className="relative h-fit" ref={dropdownRef}>
            {/* Input Field */}
            <div
                className={`flex items-center ${border ? border : 'border border-[#CED2DA] px-2'
                    } w-full rounded-[10px] outline-none ring-0 ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                    }`}
            >
                <UserRoundPlus
                    className={`${userIcon ? userIcon : 'text-[#637083] h-4 w-4'
                        }  flex-shrink-0 `}
                />
                <input
                    ref={inputRef}
                    name="assign-to-input"
                    type="text"
                    className={`px-1 ${text
                        ? text
                        : 'w-full h-10 text-[16px] font-[400] placeholder:text-[16px] placeholder:text-[#637083]'
                        } focus:outline-none disabled:cursor-not-allowed disabled:bg-transparent active:ring-0 active:outline-none`}
                    placeholder={value ? displayValue : placeholder}
                    value={searchText ? searchText : value ? displayValue : ''}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    disabled={disabled}
                    aria-label="Assign to user"
                    autoComplete="off"
                />

                {(value || searchText) && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className={`${userIcon ? userIcon : 'h-[20px] w-[20px]'
                            } flex-shrink-0`}
                        aria-label="Clear selection"
                    >
                        <X className={`${userIcon ? userIcon : 'h-[20px] w-[20px]'}`} />
                    </button>
                )}

                {isCheckingDomain && (
                    <Loader2
                        className={`${userIcon ? userIcon : 'text-[#414E62] h-[20px] w-[20px]'
                            } flex-shrink-0 animate-spin`}
                    />
                )}
            </div>

            {/* Status Message */}
            {/* {statusMessage && (
                    <div className={`text-[12px] mt-1 ${errorMessage ? 'text-red-500' : 'text-[#97A1AF]'
                        }`}>
                        {statusMessage}
                    </div>
                )} */}

            {/* Dropdown */}
            {isOpen && statusMessage && (
                <div
                    className={`absolute w-full ${dropdown ? dropdown : 'bottom-11'
                        } mt-1 bg-white border border-[#E4E7EC] rounded-md shadow-lg z-50 p-3 text-sm text-[#667085] `}
                >
                    {statusMessage}
                </div>
            )}
            {isOpen && filteredOptions.length > 0 && (
                <div
                    className={`absolute w-full ${dropdown ? dropdown : 'bottom-11'
                        } py-2 flex flex-col gap-1 bg-white border border-[#E4E7EC] rounded-md shadow-lg z-50 max-h-48 overflow-y-auto overflow-x-auto scroll`}
                >
                    {filteredOptions.map((option, index) => (
                        <button
                            key={`${option.value}-${index}`}
                            type="button"
                            className="w-full flex justify-between items-center px-3 text-left hover:bg-gray-50 transition-colors"
                            onClick={() => handleOptionSelect(option)}
                        >
                            {/* <div className="mb-2"> */}
                            <span className="text-[12px] text-[#101828] font-normal flex items-center gap-1">
                                <span className='w-6 h-6 font-semibold rounded-full bg-gray-100 flex items-center justify-center'>{option.label.charAt(0).toUpperCase() || option.value.charAt(0).toUpperCase()}</span><span className='text-nowrap'>{option.label || option.value}</span>
                            </span>
                            {/* {option.email && option.label !== option.email && (
                                        <span className="text-[12px] text-[#667085]">
                                            {option.email}
                                        </span>
                                    )} */}
                            {/* </div> */}
                            {/* <Check className="h-[16px] w-[16px] text-[#414E62]" /> */}
                        </button>
                    ))}
                </div>
            )}
        </div>
        // </div>
    );
};

export default AssignTo;