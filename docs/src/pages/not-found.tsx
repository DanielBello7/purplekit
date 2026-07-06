import { NavLink } from 'react-router';
import { PageHeader } from '../components/page-header';
import { Section } from '../components/section';

export const NotFoundPage = () => {
  return (
    <>
      <PageHeader eyebrow="Missing page" title="This route is not documented.">
        The page you opened does not exist in the TGX docs.
      </PageHeader>

      <Section title="Continue">
        <NavLink
          to="/"
          className="inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Back to start
        </NavLink>
      </Section>
    </>
  );
};
