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

export const DropDownContext = createContext<DropdownContextType | undefined>(
  undefined
);

interface DropdownProps {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
}

const Dropdown = ({
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

      if (targetElement.classList.contains('close-dropdown')) {
        if (open && toggleOpen) {
          toggleOpen();
        }
        return;
      }
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
      <Component ref={dropdownRef} className={`dropdown ${className}`}>
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
  href?: any;
  disabled?: boolean;
}

export const Trigger: React.FC<TriggerProps> = ({
  type,
  children,
  className,
  id,
  disabled=false,
}) => {
  const { open, toggleOpen } = useContext(DropDownContext)!;

  const getClassNameButton = className
    ? className
    : 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded';
  const getClassNameLink = className
    ? className
    : 'transition-all duration-200 ease-linear bg-white border-dashed dropdown-toggle text-custom-500 btn border-custom-500 hover:text-custom-500 hover:bg-custom-50 hover:border-custom-600 focus:text-custom-600 focus:bg-custom-50 focus:border-custom-600 active:text-custom-600 active:bg-custom-50 active:border-custom-600 dark:focus:ring-custom-400/20 dark:bg-custom-400/20 ';
  return (
    <>
      {type === 'a' ? (
        <a
          id={id}
          href="/#"
          onClick={(e: any) => {
            e.preventDefault();
            toggleOpen();
          }}
          className={getClassNameLink + (open ? ' show' : '')}
        >
          {children}
        </a>
      ) : (
        <button
          id={id}
          onClick={toggleOpen}
          className={getClassNameButton}
          disabled={disabled}
        >
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
    | 'bottom'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end'
    | 'top-start'
    | 'top-center'
    | 'bottom-end-customer'
    | 'top-middle'
    | 'bottom-middle'
    | 'bottom-middle-start'
    | 'top';

}

const Content: React.FC<ContentProps> = ({
  as: Component = 'div',
  className,
  children,
  placement,
}) => {
  const { open, setOpen } = useContext(DropDownContext)!;

  const getClassName =
    className ||
    'absolute z-50 py-2 mt-1 text-left list-none bg-white rounded-md shadow-md dropdown-menu min-w-max dark:bg-zink-400';

  const [placementState, setPlacement] = useState('top-start');

  useEffect(() => {
    if (placement) setPlacement(placement);
  }, [placement]); // Add dependency array to useEffect

  const dropdownElementRef = useRef<any>(null);

  const isRtl = typeof document !== 'undefined' ? document.getElementsByTagName('html')[0].getAttribute('dir') : null;

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
        styles.transform = 'translate(-2px, -103%)';
        break;
      case 'top-middle':
        styles.transform = 'translate(-69%, -26%)';
        break;
      case 'top-center':
        styles.transform = 'translate(105%, -95%)';
        break;
      case 'bottom-start':
        styles.transform = 'translate(0px, 42px)';
        break;
      case 'bottom-center':
        styles.transform = 'translate(0px, 55%)';
        break;
      case 'bottom-end':
        styles.transform = 'translate(0px, 46px)';
        break;
      case 'bottom-end-customer':
        styles.transform = 'translate(0px, 42px)';
        break;
      case 'bottom':
        styles.transform = 'translate(0px, 0px)';
        break;
      case 'bottom-middle':
        styles.transform = 'translate(0px, -48px)';
        break;
      case 'bottom-middle-start':
        styles.transform = 'translate(0px, -50px)';
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

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;

export { Dropdown };
