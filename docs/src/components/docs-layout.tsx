import type { ReactNode } from 'react';
import { NavLink } from 'react-router';
import { navItems } from '../content/docs';

type DocsLayoutProps = {
  children: ReactNode;
};

export const DocsLayout = ({ children }: DocsLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-700">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[300px_1fr]">
        <aside className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:h-screen lg:border-b-0 lg:border-r">
          <div className="px-4 py-3 lg:px-6 lg:py-7">
            <NavLink
              to="/"
              className="flex items-center justify-between gap-4 lg:block"
            >
              <p className="text-xl font-semibold text-slate-950 lg:text-2xl">
                TGX
              </p>
              <p className="hidden text-right text-xs leading-5 text-slate-500 sm:block lg:mt-1 lg:text-left lg:text-sm lg:leading-6">
                TypeORM database actions wrapper
              </p>
            </NavLink>

            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:mt-6 lg:grid lg:gap-1 lg:overflow-visible lg:pb-0">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [
                      'shrink-0 rounded-md px-3 py-2 text-left transition lg:py-3',
                      isActive
                        ? 'bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    ].join(' ')
                  }
                >
                  <span className="block text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="mt-1 hidden text-xs leading-5 text-slate-500 lg:block">
                    {item.description}
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-7 sm:px-6 md:px-10 lg:px-12 lg:py-12">
          {children}
        </main>
      </div>
    </div>
  );
};
