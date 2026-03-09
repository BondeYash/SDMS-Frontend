import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    rightElement?: React.ReactNode;
    leftElement?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, className = '', rightElement, leftElement, id, ...props }, ref) => {
        const generatedId = id || Math.random().toString(36).substring(7);

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={generatedId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftElement && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {leftElement}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={generatedId}
                        className={`
              block w-full rounded-lg border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 shadow-sm 
              focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 sm:text-sm min-h-[44px]
              ${error ? 'border-red-300 dark:border-red-600 text-red-900 dark:text-red-200 placeholder-red-300 dark:placeholder-red-400 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}
              ${leftElement ? 'pl-10' : 'pl-3'}
              ${rightElement ? 'pr-10' : 'pr-3'}
              ${className}
            `}
                        {...props}
                    />
                    {rightElement && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            {rightElement}
                        </div>
                    )}
                </div>
                {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
                {helperText && !error && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
