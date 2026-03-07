import React from 'react';

export default function Button({ children, className = '', variant = 'primary', type = 'button', disabled = false, onClick }) {
    const baseStyles = "px-4 py-2 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
    
    let variantStyles = "";
    if (variant === 'primary') {
        variantStyles = "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary";
    } else if (variant === 'outline') {
        variantStyles = "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary";
    }

    return (
        <button
            type={type}
            className={`${baseStyles} ${variantStyles} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
