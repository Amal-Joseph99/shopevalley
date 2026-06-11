import { supabase } from './supabaseClient';

export interface FetchProductsOptions {
  sellerId: string;
  limit?: number;
  offset?: number;
}

export async function fetchProducts({ sellerId, limit = 100, offset = 0 }: FetchProductsOptions) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', sellerId)
    .range(offset, offset + limit - 1);

  return {
    data,
    error: error?.message || null,
  };
}

export async function createProduct(input: any) {
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select('*')
    .single();

  return {
    data,
    error: error?.message || null,
  };
}

export async function upsertProductDraftBasic(payload: any) {
  if (payload.draftId) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: payload.name,
        sku: payload.sku,
        category: payload.category,
        sub_category: payload.sub_category,
        product_type: payload.product_type,
        hsn_code: payload.hsn_code,
        brand: payload.brand,
        short_description: payload.short_description,
        description: payload.description,
        origin_country_id: payload.origin_country_id,
        origin_country: payload.origin_country,
        currency: payload.currency,
        is_cod_available: payload.is_cod_available,
        item_condition: payload.item_condition,
        vendor_id: payload.vendor_id,
        vendor_name: payload.vendor_name,
        is_draft: true,
        resume_step: 'media',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.draftId)
      .select('*')
      .single();

    return { data, error: error?.message || null };
  }

  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: payload.name,
      sku: payload.sku,
      category: payload.category,
      sub_category: payload.sub_category,
      product_type: payload.product_type,
      hsn_code: payload.hsn_code,
      brand: payload.brand,
      short_description: payload.short_description,
      description: payload.description,
      origin_country_id: payload.origin_country_id,
      origin_country: payload.origin_country,
      currency: payload.currency,
      mrp: payload.mrp,
      price: payload.price,
      stock: payload.stock,
      is_cod_available: payload.is_cod_available,
      item_condition: payload.item_condition,
      vendor_id: payload.vendor_id,
      vendor_name: payload.vendor_name,
      approval_status: 'pending',
      is_active: false,
      is_draft: true,
      resume_step: 'media',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select('*')
    .single();

  return { data, error: error?.message || null };
}

export async function saveProductDraftDetails(payload: any) {
  const { productId, highlights, specifications, packing_type_id, package_weight, package_weight_unit_id, package_length, package_length_unit_id, package_width, package_width_unit_id, package_height, package_height_unit_id, variantCombinations } = payload;
  if (!productId) {
    return { success: false, error: 'Missing productId' };
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({
      highlights,
      specifications,
      packing_type_id,
      package_weight,
      package_weight_unit_id,
      package_length,
      package_length_unit_id,
      package_width,
      package_width_unit_id,
      package_height,
      package_height_unit_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  const { error: deleteError } = await supabase
    .from('product_variants')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  if (Array.isArray(variantCombinations) && variantCombinations.length > 0) {
    const rows = variantCombinations.map((row: any) => ({
      ...row,
      product_id: productId,
      price: row.price,
      mrp: row.mrp,
      stock: row.stock,
    }));

    const { error: insertError } = await supabase
      .from('product_variants')
      .insert(rows);

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  return { success: true };
}

export async function saveConditionDetails(productId: string, data: any) {
  if (!productId) {
    return { success: false, error: 'Missing productId' };
  }

  const { data: existing, error: existingError } = await supabase
    .from('condition_details')
    .select('id')
    .eq('product_id', productId)
    .maybeSingle();

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  if (existing?.id) {
    const { error } = await supabase
      .from('condition_details')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('product_id', productId);
    return { success: !error, error: error?.message || null };
  }

  const { error } = await supabase
    .from('condition_details')
    .insert([{ ...data, product_id: productId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);

  return { success: !error, error: error?.message || null };
}

export async function saveReturnPolicy(productId: string, data: any) {
  if (!productId) {
    return { success: false, error: 'Missing productId' };
  }

  const { data: existing, error: existingError } = await supabase
    .from('return_policy')
    .select('id')
    .eq('product_id', productId)
    .maybeSingle();

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  if (existing?.id) {
    const { error } = await supabase
      .from('return_policy')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('product_id', productId);
    return { success: !error, error: error?.message || null };
  }

  const { error } = await supabase
    .from('return_policy')
    .insert([{ ...data, product_id: productId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);

  return { success: !error, error: error?.message || null };
}

export async function fetchConditionDetails(productId: string) {
  const { data, error } = await supabase
    .from('condition_details')
    .select('*')
    .eq('product_id', productId)
    .maybeSingle();

  return { data, error: error?.message || null };
}

export async function fetchReturnPolicy(productId: string) {
  const { data, error } = await supabase
    .from('return_policy')
    .select('*')
    .eq('product_id', productId)
    .maybeSingle();

  return { data, error: error?.message || null };
}

export async function updateProductOfferRules(productId: string, payload: any[], sellerId: string) {
  const { error: deleteError } = await supabase
    .from('offer_rules')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  if (payload.length === 0) {
    return { success: true };
  }

  const rows = payload.map((item) => ({
    ...item,
    product_id: productId,
    seller_id: sellerId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('offer_rules').insert(rows);
  return { success: !error, error: error?.message || null };
}

export async function updateProduct(productId: string, values: any) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select('*')
    .single();

  return { data, success: !error, error: error?.message || null };
}

export async function generateNextSku() {
  const { data, error } = await supabase
    .from('products')
    .select('sku')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return `SKU-${Date.now()}`;
  }

  const latestSku = data?.sku || '';
  const match = String(latestSku).match(/(\d+)$/);
  if (match) {
    return `SKU-${String(Number(match[1]) + 1).padStart(6, '0')}`;
  }

  return `SKU-${Date.now()}`;
}

export async function uploadProductImage(file: File, sellerId: string) {
  const safeName = `${sellerId}/${Date.now()}-${file.name}`;
  try {
    const { error: uploadError } = await supabase
      .storage
      .from('product-media')
      .upload(safeName, file, { upsert: true });

    if (uploadError) {
      return URL.createObjectURL(file);
    }

    const { data: urlData } = supabase
      .storage
      .from('product-media')
      .getPublicUrl(safeName);

    return urlData?.publicUrl || URL.createObjectURL(file);
  } catch {
    return URL.createObjectURL(file);
  }
}

export async function uploadProductVideo(file: File, sellerId: string) {
  const safeName = `${sellerId}/${Date.now()}-${file.name}`;
  try {
    const { error: uploadError } = await supabase
      .storage
      .from('product-media')
      .upload(safeName, file, { upsert: true });

    if (uploadError) {
      return URL.createObjectURL(file);
    }

    const { data: urlData } = supabase
      .storage
      .from('product-media')
      .getPublicUrl(safeName);

    return urlData?.publicUrl || URL.createObjectURL(file);
  } catch {
    return URL.createObjectURL(file);
  }
}

export async function deleteProduct(productId: string, sellerId?: string) {
  const query = supabase.from('products').delete().eq('id', productId);
  if (sellerId) {
    query.eq('vendor_id', sellerId);
  }

  const { error } = await query;
  return { success: !error, error: error?.message || null };
}
