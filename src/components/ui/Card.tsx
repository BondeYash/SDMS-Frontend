import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`card bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '', ...props }) => (
    <div className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${className}`} {...props}>
        {children}
    </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className = '', ...props }) => (
    <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-100 ${className}`} {...props}>
        {children}
    </h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className = '', ...props }) => (
    <div className={`p-4 ${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<CardProps> = ({ children, className = '', ...props }) => (
    <div className={`px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 ${className}`} {...props}>
        {children}
    </div>
);
