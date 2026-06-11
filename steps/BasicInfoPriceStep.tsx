import React from 'react';

export interface BasicInfoPriceData {
  itemCondition: string;
  name: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  subCategoryId: string;
  subCategoryName: string;
  subCategorySlug: string;
  productTypeId: string;
  productTypeName: string;
  productTypeSlug: string;
  hsnCode: string;
  brand_name: string;
  manufacturer_address: string;
  shortDescription: string;
  description: string;
  originCountryId: string;
  originCountryCurrency: string;
  mrp: number;
  price: number;
  stock: number;
  isCodAvailable: boolean;
  sku: string;
}

interface Props {
  data: BasicInfoPriceData;
  onChange: (value: BasicInfoPriceData) => void;
  disabled?: boolean;
  lockOriginCountry?: boolean;
}

export default function BasicInfoPriceStep({ data, onChange, disabled, lockOriginCountry }: Props) {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Product name</span>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border p-2"
          value={data.name}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, name: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">SKU</span>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border p-2"
          value={data.sku}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, sku: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Price</span>
        <input
          type="number"
          className="mt-1 block w-full rounded-md border p-2"
          value={data.price}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, price: Number(event.target.value) })}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">MRP</span>
        <input
          type="number"
          className="mt-1 block w-full rounded-md border p-2"
          value={data.mrp}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, mrp: Number(event.target.value) })}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Short description</span>
        <textarea
          className="mt-1 block w-full rounded-md border p-2"
          value={data.shortDescription}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, shortDescription: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Description</span>
        <textarea
          className="mt-1 block w-full rounded-md border p-2"
          value={data.description}
          disabled={disabled}
          onChange={(event) => onChange({ ...data, description: event.target.value })}
        />
      </label>
      {lockOriginCountry && (
        <p className="text-xs text-slate-500">Origin country is locked until draft is completed.</p>
      )}
    </div>
  );
}
