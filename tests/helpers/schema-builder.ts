export function schemaBuilderResult(result: {
  upQueries: string[];
  downQueries: string[];
}) {
  return {
    driver: {
      createSchemaBuilder: () => ({
        log: async () => result,
      }),
    },
  };
}
