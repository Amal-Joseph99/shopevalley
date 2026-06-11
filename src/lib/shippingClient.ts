import { CartItem } from '../types';

const apiUrl = import.meta.env.VITE_NIMBUS_API_URL;
const apiKey = import.meta.env.VITE_NIMBUS_API_KEY;

export interface ShippingRate {
  id: string;
  service_code?: string;
  name_hidden?: string; // do NOT expose carrier names in UI
  cost: number; // INR
  estimated_days?: number;
  estimated_delivery_date?: string; // ISO date
  codAvailable?: boolean;
  codCharge?: number;
  metadata?: Record<string, any>;
}

function parseWeightGrams(weightStr?: string): number | null {
  if (!weightStr) return null;
  const s = weightStr.trim().toLowerCase();
  const numMatch = s.match(/([0-9]+\.?[0-9]*)/);
  if (!numMatch) return null;
  const num = parseFloat(numMatch[1]);
  if (s.includes('kg')) return Math.round(num * 1000);
  if (s.includes('g')) return Math.round(num);
  if (s.includes('lb') || s.includes('lbs')) return Math.round(num * 453.592);
  // default assume grams if number provided without unit
  return Math.round(num);
}

export async function getLiveShippingRates(toPincode: string, items: CartItem[], originPincode?: string): Promise<{ rates: ShippingRate[]; error?: string }>{
  const origin = originPincode?.trim() || import.meta.env.VITE_ORIGIN_PINCODE;
  if (!apiUrl || !apiKey) {
    return { rates: [], error: 'Missing shipping service configuration' };
  }
  if (!origin) return { rates: [], error: 'Missing origin pincode configuration' };

  const totalWeight = items.reduce((acc, it) => {
    const w = parseWeightGrams(it.product.weight);
    return acc + (w || 0);
  }, 0);

  // Build payload according to expected carrier API. We keep this generic.
  const payload = {
    origin_pincode: origin,
    destination_pincode: toPincode,
    weight_grams: totalWeight || undefined,
    items: items.map(it => ({
      id: it.product.id,
      qty: it.quantity,
      price: it.unitPrice
    }))
  };

  try {
    const resp = await fetch(apiUrl + '/rates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return { rates: [], error: `Shipping API error: ${resp.status} ${txt}` };
    }

    const json = await resp.json();

    // Normalize response to ShippingRate[]
    const rates: ShippingRate[] = (json?.rates || []).map((r: any, idx: number) => {
      const codCharge = Number(r.cod_cost ?? r.codCharge ?? r.cod_fee ?? r.cash_on_delivery_fee ?? r.codAmount ?? r.cashOnDeliveryFee ?? 0);
      const codAvailable = Boolean(
        codCharge > 0 ||
        r.cod_available ||
        r.codAvailable ||
        r.cash_on_delivery_supported ||
        r.cod_supported ||
        r.codEnabled ||
        r.cashOnDeliverySupported
      );

      return {
        id: String(r.id ?? idx),
        service_code: r.service_code || r.code || undefined,
        name_hidden: r.name ? 'Shipping Service' : 'Shipping Service',
        cost: Number(r.cost || r.price || r.amount || 0),
        estimated_days: r.estimated_days || r.days || undefined,
        estimated_delivery_date: r.eta || r.estimated_delivery || undefined,
        codAvailable,
        codCharge: codAvailable ? codCharge : undefined,
        metadata: r.metadata || {}
      };
    });

    return { rates };
  } catch (err: any) {
    return { rates: [], error: err.message || 'Failed to fetch rates' };
  }
}

export function pickCheapestRate(rates: ShippingRate[]): ShippingRate | null {
  if (!rates || rates.length === 0) return null;
  return rates.reduce((best, cur) => (cur.cost < best.cost ? cur : best), rates[0]);
}
