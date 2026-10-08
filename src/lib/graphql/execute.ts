import { graphql } from 'graphql';
import { rootValue, schema } from './schema';

/**
 * Runs a GraphQL query against the content schema in-process.
 * Server components use this at build time; no network hop is needed.
 */
export async function runQuery<TData>(
  source: string,
  variableValues?: Record<string, unknown>,
): Promise<TData> {
  const result = await graphql({ schema, source, rootValue, variableValues });
  if (result.errors?.length) {
    throw new Error(`GraphQL error: ${result.errors.map((e) => e.message).join('; ')}`);
  }
  // graphql-js builds results with null prototypes; convert to plain JSON
  // objects so they can be passed from server to client components.
  return JSON.parse(JSON.stringify(result.data)) as TData;
}
