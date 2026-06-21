import React from 'react';

interface Column<T> { key: string; header: string; render?: (row: T) => React.ReactNode; width?: string; }

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (row: T) => void;
  keyField?: string;
}

export function Table<T extends Record<string, any>>({ columns, data, loading, emptyText = 'No data', onRowClick, keyField = 'id' }: TableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
        <thead>
          <tr style={{ background: 'var(--bg-surface-hover)' }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap', width: c.width }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>{emptyText}</td></tr>
          ) : data.map((row, i) => (
            <tr key={row[keyField] || i}
              onClick={() => onRowClick?.(row)}
              style={{ borderTop: '1px solid var(--border-color)', cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.15s' }}
              onMouseEnter={e => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}>
              {columns.map(c => (
                <td key={c.key} style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
