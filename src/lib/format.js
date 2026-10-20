export const naira = (n) => '₦' + Math.round(n).toLocaleString('en-NG');

export const initialsOf = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9);

export const fileSize = (bytes) =>
  bytes > 1048576 ? (bytes / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';

export const fileKind = (name) => {
  const ext = (name.split('.').pop() || '').toUpperCase();
  return ext.length > 4 ? 'FILE' : ext === 'JPEG' ? 'JPG' : ext || 'FILE';
};

export const invoiceTotal = (inv) => inv.lines.reduce((s, l) => s + l.amount, 0) + (inv.vat || 0);
