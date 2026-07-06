import type { ReactNode } from 'react';

type SectionProps = {
  title: string;
  children: ReactNode;
};

export const Section = ({ title, children }: SectionProps) => {
  return (
    <section className="mt-8 sm:mt-10">
      <h2 className="text-xl font-semibold text-slate-950 sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-5 text-sm leading-7 text-slate-600 sm:text-base">
        {children}
      </div>
    </section>
  );
};
