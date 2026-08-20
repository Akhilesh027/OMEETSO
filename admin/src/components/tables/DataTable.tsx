import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

export function DataTable<T extends { id: string }>({
  rows, columns, empty = "No records", onRowClick,
}: {
  rows: T[];
  columns: { key: string; header: string; render: (row: T) => ReactNode; className?: string }[];
  empty?: string;
  onRowClick?: (row: T) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-admin-border bg-white shadow-panel">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-admin-bg">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn("px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-admin-muted", c.className)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {rows.length === 0 && (
              <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-admin-muted">{empty}</td></tr>
            )}
            {rows.map((row) => (
              <tr key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("hover:bg-admin-bg", onRowClick && "cursor-pointer")}>
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-3 py-2.5 align-middle text-admin-text", c.className)}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
