import React, { ElementType } from "react";

interface ModalProps {
    children: React.ReactNode;
    className?: string;
    as?: ElementType;
}

export const ModalTitle = ({ children, className, as: Component = "h5" }: ModalProps) => {
    return (
        <Component className={className ? className : ''}>
            {children}
        </Component>
    )
}

export const ModalBody = ({ children, className, as: Component = "div" }: ModalProps) => {
    return (
        <Component className={className ? className : ''} >
            {children}
        </Component>
    );
}

export const ModalFooter = ({ children, as: Component = "div", className }: ModalProps) => {
    return (
        <Component className={className ? className : ''} >
            {children}
        </Component>
    );
}
