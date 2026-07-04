export const migration = (
  name: string,
  upQueries: string[],
  downQueries: string[] = [],
) => `
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ${name} implements MigrationInterface {
  name = '${name}';

  public async up(queryRunner: QueryRunner): Promise<void> {
${upQueries.map((query) => `    await queryRunner.query(\`${query}\`);`).join('\n')}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
${downQueries.map((query) => `    await queryRunner.query(\`${query}\`);`).join('\n')}
  }
}
`;
