export interface Country {
  id: string;
  name: string;
  code: string;
  currencyCode: string;
}

const countryList: Country[] = [
  { id: 'IN', name: 'India', code: 'IN', currencyCode: 'INR' },
  { id: 'US', name: 'United States', code: 'US', currencyCode: 'USD' },
  { id: 'GB', name: 'United Kingdom', code: 'GB', currencyCode: 'GBP' },
  { id: 'CA', name: 'Canada', code: 'CA', currencyCode: 'CAD' },
  { id: 'AU', name: 'Australia', code: 'AU', currencyCode: 'AUD' },
];

export async function fetchCountries() {
  return countryList;
}
