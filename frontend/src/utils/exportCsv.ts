import type { Expense } from '../types/expense';

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportExpensesToCsv(expenses: Expense[], filename?: string): void {
  const today = new Date().toISOString().split('T')[0];
  const name = filename ?? `expenses-${today}.csv`;

  const headers = ['Date', 'Title', 'Category', 'Amount', 'Description', 'Notes'];

  const rows = expenses.map(e => [
    escapeCsvValue(new Date(e.expenseDate).toISOString().split('T')[0]),
    escapeCsvValue(e.title),
    escapeCsvValue(e.category.name),
    escapeCsvValue(e.amount),
    escapeCsvValue(e.description ?? ''),
    escapeCsvValue(e.notes ?? ''),
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  let url: string | null = null;
  try {
    url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url!), 100);
  } catch {
    if (url) URL.revokeObjectURL(url);
  }
}
