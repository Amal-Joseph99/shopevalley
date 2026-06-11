import React from 'react';

export interface DomesticShippingData {
  countryId: string;
  countryName: string;
  shippingType: string;
  shippingCost: number;
  dispatchTime: string;
}

interface Props {
  data: DomesticShippingData;
  onChange: (value: DomesticShippingData) => void;
  disabled?: boolean;
}

export default function DomesticShippingStep({ data, onChange, disabled }: Props) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Shipping country</span>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border p-2"
          value={data.countryName}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, countryName: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Shipping cost</span>
        <input
          type="number"
          className="mt-1 block w-full rounded-md border p-2"
          value={data.shippingCost}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, shippingCost: Number(event.target.value) })}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Dispatch time</span>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border p-2"
          value={data.dispatchTime}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, dispatchTime: event.target.value })}
        />
      </label>
    </div>
  );
}
