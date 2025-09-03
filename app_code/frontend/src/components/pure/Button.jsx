import React from 'react';

export const Button = ({
                           variant = 'default',
                           size = 'default',
                           className = '',
                           children,
                           ...props
                       }) => {
    const baseClasses =
        'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-accent',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive',
    };

    const sizeClasses = {
        sm: 'h-9 px-3 text-sm rounded-md',
        default: 'h-10 px-4 py-2 rounded-md',
        lg: 'h-11 px-8 rounded-md',
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
