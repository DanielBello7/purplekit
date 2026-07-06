import { CodeBlock } from '../components/code-block';
import { PageHeader } from '../components/page-header';
import { Section } from '../components/section';
import { apiExample } from '../content/docs';

export const ApiPage = () => {
  return (
    <>
      <PageHeader eyebrow="Public API" title="A small package surface.">
        TGX exports the CLI feature handlers for programmatic use, the public
        config type, and seedEntities for seed files.
      </PageHeader>

      <Section title="Imports">
        <CodeBlock code={apiExample} />
      </Section>
    </>
  );
};
