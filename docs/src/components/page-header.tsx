import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export const PageHeader = ({ eyebrow, title, children }: PageHeaderProps) => {
  return (
    <header className="border-b border-slate-200 pb-6 sm:pb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 sm:text-sm">
        {eyebrow}
      </p>
      <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
        {children}
      </p>
    </header>
  );
};
