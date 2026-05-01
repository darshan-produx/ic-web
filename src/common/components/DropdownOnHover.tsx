import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  ElementType,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import { Transition } from '@headlessui/react';

interface DropdownContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleOpen: () => void;
}

const DropDownContext = createContext<DropdownContextType | undefined>(
  undefined
);

interface DropdownProps {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
}

const DropdownHover = ({
  as: Component = 'div',
  children,
  className,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = useCallback(() => {
    setOpen((previousState) => !previousState);
  }, []); // Empty dependency array

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const targetElement = event.target as Element;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(targetElement) &&
        !targetElement.closest('.flatpickr-calendar') &&
        !targetElement.closest('.dropdownClick')
      ) {
        if (open && toggleOpen) {
          toggleOpen();
        }
      }
    };

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [open, toggleOpen]); // Include toggleOpen as a dependency

  return (
    <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
      <Component
        ref={dropdownRef}
        className={`dropdown ${className}`}
        onMouseEnter={() => setOpen(true)} // Open on hover
        onMouseLeave={() => setOpen(false)} // Close when mouse leaves
      >
        {children}
      </Component>
    </DropDownContext.Provider>
  );
};

interface TriggerProps {
  children: ReactNode;
  type?: ElementType;
  className?: string;
  id?: string;
}

export const Trigger: React.FC<TriggerProps> = ({
  type,
  children,
  className,
  id,
}) => {
  const getClassNameButton = className
    ? className
    : 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';

  const getClassNameLink = className
    ? className
    : 'transition-all duration-200 ease-linear bg-white border-dashed dropdown-toggle text-custom-500 btn border-custom-500 hover:text-custom-500 hover:bg-custom-50 hover:border-custom-600 focus:text-custom-600 focus:bg-custom-50 focus:border-custom-600 active:text-custom-600 active:bg-custom-50 active:border-custom-600 dark:focus:ring-custom-400/20 dark:bg-custom-400/20 ';

  return (
    <>
      {type === 'a' ? (
        <a id={id} href="/#" className={getClassNameLink}>
          {children}
        </a>
      ) : (
        <button id={id} className={getClassNameButton}>
          {children}
        </button>
      )}
    </>
  );
};

interface ContentProps {
  as?: ElementType;
  align?: 'left' | 'right';
  className?: string;
  width?: string;
  contentClasses?: string;
  children: ReactNode;
  placement?:
    | 'right-end'
    | 'start-end'
    | 'top-end'
    | 'bottom-start'
    | 'bottom-end'
    | 'top-start';
}

const Content: React.FC<ContentProps> = ({
  as: Component = 'div',
  className,
  children,
  placement,
}) => {
  const { open } = useContext(DropDownContext)!;

  const getClassName =
    className ||
    'absolute z-50 py-2 mt-1 text-left list-none bg-white rounded-md shadow-md dropdown-menu min-w-max dark:bg-zinc-400';

  const [placementState, setPlacement] = useState('top-start');

  useEffect(() => {
    if (placement) setPlacement(placement);
  }, [placement]); // Add dependency array to useEffect

  const dropdownElementRef = useRef<any>(null);

  const getDropdownStyle = () => {
    const styles: React.CSSProperties = {};

    switch (placementState) {
      case 'right-end':
        styles.transform = 'translate(0px, 10px)';
        styles.inset = '0px 0px auto auto';
        break;
      case 'start-end':
        styles.transform = 'translate(0px, 20px)';
        styles.inset = '0px auto auto 0px';
        break;
      case 'top-end':
        styles.transform = 'translate(-2px, -44px)';
        break;
      case 'bottom-start':
        styles.transform = 'translate(0px, 47px)';
        break;
      case 'bottom-end':
        styles.transform = 'translate(293px, 2px)';
        break;
      case 'top-start':
        styles.transform = 'translate(0px, -127px)';
        styles.inset = '0px 0px auto auto';
        break;
      default:
        break;
    }

    return styles;
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Transition as={React.Fragment} show={open}>
      {(status: any) => (
        <Component
          ref={dropdownElementRef}
          onClick={handleContentClick}
          className={`${getClassName} ${
            status === 'entered' ? 'transition-all' : ''
          }`}
          style={getDropdownStyle()}
        >
          {children}
        </Component>
      )}
    </Transition>
  );
};

DropdownHover.Trigger = Trigger;
DropdownHover.Content = Content;

export { DropdownHover };
