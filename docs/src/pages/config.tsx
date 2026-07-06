import { CodeBlock } from '../components/code-block';
import { PageHeader } from '../components/page-header';
import { Section } from '../components/section';
import { configExample } from '../content/docs';

export const ConfigPage = () => {
  return (
    <>
      <PageHeader eyebrow="Config" title="One project config, fixed Purplekit paths.">
        Purplekit keeps folder paths internal. Your config describes the database,
        entities, SSL behavior, and seed classes.
      </PageHeader>

      <Section title="purplekit/purplekit.config.ts">
        <CodeBlock code={configExample} />
      </Section>

      <Section title="Opinionated internals">
        <p>
          ROOT, MIGRATIONS_DIR, SEEDS_DIR, and migration globs are not public
          configuration. Purplekit owns them so commands always agree on where
          migrations and seed artifacts live.
        </p>
      </Section>
    </>
  );
};
