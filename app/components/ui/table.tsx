import React from "react";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export function Table({ className = "", children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={`w-full text-left border-collapse text-[14px] ${className}`}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`border-b border-[var(--color-border)] text-[var(--color-text-muted)] font-medium ${className}`}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={`divide-y divide-[var(--color-border-subtle)] ${className}`}
      {...props}
    >
      {children}
    </tbody>
  );
}

export function TableRow({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`hover:bg-[var(--color-surface-elevated)] transition-colors ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({
  className = "",
  children,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`py-3 px-4 text-[14px] font-semibold text-[var(--color-text)] ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({
  className = "",
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`py-3.5 px-4 text-[14px] text-[var(--color-text)] align-middle tabular-nums ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
