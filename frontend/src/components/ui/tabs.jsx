import * as React from 'react';
import { cn } from '@/lib/utils';

const Tabs = ({ value, onValueChange, children, className }) => {
  return (
    <div className={cn('', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeValue: value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, className, activeValue, onValueChange }) => (
  <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { activeValue, onValueChange });
      }
      return child;
    })}
  </div>
);

const TabsTrigger = ({ value, children, className, activeValue, onValueChange }) => (
  <button
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none',
      activeValue === value && 'bg-background text-foreground shadow-sm',
      className
    )}
    onClick={() => onValueChange?.(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, className, activeValue }) => {
  if (activeValue !== value) return null;
  return <div className={cn('mt-2', className)}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
