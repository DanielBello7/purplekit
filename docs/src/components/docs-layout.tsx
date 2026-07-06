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
        <aside className="border-b border-slate-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="px-5 py-5 lg:px-6 lg:py-7">
            <NavLink to="/" className="block">
              <p className="text-2xl font-semibold text-slate-950">TGX</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                TypeORM database actions wrapper
              </p>
            </NavLink>

            <nav className="mt-6 grid gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [
                      'rounded-md px-3 py-3 text-left transition',
                      isActive
                        ? 'bg-emerald-50 text-emerald-950 ring-1 ring-emerald-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    ].join(' ')
                  }
                >
                  <span className="block text-sm font-semibold">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {item.description}
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="px-5 py-8 md:px-10 lg:px-12 lg:py-12">{children}</main>
      </div>
    </div>
  );
};
