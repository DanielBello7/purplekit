import type { ReactNode } from 'react';

type SectionProps = {
  title: string;
  children: ReactNode;
};

export const Section = ({ title, children }: SectionProps) => {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 space-y-5 text-base leading-7 text-slate-600">
        {children}
      </div>
    </section>
  );
};
