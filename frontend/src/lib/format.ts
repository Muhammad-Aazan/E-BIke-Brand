export const formatPrice = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

export const pad2 = (n: number) => String(n).padStart(2, '0');
