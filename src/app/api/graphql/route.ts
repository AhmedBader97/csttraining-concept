import { graphql } from 'graphql';
import { rootValue, schema } from '@/lib/graphql/schema';

/**
 * Public read-only GraphQL endpoint for the course catalogue.
 *
 *   POST /api/graphql  { "query": "...", "variables": { ... } }
 *   GET  /api/graphql?query={courses{name}}
 */

const MAX_QUERY_LENGTH = 4000;

interface GraphQLRequestBody {
  query?: unknown;
  variables?: unknown;
  operationName?: unknown;
}

function badRequest(message: string, status = 400) {
  return Response.json({ errors: [{ message }] }, { status });
}

async function execute(query: unknown, variables: unknown, operationName: unknown) {
  if (typeof query !== 'string' || query.trim() === '') {
    return badRequest('Send a GraphQL query as a "query" string.');
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return badRequest(`Queries are limited to ${MAX_QUERY_LENGTH} characters.`, 413);
  }
  if (variables != null && (typeof variables !== 'object' || Array.isArray(variables))) {
    return badRequest('"variables" must be an object.');
  }

  const result = await graphql({
    schema,
    source: query,
    rootValue,
    variableValues: (variables as Record<string, unknown> | null) ?? undefined,
    operationName: typeof operationName === 'string' ? operationName : undefined,
  });

  const status = result.errors && !result.data ? 400 : 200;
  return Response.json(result, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  let body: GraphQLRequestBody;
  try {
    body = (await request.json()) as GraphQLRequestBody;
  } catch {
    return badRequest('The request body must be JSON.');
  }
  return execute(body?.query, body?.variables, body?.operationName);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  let variables: unknown = undefined;
  const rawVariables = params.get('variables');
  if (rawVariables) {
    try {
      variables = JSON.parse(rawVariables);
    } catch {
      return badRequest('"variables" must be valid JSON.');
    }
  }
  return execute(params.get('query'), variables, params.get('operationName'));
}
