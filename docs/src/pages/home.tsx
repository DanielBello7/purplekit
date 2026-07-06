import { CodeBlock } from '../components/code-block';
import { PageHeader } from '../components/page-header';
import { Section } from '../components/section';
import { shellCommands } from '../content/docs';

export const HomePage = () => {
  return (
    <>
      <PageHeader eyebrow="Documentation" title="TypeORM workflow, kept tidy.">
        Purplekit wraps the common TypeORM database workflow in a small CLI and keeps
        project-owned migrations and seeds under an opinionated purplekit folder.
      </PageHeader>

      <Section title="Install and initialize">
        <p>
          Install Purplekit with TypeORM, reflect metadata, and the database driver
          your project uses. Then run init to create the local Purplekit workspace.
        </p>
        <CodeBlock code={shellCommands} />
      </Section>

      <Section title="Generated structure">
        <div className="grid gap-4 md:grid-cols-3">
          {['purplekit/purplekit.config.ts', 'purplekit/migrations', 'purplekit/seeds'].map((item) => (
            <div
              key={item}
              className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="font-mono text-sm font-semibold text-slate-950">
                {item}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
};
