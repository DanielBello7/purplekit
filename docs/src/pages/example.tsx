import { CodeBlock } from '../components/code-block';
import { PageHeader } from '../components/page-header';
import { Section } from '../components/section';
import { postSeedExample, schemaExample, seederExample } from '../content/docs';

export const ExamplePage = () => {
  return (
    <>
      <PageHeader eyebrow="Example Project" title="Users, posts, and comments.">
        The example in docs/.hide models a small content app with TypeORM
        entities and TGX seeders. It is intentionally close to the way users
        would structure their own projects.
      </PageHeader>

      <Section title="Data model">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ['users', 'Profiles with stable UUIDs, names, and email fields.'],
            ['posts', 'Long-form content linked back to the creating user.'],
            ['comments', 'Discussion records seeded after users and posts.'],
          ].map(([title, body]) => (
            <div
              key={title}
              className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="font-mono text-sm font-semibold text-slate-950">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Entity shape">
        <CodeBlock code={schemaExample} />
      </Section>

      <Section title="Seeder pattern">
        <p>
          Seeders use the public seedEntities helper from TGX. The helper
          inserts missing records and skips existing records by stable id.
        </p>
        <CodeBlock code={seederExample} />
      </Section>

      <Section title="Realistic seed content">
        <CodeBlock code={postSeedExample} />
      </Section>
    </>
  );
};
