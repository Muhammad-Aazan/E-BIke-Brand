export function formatPrice(amount: number, currency = 'USD'): string {
  if (currency.toUpperCase() === 'PKR') {
    return `PKR ${Math.round(amount).toLocaleString('en-PK')}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string | Date): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
