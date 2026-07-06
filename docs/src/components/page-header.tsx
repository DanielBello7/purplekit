import type { ReactNode } from 'react';

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export const PageHeader = ({ eyebrow, title, children }: PageHeaderProps) => {
  return (
    <header className="border-b border-slate-200 pb-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
        {eyebrow}
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        {children}
      </p>
    </header>
  );
};
