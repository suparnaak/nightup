import {
  ColumnDef,
  flexRender,
  useReactTable,
  getCoreRowModel,
} from '@tanstack/react-table';

interface DataTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  tableClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  rowClassName?: string;
  cellClassName?: string;
}

export function DataTable<T>({
  columns,
  data,
  tableClassName = "min-w-full bg-white divide-y divide-gray-200",
  headerRowClassName = "bg-gray-50",
  headerCellClassName = "px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider",
  rowClassName = "hover:bg-gray-50",
  cellClassName = "px-6 py-4 text-sm text-gray-800",
}: DataTableProps<T>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto shadow-lg rounded-lg">
      <table className={tableClassName}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className={headerRowClassName}>
              {headerGroup.headers.map(header => {
                const meta: any = header.column.columnDef.meta;
                const customClass = meta?.headerClassName;
                return (
                  <th
                    key={header.id}
                    className={customClass || headerCellClassName}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-100">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className={rowClassName}>
              {row.getVisibleCells().map(cell => {
                const meta: any = cell.column.columnDef.meta;
                const customClass = meta?.cellClassName;
                return (
                  <td
                    key={cell.id}
                    className={customClass || cellClassName}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}