'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Database,
    Layers,
    Settings,
    Sparkles,
    Cog,
    GitBranch,
    BarChart3,
    Settings2,
    PanelLeftClose,
    PanelLeft,
    Search,
    HammerIcon,
    Loader,
} from 'lucide-react';
import SearchBox from '../../../../common/components/SearchBox';
import { getAdminNavigationConfig } from '../../../api/admin/admin';
import { dataConsole, mapping, analytics, setting } from '../../../assests/icons/icons';

interface NavAction {
    id: string;
    label: string;
    type: string;
    style: string;
    behavior: {
        action_type: string;
        method: string;
        endpoint: string;
        payload: string[];
    };
}

interface NavItem {
    id: string;
    label: string;
    icon?: string;
    type: string;
    order: number;
    level: number;
    enabled: boolean;
    children?: NavItem[];
    action?: any;
}

interface AdminNavConfigResponse {
    _id: string;
    org_id: string;
    key: string;
    value: NavItem[];
}

const iconMap: Record<string, React.ReactNode> = {
    database: <Database className="w-4 h-4" />,
    layers: <Layers className="w-4 h-4" />,
    settings: <Settings className="w-4 h-4" />,
    spark: <Sparkles className="w-4 h-4" />,
    cog: <Cog className="w-4 h-4" />,
    flow: <GitBranch className="w-4 h-4" />,
    'bar-chart': <BarChart3 className="w-4 h-4" />,
    'settings-2': <Settings2 className="w-4 h-4" />,
};

const getIcon = (iconName?: string, color?: string, className?: string): React.ReactNode => {
    if (!iconName) return <Database className={className || "w-4 h-4"} />;
    const IconComponent = {
        database: Database,
        layers: Layers,
        settings: Settings,
        spark: Sparkles,
        cog: Cog,
        flow: GitBranch,
        'bar-chart': BarChart3,
        'settings-2': Settings2,
        'dataconsole': dataConsole,
        'mapping': mapping,
        'usageanalytics': analytics,
        'displaysetting': setting
    }[iconName] || Database;
    return <IconComponent
        width={16}
        height={16}
        color={color || "#202B37"}
        className={className || "w-4 h-4 text-[#97A1AF]"}
    />;
    // return React.cloneElement(IconComponent as React.ReactElement, { className: className || "w-4 h-4" });
};

// Get the first leaf node (deepest child of first branch) - only considers enabled items
const getFirstLeafNode = (items: NavItem[]): { node: NavItem; path: string[] } | null => {
    if (!items || items.length === 0) return null;

    // Filter to only enabled items
    const enabledItems = items.filter(item => item.enabled !== false);
    if (enabledItems.length === 0) return null;

    const firstItem = enabledItems[0];
    const enabledChildren = firstItem.children?.filter(child => child.enabled !== false);

    if (!enabledChildren || enabledChildren.length === 0) {
        return { node: firstItem, path: [firstItem.id] };
    }

    const childResult = getFirstLeafNode(enabledChildren);
    if (childResult) {
        return { node: childResult.node, path: [firstItem.id, ...childResult.path] };
    }

    return { node: firstItem, path: [firstItem.id] };
};

// Check if an item or any of its descendants is selected
const isItemOrDescendantSelected = (item: NavItem, selectedId: string | null): boolean => {
    if (!selectedId) return false;
    if (item.id === selectedId) return true;
    if (item.children) {
        return item.children.some((child) => isItemOrDescendantSelected(child, selectedId));
    }
    return false;
};

// ============================================================================
// Recursive Accordion Item Component
// ============================================================================

