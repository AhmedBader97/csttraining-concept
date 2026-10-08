/** The SQL behind a widget, folded away until someone asks. */
export function ShowSql({ sql }: { sql: string }) {
  return (
    <details className="show-sql">
      <summary className="show-sql__summary">Show the SQL</summary>
      <pre className="show-sql__code">
        <code>{sql}</code>
      </pre>
    </details>
  );
}
