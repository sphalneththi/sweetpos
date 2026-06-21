export const fmt = (n: number) =>
  new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-LK', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString('en-LK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export const fmtNum = (n: number, decimals = 0) => n.toFixed(decimals);
