import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  className?: string;
}

export function Table<T>({ columns, data, keyExtractor, className }: TableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-border", className)}>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50/80">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider",
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-white">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="hover:bg-gray-50/50 transition-colors"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn("px-6 py-4 text-sm text-dark", column.className)}
                >
                  {column.render
                    ? column.render(item)
                    : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
