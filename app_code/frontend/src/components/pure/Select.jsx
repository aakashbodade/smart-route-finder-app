import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = ({ value, onValueChange, children, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleValueChange = (newValue, displayText) => {
        onValueChange?.(newValue);
        setIsOpen(false);
    };

    // Find the display text for the current value
    const getDisplayText = () => {
        let displayText = '';
        
        const findTextInChildren = (children) => {
            React.Children.forEach(children, (child) => {
                if (React.isValidElement(child)) {
                    if (child.type === SelectContent) {
                        React.Children.forEach(child.props.children, (item) => {
                            if (React.isValidElement(item) && item.props.value === value) {
                                displayText = typeof item.props.children === 'string' 
                                    ? item.props.children 
                                    : item.props.children;
                            }
                        });
                    }
                }
            });
        };

        if (value) {
            findTextInChildren(children);
        }
        
        return displayText;
    };

    return (
        <div ref={selectRef} className="relative">
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(child, {
                        isOpen,
                        setIsOpen,
                        value,
                        onValueChange: handleValueChange,
                        displayText: getDisplayText(),
                        disabled,
                    })
                    : child
            )}
        </div>
    );
};

export const SelectTrigger = ({ children, className = '', isOpen, setIsOpen, displayText, disabled }) => {
    return (
        <button
            type="button"
            className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            onClick={() => !disabled && setIsOpen?.(!isOpen)}
            disabled={disabled}
        >
            {React.Children.map(children, (child) =>
                React.isValidElement(child)
                    ? React.cloneElement(child, { displayText })
                    : child
            )}
            <ChevronDown
                className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
        </button>
    );
};

export const SelectValue = ({ placeholder = 'Select...', className = '', displayText }) => {
    return (
        <span
            className={`block truncate ${!displayText ? 'text-gray-400' : 'text-gray-900'} ${className}`}
        >
            {displayText || placeholder}
        </span>
    );
};

export const SelectContent = ({ children, className = '', isOpen, value, onValueChange }) => {
    if (!isOpen) return null;

    return (
        <div
            className={`absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-gray-200 bg-white shadow-lg ${className}`}
        >
            <div className="p-1 max-h-60 overflow-auto">
                {React.Children.map(children, (child) =>
                    React.isValidElement(child)
                        ? React.cloneElement(child, {
                            onValueChange,
                            isSelected: child.props.value === value,
                        })
                        : child
                )}
            </div>
        </div>
    );
};

export const SelectItem = ({ value, children, className = '', onValueChange, isSelected }) => {
    const handleClick = () => {
        onValueChange?.(value, children);
    };

    return (
        <div
            className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 ${isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'} ${className}`}
            onClick={handleClick}
        >
            {children}
        </div>
    );
};