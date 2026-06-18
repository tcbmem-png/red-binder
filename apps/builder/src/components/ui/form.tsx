import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Section({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {help && <p className="text-sm text-muted-foreground">{help}</p>}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  htmlFor,
  optionalText,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optionalText?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="block text-sm font-bold text-foreground">
        {label}
        {optionalText && (
          <span className="font-normal text-muted-foreground"> · {optionalText}</span>
        )}
      </label>
      {children}
      {error && <p className="text-sm text-caution-fg">{error}</p>}
    </div>
  );
}

// React 19 accepts `ref` as a normal prop, so react-hook-form's register() spread attaches cleanly.
export function TextInput({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-md border border-input bg-card px-3 text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        className,
      )}
      {...props}
    />
  );
}
