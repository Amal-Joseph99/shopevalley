export function useSellerDisplayCurrency() {
  const formatSellerAmount = (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return {
    formatSellerAmount,
  };
}
