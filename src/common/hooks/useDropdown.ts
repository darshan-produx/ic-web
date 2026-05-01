import { useState, useRef, useCallback } from 'react';

interface UseDropdownReturn {
    isOpen: boolean;
    triggerRef: React.RefObject<HTMLDivElement>;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

export const useDropdown = (initialOpen = false): UseDropdownReturn => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    const triggerRef = useRef<HTMLDivElement>(null);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    return {
        isOpen,
        triggerRef,
        open,
        close,
        toggle
    };
};