interface AccordionItemProps {
    item: NavItem;
    expandedItems: Set<string>;
    selectedItem: string | null;
    onToggle: (id: string) => void;
    onSelect: (item: NavItem) => void;
    searchText: string;
    isPanelOpen: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
    item,
    expandedItems,
    selectedItem,
    onToggle,
    onSelect,
    searchText,
    isPanelOpen,
}) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const notExpandedAndAtZeroLevel = !isExpanded && item.level === 0;
    const isSelected = selectedItem === item.id;
    const isGroup = item.type === 'group';

    // Filter children based on enabled status and search text
    const filteredChildren = useMemo(() => {
        if (!item.children) return item.children;

        // First filter out disabled items
        let children = item.children.filter((child) => child.enabled !== false);

        // Then filter by search text if applicable
        if (searchText) {
            children = children.filter((child) =>
                child.label.toLowerCase().includes(searchText.toLowerCase()) ||
                (child.children && child.children.some((grandChild) =>
                    grandChild.enabled !== false && grandChild.label.toLowerCase().includes(searchText.toLowerCase())
                ))
            );
        }

        return children;
    }, [item.children, searchText]);

    // Check if this item matches search
    const matchesSearch = useMemo(() => {
        if (!searchText) return true;
        return item.label.toLowerCase().includes(searchText.toLowerCase());
    }, [item.label, searchText]);

    // Don't render disabled items
    if (item.enabled === false) {
        return null;
    }

    // If item doesn't match search and has no matching children, don't render
    if (searchText && !matchesSearch && (!filteredChildren || filteredChildren.length === 0)) {
        return null;
    }

    const handleClick = () => {
        if (hasChildren) {
            onToggle(item.id);
        } else {
            onSelect(item);
        }
    };

    // Indent based on level
    const paddingLeft = item.level * 26;
    const paddingY = item.level === 0 ? 14 : item.level === 1 ? 10 : 6;

    return (
        <div className="w-full">
            {/* Item Row */}
            <div
                onClick={handleClick}
                className={`
                    text-[14px] flex items-center gap-2 px-3 cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${isSelected ? 'text-gray-900 font-semibold' : ''}
                    ${notExpandedAndAtZeroLevel ? 'text-gray-500' : 'text-gray-900'}
                `}
                style={{ paddingLeft: `${paddingLeft}px`, paddingTop: `${paddingY}px`, paddingBottom: `${paddingY}px` }}
            >
                {/* Icon for top-level items */}
                {item.icon && isPanelOpen && (
                    <span className="flex-shrink-0">
                        {getIcon(item.icon, notExpandedAndAtZeroLevel && !isSelected ? "#97A1AF" : "#202B37")}
                    </span>
                )}

                {/* Label */}
                {isPanelOpen && (
                    <span className={`text-[14px] ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                        {item.label}
                    </span>
                )}

                {/* Chevron for expandable items */}
                {hasChildren && isPanelOpen && (
                    <motion.span
                        initial={false}
                        animate={{ rotate: isExpanded ? 0 : -180 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 text-gray-500 font-semibold"
                    >
                        <ChevronUp className="w-4 h-4" />
                    </motion.span>
                )}
            </div>

            {/* Children */}
            <AnimatePresence initial={false}>
                {hasChildren && isExpanded && isPanelOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        {filteredChildren?.map((child) => (
                            <AccordionItem
                                key={child.id}
                                item={child}
                                expandedItems={expandedItems}
                                selectedItem={selectedItem}
                                onToggle={onToggle}
                                onSelect={onSelect}
                                searchText={searchText}
                                isPanelOpen={isPanelOpen}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================================
// Main Admin Sidebar Component
// ============================================================================

const AdminSidebar: React.FC<{ selectedView: NavItem | null; setSelectedView: (view: NavItem | null) => void }> = (
    { selectedView, setSelectedView }
) => {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [searchText, setSearchText] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    // Fetch navigation config
    const { data: adminNavConfig, isLoading } = useQuery({
        queryKey: ['adminNavigationConfig'],
        queryFn: async (): Promise<AdminNavConfigResponse> => {
            const response = await getAdminNavigationConfig();
            return response.data as AdminNavConfigResponse;
        },
        refetchOnWindowFocus: false,
    });

    // Navigation items from API
    const navItems: NavItem[] = adminNavConfig?.value ?? [];

    // Initialize default selection and expansion on first load
    useEffect(() => {
        if (navItems.length > 0 && !isInitialized) {
            const firstLeaf = getFirstLeafNode(navItems);
            if (firstLeaf) {
                // Set the first leaf node as selected
                setSelectedView(firstLeaf.node);
                // Expand all parents in the path
                setExpandedItems(new Set(firstLeaf.path));
            }
            setIsInitialized(true);
        }
    }, [navItems, isInitialized, setSelectedView]);

    // Toggle accordion item
    const handleToggle = useCallback((id: string) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    // Handle leaf node selection
    const handleSelect = useCallback((item: NavItem) => {
        setSelectedView(item);
    }, [setSelectedView]);

    // Filter top-level items based on enabled status and search
    const filteredNavItems = useMemo(() => {
        const filterRecursive = (items: NavItem[]): NavItem[] => {
            return items
                .filter((item) => item.enabled !== false) // Filter out disabled items
                .filter((item) => {
                    if (!searchText) return true;
                    const matchesLabel = item.label.toLowerCase().includes(searchText.toLowerCase());
                    const hasMatchingChildren = item.children && filterRecursive(item.children).length > 0;
                    return matchesLabel || hasMatchingChildren;
                });
        };

        return filterRecursive(navItems);
    }, [navItems, searchText]);

    // Auto-expand items when searching
    React.useEffect(() => {
        if (searchText) {
            const getAllIds = (items: NavItem[]): string[] => {
                return items.reduce<string[]>((acc, item) => {
                    acc.push(item.id);
                    if (item.children) {
                        acc.push(...getAllIds(item.children));
                    }
                    return acc;
                }, []);
            };
            setExpandedItems(new Set(getAllIds(navItems)));
        }
    }, [searchText, navItems]);

    // Panel animation variants
    const panelVariants = {
        open: {
            width: 300,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            },
        },
        closed: {
            width: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30,
            },
        },
    };

    // Collapsed sidebar width
    const COLLAPSED_WIDTH = 70;

    return (
        <motion.div
            className="h-full flex-shrink-0 relative overflow-hidden"
            initial={false}
            animate={{ width: isPanelOpen ? 300 : COLLAPSED_WIDTH }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Collapsed Sidebar - Shows when panel is closed */}
            <AnimatePresence mode="wait">
                {!isPanelOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-0 bg-white border-r-[1px] border-gray-200 flex flex-col items-center py-5 z-10"
                    >
                        {/* Open Panel Button */}
                        <button
                            onClick={() => setIsPanelOpen(true)}
                            className="mb-5"
                            aria-label="Open panel"
                            title="Open panel"
                        >
                            <svg width="18" height="18" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.45866 0H11.4587C11.7087 0 11.9537 0.00833337 12.1912 0.02C12.2242 0.01078 12.2579 0.00409389 12.292 0C12.3666 0.0012984 12.4403 0.0162683 12.5095 0.0441666C16.2812 0.3375 17.917 2.30083 17.917 6.45833V11.4583C17.917 15.6158 16.2812 17.5792 12.5095 17.875C12.4401 17.902 12.3664 17.9162 12.292 17.9167C12.2579 17.9126 12.2242 17.9059 12.1912 17.8967C11.9537 17.9083 11.712 17.9167 11.4587 17.9167H6.45866C1.93199 17.9167 0.000324249 15.9858 0.000324249 11.4583V6.45833C0.000324249 1.93083 1.93199 0 6.45866 0ZM12.917 16.5833C15.652 16.2383 16.667 14.7708 16.667 11.46V6.45833C16.667 3.1475 15.652 1.68 12.917 1.335V16.5833ZM1.25032 11.4583C1.25032 15.3033 2.61366 16.6667 6.45866 16.6667H11.4587C11.5312 16.6667 11.5962 16.6667 11.667 16.6617V1.255C11.5962 1.255 11.5312 1.25 11.4587 1.25H6.45866C2.61366 1.25 1.25032 2.61333 1.25032 6.45833V11.4583ZM6.01699 7.2675L7.70866 8.95833L6.01783 10.6492C5.9581 10.7068 5.91046 10.7757 5.87767 10.852C5.84488 10.9282 5.8276 11.0102 5.82684 11.0932C5.82608 11.1762 5.84185 11.2585 5.87324 11.3353C5.90463 11.4121 5.951 11.4819 6.00966 11.5407C6.06832 11.5994 6.13808 11.6458 6.21487 11.6773C6.29167 11.7087 6.37396 11.7246 6.45694 11.7239C6.53993 11.7232 6.62195 11.706 6.69822 11.6733C6.77449 11.6406 6.84348 11.593 6.90116 11.5333L9.03449 9.4C9.09254 9.34203 9.1386 9.27318 9.17002 9.1974C9.20145 9.12161 9.21762 9.04038 9.21762 8.95833C9.21762 8.87629 9.20145 8.79506 9.17002 8.71927C9.1386 8.64348 9.09254 8.57464 9.03449 8.51667L6.90116 6.38333C6.78323 6.26954 6.62532 6.20662 6.46145 6.20812C6.29758 6.20962 6.14085 6.27542 6.02502 6.39136C5.9092 6.50729 5.84354 6.66408 5.84219 6.82796C5.84085 6.99183 5.90309 7.14968 6.01699 7.2675Z" fill="black" />
                            </svg>
                        </button>

                        {/* Search Icon */}
                        <button
                            onClick={() => setIsPanelOpen(true)}
                            className="w-[35px] h-8 flex items-center border border-gray-200 rounded-[6px] mb-6"
                            aria-label="Search"
                            title="Search"
                        >
                            <Search className="w-[15px] h-[15px] mx-auto text-gray-400" />
                        </button>

                        {/* Divider */}
                        {/* <div className="w-6 h-px bg-gray-200 dark:bg-zinc-700 mb-3" /> */}

                        {/* Level 0 Navigation Icons */}
                        <div className="flex flex-col items-center gap-6 flex-1 overflow-y-auto">
                            {navItems.filter((item) => item.enabled !== false).map((item) => {
                                const isActive = isItemOrDescendantSelected(item, selectedView?.id ?? null);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setIsPanelOpen(true);
                                            // Expand this item if it has children
                                            if (item.children && item.children.length > 0) {
                                                setExpandedItems((prev) => new Set([...prev, item.id]));
                                            }
                                        }}
                                        className={`
                                            p-2 rounded-md transition-colors
                                            ${isActive
                                                ? 'bg-[#F2F4F7] text-black'
                                                : 'hover:bg-gray-100  text-gray-400'
                                            }
                                        `}
                                        aria-label={item.label}
                                        title={item.label}
                                    >
                                        {getIcon(item.icon, isActive ? "#202B37" : "#97A1AF")}

                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Panel */}
            <motion.div
                initial={false}
                animate={{
                    opacity: isPanelOpen ? 1 : 0
                }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                }}
                className="absolute inset-0 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-700 overflow-hidden z-20 "
                style={{ pointerEvents: isPanelOpen ? 'auto' : 'none' }}
            >
                <div className="flex flex-col h-full" style={{ width: 300 }}>
                    {/* Header with Title and Toggle Button */}
                    <div className="flex items-center justify-between py-5 px-6">
                        {/* Title */}
                        <h2 className="text-[14px] font-semibold text-gray-900">
                            Admin
                        </h2>

                        {/* Toggle Button - Top Right */}
                        <button
                            onClick={() => setIsPanelOpen(false)}
                            className="w-fit pr-1"
                        // aria-label="Close panel"
                        >
                            <svg width="18" height="18" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11.4583 0H6.45833C6.20833 0 5.96333 0.00833337 5.72583 0.02C5.69278 0.01078 5.65907 0.00409389 5.625 0C5.55041 0.0012984 5.47669 0.0162683 5.4075 0.0441666C1.63583 0.3375 0 2.30083 0 6.45833V11.4583C0 15.6158 1.63583 17.5792 5.4075 17.875C5.47685 17.902 5.55057 17.9162 5.625 17.9167C5.65907 17.9126 5.69278 17.9059 5.72583 17.8967C5.96333 17.9083 6.205 17.9167 6.45833 17.9167H11.4583C15.985 17.9167 17.9167 15.9858 17.9167 11.4583V6.45833C17.9167 1.93083 15.985 0 11.4583 0ZM5 16.5833C2.265 16.2383 1.25 14.7708 1.25 11.46V6.45833C1.25 3.1475 2.265 1.68 5 1.335V16.5833ZM16.6667 11.4583C16.6667 15.3033 15.3033 16.6667 11.4583 16.6667H6.45833C6.38583 16.6667 6.32083 16.6667 6.25 16.6617V1.255C6.32083 1.255 6.38583 1.25 6.45833 1.25H11.4583C15.3033 1.25 16.6667 2.61333 16.6667 6.45833V11.4583ZM11.9 7.2675L10.2083 8.95833L11.8992 10.6492C11.9589 10.7068 12.0065 10.7757 12.0393 10.852C12.0721 10.9282 12.0894 11.0102 12.0902 11.0932C12.0909 11.1762 12.0751 11.2585 12.0438 11.3353C12.0124 11.4121 11.966 11.4819 11.9073 11.5407C11.8487 11.5994 11.7789 11.6458 11.7021 11.6773C11.6253 11.7087 11.543 11.7246 11.46 11.7239C11.3771 11.7232 11.295 11.706 11.2188 11.6733C11.1425 11.6406 11.0735 11.593 11.0158 11.5333L8.8825 9.4C8.82445 9.34203 8.77839 9.27318 8.74697 9.1974C8.71555 9.12161 8.69937 9.04038 8.69937 8.95833C8.69937 8.87629 8.71555 8.79506 8.74697 8.71927C8.77839 8.64348 8.82445 8.57464 8.8825 8.51667L11.0158 6.38333C11.1338 6.26954 11.2917 6.20662 11.4555 6.20812C11.6194 6.20962 11.7761 6.27542 11.892 6.39136C12.0078 6.50729 12.0735 6.66408 12.0748 6.82796C12.0761 6.99183 12.0139 7.14968 11.9 7.2675Z" fill="black" />
                            </svg>
                        </button>
                    </div>

                    {/* Search Box */}
                    <div className="h-8 mb-4 px-6">
                        <SearchBox
                            searchText={searchText}
                            setSearchText={setSearchText}
                            needBorder={true}
                            dataType="Search"
                        />
                    </div>

                    {/* Navigation Items */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 scroll">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                            </div>
                        ) : filteredNavItems.length > 0 ? (
                            filteredNavItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    item={item}
                                    expandedItems={expandedItems}
                                    selectedItem={selectedView?.id ?? null}
                                    onToggle={handleToggle}
                                    onSelect={handleSelect}
                                    searchText={searchText}
                                    isPanelOpen={isPanelOpen}
                                />
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                No items found
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminSidebar;