export interface Product {
  id: string;
  name: string;
  slug: string; // url-safe slug e.g. "hand-carved-maple-bowl"
  idKey: string; // custom id key
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subCategory?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  tags: string[];
  isOrganic?: boolean;
  isHandmade?: boolean;
  materials?: string[];
  createdAt: string;
  
  // Custom specification attributes for exact fidelity matching
  brand?: string;
  sku?: string;
  hsnCode?: string;
  battery?: string;
  lighting?: string;
  microphone?: string;
  connectivity?: string;
  productType?: string;
  manufacturerName?: string;
  manufacturerCountry?: string;
  countryOfOrigin?: string;
  weight?: string;
  dimensions?: string;
  package?: string;
  importantNote?: string;
  highlights?: string;
  aboutProduct?: string[];
  directions?: string[];
  variants?: ProductVariant[];
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductVariant {
  id: string; // e.g. TSHIRT-BLACK-M
  size: string;
  colour: string;
  sku: string;
  stock: number;
  price: number;
}

export interface CartItem {
  id: string; // unique item key e.g. prodId-variantId
  product: Product;
  productId: string;
  variantId: string;
  productName: string;
  selectedSize: string;
  selectedColour: string;
  size: string;
  colour: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AdCampaign {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  link: string; // internal route target
  backgroundColor: string;
  textColor: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customerName: string;
  email: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  status: 'accepted' | 'rejected' | 'packed' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered';
  paymentMethod: string;
  createdAt: string;
  estimatedDelivery: string;
  trackingSteps: {
    status: string;
    description: string;
    time: string;
    done: boolean;
  }[];
}

export interface SavedAddress {
  id: string;
  label: string; // e.g., "Home", "Work", "Mom's House"
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  createdAt: string;
}

export interface LoggedUser {
  id: string; // Supabase user ID
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'ADMIN' | 'BUYER';
  profileImage?: string;
  email_verified: boolean;
  addresses: SavedAddress[];
  created_at?: string;
}
