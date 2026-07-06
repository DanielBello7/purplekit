import { CodeBlock } from '../components/code-block';
import { PageHeader } from '../components/page-header';
import { Section } from '../components/section';
import { commandOptions, commands } from '../content/docs';

export const CommandsPage = () => {
  return (
    <>
      <PageHeader eyebrow="CLI" title="Commands for database work.">
        Use the CLI directly with npx tgx or through your package scripts.
        Commands are intentionally short and map to one database task each.
      </PageHeader>

      <Section title="Command reference">
        <div className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
          {commands.map(([name, description]) => (
            <div
              key={name}
              className="grid gap-3 p-4 md:grid-cols-[160px_1fr] md:items-center"
            >
              <code className="w-fit rounded bg-slate-100 px-2 py-1 font-mono text-sm text-slate-950">
                npx tgx {name}
              </code>
              <p className="text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Useful options">
        <CodeBlock code={commandOptions} />
      </Section>
    </>
  );
};
