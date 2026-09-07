// src/components/DataTable.jsx
export default function DataTable({ columns, rows, emptyText = 'No records yet.', onRowClick }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card dark:border-ink-700 dark:bg-ink-800">
      <table className="min-w-full text-sm dark:text-slate-200">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-ink-700 dark:text-slate-400">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-ink-700">
          {rows?.length ? (
            rows.map((row, i) => (
              <tr
                key={row._id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={
                  onRowClick
                    ? 'cursor-pointer transition-colors duration-150 ease-out hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-ink-700 dark:hover:text-white'
                    : ''
                }
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-middle">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
