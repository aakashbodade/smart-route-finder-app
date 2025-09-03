import React, { createContext, useContext, useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const toast = (toastData) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toastData, id };

        setToasts((prev) => [...prev, newToast]);

        // Auto dismiss after 5 seconds
        setTimeout(() => {
            dismiss(id);
        }, 5000);
    };

    const dismiss = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, toast, dismiss }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

const ToastItem = ({ toast, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => onDismiss(toast.id), 150);
    };

    const baseClasses =
        'relative flex w-full max-w-sm items-center space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all';
    const variantClasses =
        toast.variant === 'destructive'
            ? 'border-destructive bg-destructive text-destructive-foreground'
            : 'border bg-background text-foreground';

    return (
        <div
            className={`${baseClasses} ${variantClasses} ${
                isVisible ? 'animate-in slide-in-from-right-full' : 'animate-out slide-out-to-right-full'
            }`}
        >
            <div className="flex-1 space-y-1">
                <div className="text-sm font-semibold">{toast.title}</div>
                {toast.description && (
                    <div className="text-sm opacity-90">{toast.description}</div>
                )}
            </div>
            <button
                onClick={handleDismiss}
                className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
