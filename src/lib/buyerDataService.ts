import { supabase } from './supabaseClient';
import { CartItem, Order, Product, SavedAddress } from '../types';

const isUuid = (value?: string | null) =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));

export function normalizeProductRow(p: any): Product {
  return {
    id: p.id,
    idKey: p.id_key || p.id,
    name: p.name || '',
    slug: p.slug || '',
    description: p.description || '',
    price: Number(p.price) || 0,
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    category: p.category || '',
    subCategory: p.sub_category || '',
    images: Array.isArray(p.images) ? p.images : [],
    rating: Number(p.rating) || 0,
    reviewCount: p.review_count || 0,
    stock: p.stock || 0,
    tags: p.tags || [],
    brand: p.brand || '',
    sku: p.sku || '',
    hsnCode: p.hsn_code || '',
    createdAt: p.created_at || ''
  };
}

export async function fetchCartItems(): Promise<CartItem[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('cart_items')
    .select('id, product_id, variant_id, quantity, selected_size, selected_colour, products:product_id(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data
    .filter((row: any) => row.products)
    .map((row: any) => {
      const product = normalizeProductRow(row.products);
      const price = Number(product.price) || 0;
      const quantity = Number(row.quantity) || 1;
      return {
        id: row.id,
        product,
        productId: product.id,
        variantId: row.variant_id || 'STANDARD',
        productName: product.name,
        selectedSize: row.selected_size || 'Free Size',
        selectedColour: row.selected_colour || 'Default',
        size: row.selected_size || 'Free Size',
        colour: row.selected_colour || 'Default',
        quantity,
        unitPrice: price,
        subtotal: Math.round(quantity * price * 100) / 100
      };
    });
}

export async function addCartItem(product: Product, quantity: number, variantId?: string | null, size = 'Free Size', colour = 'Default') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const dbVariantId = isUuid(variantId) ? variantId : null;
  let query = supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('product_id', product.id);

  query = dbVariantId ? query.eq('variant_id', dbVariantId) : query.is('variant_id', null);
  const { data: existing } = await query.maybeSingle();

  if (existing) {
    await supabase
      .from('cart_items')
      .update({ quantity: Number(existing.quantity) + quantity, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    return;
  }

  await supabase.from('cart_items').insert({
    user_id: user.id,
    product_id: product.id,
    variant_id: dbVariantId,
    quantity,
    selected_size: size,
    selected_colour: colour
  });
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    await removeCartItem(cartItemId);
    return;
  }
  await supabase.from('cart_items').update({ quantity, updated_at: new Date().toISOString() }).eq('id', cartItemId);
}

export async function removeCartItem(cartItemId: string) {
  await supabase.from('cart_items').delete().eq('id', cartItemId);
}

export async function clearCartItems() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('cart_items').delete().eq('user_id', user.id);
}

export async function fetchSavedAddresses(): Promise<SavedAddress[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  return (data || []).map((row: any) => ({
    id: row.id,
    label: row.is_default ? 'Default' : 'Saved Address',
    fullName: row.full_name,
    email: row.email || '',
    phoneNumber: row.phone || '',
    address: row.address_line1,
    city: row.city,
    state: row.state || '',
    zipCode: row.zip_code,
    isDefault: Boolean(row.is_default),
    createdAt: row.created_at
  }));
}

export async function saveShippingAddress(address: Omit<SavedAddress, 'id' | 'label' | 'createdAt'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  if (address.isDefault) {
    await supabase.from('shipping_addresses').update({ is_default: false }).eq('user_id', user.id);
  }

  const { data } = await supabase
    .from('shipping_addresses')
    .insert({
      user_id: user.id,
      full_name: address.fullName,
      email: address.email,
      phone: address.phoneNumber,
      address_line1: address.address,
      city: address.city,
      state: address.state,
      zip_code: address.zipCode,
      country: 'India',
      is_default: address.isDefault
    })
    .select('id')
    .single();
  return data?.id || null;
}

export async function deleteShippingAddress(id: string) {
  await supabase.from('shipping_addresses').delete().eq('id', id);
}

export async function setDefaultShippingAddress(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('shipping_addresses').update({ is_default: false }).eq('user_id', user.id);
  await supabase.from('shipping_addresses').update({ is_default: true }).eq('id', id);
}

export async function fetchOrdersForCurrentUser(): Promise<Order[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  return fetchOrdersQuery((query) => query.eq('user_id', user.id));
}

export async function fetchAllOrders(): Promise<Order[]> {
  return fetchOrdersQuery((query) => query);
}

async function fetchOrdersQuery(apply: (query: any) => any): Promise<Order[]> {
  const query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
  const { data, error } = await apply(query);
  if (error || !data) return [];
  return data.map(normalizeOrderRow);
}

export function normalizeOrderRow(row: any): Order {
  return {
    id: row.order_number || row.id,
    dbId: row.id,
    items: (row.order_items || []).map((item: any) => ({
      productId: item.product_id,
      name: item.product_name,
      price: Number(item.unit_price) || 0,
      quantity: Number(item.quantity) || 1
    })),
    subtotal: Number(row.subtotal) || 0,
    shipping: Number(row.shipping_fee) || 0,
    tax: Number(row.tax) || 0,
    total: Number(row.total) || 0,
    customerName: row.shipping_name || '',
    email: row.shipping_email || '',
    address: row.shipping_address || '',
    city: row.shipping_city || '',
    zipCode: row.shipping_zip || '',
    phone: row.shipping_phone || '',
    status: row.status || 'accepted',
    paymentMethod: row.payment_method || 'Razorpay',
    createdAt: row.created_at,
    estimatedDelivery: row.estimated_delivery || '7-9 business days',
    trackingSteps: []
  };
}

export async function updateOrderStatus(orderDbIdOrNumber: string, status: Order['status']) {
  await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .or(`id.eq.${orderDbIdOrNumber},order_number.eq.${orderDbIdOrNumber}`);
}
