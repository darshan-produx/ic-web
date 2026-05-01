import { ReactNode } from 'react';

// Menu component with Tailwind CSS
const Menu = (props: JSX.IntrinsicElements['div']) => (
  <div className="bg-white rounded-lg shadow-md mt-2 absolute" {...props} />
);

// Blanket component with Tailwind CSS
const Blanket = (props: JSX.IntrinsicElements['div']) => (
  <div className="fixed inset-0 " {...props} />
);

export const Dropdown = ({
  children,
  isOpen,
  target,
  onClose,
}: {
  children?: ReactNode;
  readonly isOpen: boolean;
  readonly target: ReactNode;
  readonly onClose: () => void;
}) => (
  <div className="relative">
    {target}
    {isOpen && <Menu>{children}</Menu>}
    {isOpen && <Blanket onClick={onClose} />}
  </div>
);
