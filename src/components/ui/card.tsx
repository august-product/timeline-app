"use client";

import { type PropsWithChildren } from 'react';
import clsx from 'clsx';

interface CardProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const Card = ({ title, subtitle, className, children, actions }: CardProps) => (
  <section
    className={clsx(
      'rounded-2xl border border-[#d9d0c7] bg-[var(--august-card)] p-5 shadow-sm shadow-[rgba(31,43,36,0.05)]',
      className,
    )}
  >
    {(title || subtitle || actions) && (
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          {title && <p className="text-base font-semibold text-[var(--august-ink)]">{title}</p>}
          {subtitle && <p className="text-sm text-[var(--august-muted)]">{subtitle}</p>}
        </div>
        {actions}
      </header>
    )}
    {children}
  </section>
);
