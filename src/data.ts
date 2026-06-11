import { Vendor, Product, AdCampaign } from './types';

export const VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Epic Style Co.',
    slug: 'epic-style',
    logo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1565192647048-f997ded879ab?w=1200&auto=format&fit=crop&q=80',
    description: 'Bespoke apparel, masterfully tailored daily casual shirts, jeans, and fine hand-cut accessories built to last.',
    rating: 4.9,
    reviewsCount: 148,
    location: 'Mumbai, MH',
    distance: 2.1,
    category: 'Fashion',
    featured: true,
    joinDate: 'March 2024'
  },
  {
    id: 'v2',
    name: 'Apex Digital Lab',
    slug: 'apex-digital',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&auto=format&fit=crop&q=80',
    description: 'Innovative modern consumer gadgets, flagship smartphones, powerful laptops, and high precision computer accessories.',
    rating: 4.8,
    reviewsCount: 224,
    location: 'Bangalore, KA',
    distance: 1.5,
    category: 'Electronics',
    featured: true,
    joinDate: 'January 2023'
  },
  {
    id: 'v3',
    name: 'Apothecary & Co',
    slug: 'apothecary-co',
    logo: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1200&auto=format&fit=crop&q=80',
    description: 'Pure chemical-free organic skincare oils, nourishing moisturizers, serums, and natural botanical hair systems.',
    rating: 5.0,
    reviewsCount: 194,
    location: 'Dehradun, UK',
    distance: 14.2,
    category: 'Beauty & Personal Care',
    featured: true,
    joinDate: 'June 2024'
  },
  {
    id: 'v4',
    name: 'Home Komforts',
    slug: 'home-komforts',
    logo: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200&auto=format&fit=crop&q=80',
    description: 'Energy-savings smart kitchen blenders, coffee systems, smart vacuum cleaners, and luxury living room furniture.',
    rating: 4.7,
    reviewsCount: 88,
    location: 'Delhi, DL',
    distance: 5.0,
    category: 'Home Appliances',
    featured: false,
    joinDate: 'December 2023'
  }
];

export const PRODUCTS: Product[] = [
  // WEMBLEY KARAOKE SPEAKER
  {
    id: 'p_wembley_speaker',
    name: 'Wembley Karaoke Bluetooth Speaker with Wireless Microphone',
    slug: 'wembley-karaoke-bluetooth-speaker-with-wireless-microphone',
    idKey: 'p_wembley_speaker',
    description: 'Wembley Karaoke Bluetooth Speaker with Wireless Microphone is a portable entertainment device designed for singing, music playback, and family fun. Featuring Bluetooth connectivity, dynamic LED lighting, rechargeable battery support, and multiple voice effects, it delivers an engaging karaoke experience anywhere.',
    price: 14.6747,
    originalPrice: 22.3614,
    category: 'Electronics',
    subCategory: 'Audio (Headphones, Speakers)',
    images: [
      'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1612448332901-24a61b918156?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484755560693-a4074577af3a?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Wembley',
    rating: 4.8,
    reviewCount: 34,
    stock: 10,
    tags: ['speaker', 'karaoke', 'microphone', 'bluetooth', 'wembley'],
    createdAt: '2026-03-01T10:00:00Z',
    brand: 'Wembley',
    sku: 'BZD032010953',
    hsnCode: '85182200',
    battery: 'Rechargeable',
    lighting: 'Dynamic LED Lights',
    microphone: 'Wireless Microphone Included',
    connectivity: 'Bluetooth',
    productType: 'Portable Karaoke Speaker',
    manufacturerName: 'Wembley Toys',
    manufacturerCountry: 'India',
    countryOfOrigin: 'India',
    weight: '650 g',
    dimensions: '22 × 17 × 9 cm',
    package: '650 g | 22 × 17 × 9 cm',
    importantNote: 'Adult supervision is recommended for young children. Keep the product away from water, excessive moisture, and direct heat sources. Use only the recommended charging cable and power source. Do not attempt to disassemble or modify the device.',
    highlights: 'Bring music, singing, and entertainment together with the Wembley Karaoke Bluetooth Speaker with Wireless Microphone. Featuring wireless Bluetooth connectivity, dynamic LED lighting effects, a rechargeable battery, and fun voice-changing modes, this portable speaker is perfect for parties, family gatherings, and kids\' activities. Its compact design.',
    aboutProduct: [
      'Portable karaoke speaker with a wireless microphone included for instant singing sessions.',
      'Suitable for kids, family gatherings, parties, and indoor entertainment.',
      'Bluetooth connectivity allows easy pairing with smartphones, tablets, and other devices.',
      'Stream music wirelessly without the hassle of cables.',
      'Built-in rechargeable battery supports convenient cordless operation.',
      'Enjoy music and karaoke performances wherever you go.',
      'Dynamic LED lighting effects create an engaging and colorful atmosphere.',
      'Enhances the karaoke experience during parties and celebrations.',
      'Multiple voice-changing effects add extra fun to performances.',
      'Switch between different sound modes while singing.',
      'Compact and lightweight design makes it easy to carry and store.',
      'Ideal for travel, picnics, and outdoor entertainment activities.',
      'Clear audio output provides enjoyable music playback and vocal performance.',
      'Designed for everyday entertainment and casual karaoke sessions.',
      'Supports multiple input options including Bluetooth, USB, and memory card playback.',
      'Offers flexibility for playing music from various sources.',
      'User-friendly controls allow quick adjustment of volume and playback settings.',
      'Suitable for both children and adults without complicated setup.',
      'Manufactured by Wembley, a brand known for toys and entertainment products.',
      'Designed to provide fun, creativity, and interactive experiences.'
    ],
    directions: [
      'Fully charge the speaker before first use.',
      'Turn on the speaker and activate Bluetooth mode.',
      'Pair the speaker with a compatible smartphone, tablet, or other Bluetooth-enabled device.',
      'Switch on the wireless microphone and connect it to the speaker.',
      'Play music and enjoy karaoke singing with adjustable volume controls.',
      'Recharge the device using the supplied charging cable when the battery is low.'
    ]
  },
  // COMBO OFFERS
  {
    id: 'p1',
    name: 'Dual Wireless charging Pad + Fast Charger Cable Duo',
    slug: 'wireless-charging-duo-bundle',
    idKey: 'p1_combo',
    description: 'Superb accessory power pack. Experience lightning fast wireless Qi inductive charging of 15-Watts paired with high-quality braided nylon USB-C charging cord. Heat safety mechanisms optimized.',
    price: 35,
    originalPrice: 50,
    category: 'Combo Offers',
    subCategory: 'Tech Packs',
    images: [
      'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Apex Digital Lab',
    rating: 4.8,
    reviewCount: 74,
    stock: 25,
    tags: ['combo', 'charger', 'wireless', 'accessories', 'pack'],
    createdAt: '2026-03-01T10:00:00Z'
  },
  {
    id: 'p2',
    name: 'Artisan Sandalwood Glow Serum + Jade Roller Combo',
    slug: 'sandalwood-glow-jade-roller-combo',
    idKey: 'p2_combo',
    description: 'Premium organic beauty kit. Indulge in 100% natural, hand-bottled sandalwood age repair serum accompanied by a soothing, authentic Himalayan jade face structural roller.',
    price: 55,
    originalPrice: 80,
    category: 'Combo Offers',
    subCategory: 'Daily Bundles',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v3',
    vendorName: 'Apothecary & Co',
    rating: 4.9,
    reviewCount: 38,
    stock: 15,
    tags: ['combo', 'serum', 'skincare', 'roller', 'deals'],
    createdAt: '2026-03-05T12:00:00Z'
  },

  // FASHION
  {
    id: 'p3',
    name: 'Full-Grain Leather Saddle Crossbody Bag',
    slug: 'leather-saddle-crossbody-bag',
    idKey: 'p3_fashion',
    description: 'Finest hand-finished full grain leather bag detailed with dual solid brass buckles and an adjustable thick shoulder strap. Stitched with resilient waxed linen threading to build classic patina.',
    price: 120,
    originalPrice: 150,
    category: 'Fashion',
    subCategory: "Accessories",
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v1',
    vendorName: 'Epic Style Co.',
    rating: 5.0,
    reviewCount: 42,
    stock: 8,
    tags: ['fashion', 'leather', 'bag', 'premium', 'handcrafted'],
    createdAt: '2026-02-18T08:15:00Z'
  },
  {
    id: 'p4',
    name: 'Woven Indigo Wool Scarf',
    slug: 'woven-indigo-wool-scarf',
    idKey: 'p4_fashion',
    description: 'Incredibly soft high density sheep wool scarf woven on historic vertical foot looms. Dyed with natural cochineal and mountain indigo. Unmatched skin-friendly comfort.',
    price: 45,
    category: 'Fashion',
    subCategory: "Women's Clothing",
    images: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v1',
    vendorName: 'Epic Style Co.',
    rating: 4.7,
    reviewCount: 29,
    stock: 14,
    tags: ['indigo', 'scarf', 'woven', 'apparel', 'fashion'],
    createdAt: '2026-01-20T09:00:00Z'
  },

  // ELECTRONICS
  {
    id: 'p5',
    name: 'Hi-Fi Active Noise Cancelling Wireless Headphones',
    slug: 'hifi-noise-cancelling-headphones',
    idKey: 'p5_elec',
    description: 'Indulge in spatial audiophile acoustic fidelity featuring 40mm carbon dynamic drivers, state-of-the-art hybrid digital ANC technology, and an industry leading 45-hour continuous playback battery life.',
    price: 180,
    originalPrice: 240,
    category: 'Electronics',
    subCategory: 'Audio (Headphones, Speakers)',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Apex Digital Lab',
    rating: 4.8,
    reviewCount: 154,
    stock: 20,
    tags: ['anc', 'headphones', 'wireless', 'audio', 'premium'],
    createdAt: '2026-02-10T11:20:00Z'
  },
  {
    id: 'p6',
    name: 'Apex 3 Axis Action Camera 4K Ultra Wide',
    slug: 'apex-3-axis-action-camera-4k',
    idKey: 'p6_elec',
    description: 'Capture extreme sports or vlogs with absolute state stability. Underwater deep water rated up to 30 meters, high definition 4K recording, voice commands module integrated.',
    price: 210,
    originalPrice: 250,
    category: 'Electronics',
    subCategory: 'Cameras',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Apex Digital Lab',
    rating: 4.9,
    reviewCount: 62,
    stock: 12,
    tags: ['camera', 'action', 'stabilizer', 'electronics', '4k'],
    createdAt: '2026-02-12T14:00:00Z'
  },

  // MOBILE & ACCESSORIES
  {
    id: 'p7',
    name: 'Slim MagSafe Silicon iPhone Case',
    slug: 'magsafe-silicon-protective-case',
    idKey: 'p7_mobile',
    description: 'Superb tactile liquid silicone feel with inside microfiber layers to prevent scratches. Features full certified MagSafe magnet arrays for secure accessories clamping.',
    price: 25,
    originalPrice: 35,
    category: 'Mobile & Accessories',
    subCategory: 'Cases & Covers',
    images: [
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Apex Digital Lab',
    rating: 4.6,
    reviewCount: 110,
    stock: 45,
    tags: ['case', 'iphone', 'magsafe', 'phone', 'accs'],
    createdAt: '2026-03-01T15:45:00Z'
  },
  {
    id: 'p8',
    name: '20000mAh Ultra Fast Power Bank 65W PD',
    slug: '20000mah-fast-charging-power-bank',
    idKey: 'p8_mobile',
    description: 'Massive backup power capacity. Fast-charges smartphones and laptops simultaneously up to 65W with dual USB-C Power Delivery ports. LCD battery meter.',
    price: 49,
    category: 'Mobile & Accessories',
    subCategory: 'Charge & Power',
    images: [
      'https://images.unsplash.com/photo-1609592424109-dd08fb9f15a2?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Apex Digital Lab',
    rating: 4.9,
    reviewCount: 88,
    stock: 30,
    tags: ['charger', 'battery', 'portable', 'accessories', 'usb-c'],
    createdAt: '2026-02-28T09:30:00Z'
  },

  // BEAUTY & PERSONAL CARE
  {
    id: 'p9',
    name: 'Organic Rosemary Mint Hair Strengthening Oil',
    slug: 'rosemary-mint-hair-oil-potency',
    idKey: 'p9_beauty',
    description: 'Deeply nourish your roots with 100% natural cold pressed sweet almond, organic wild rosemary, and cool peppermint extract. Stimulates hair follicle health and boosts organic defense.',
    price: 32,
    originalPrice: 40,
    category: 'Beauty & Personal Care',
    subCategory: 'Haircare',
    images: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v3',
    vendorName: 'Apothecary & Co',
    rating: 4.9,
    reviewCount: 310,
    stock: 50,
    tags: ['oil', 'haircare', 'organic', 'beauty', 'rosemary'],
    createdAt: '2026-03-02T16:00:00Z'
  },
  {
    id: 'p10',
    name: 'Pure Tea Tree Anti-Blemish Facewash',
    slug: 'tea-tree-blemish-cleansing-facewash',
    idKey: 'p10_beauty',
    description: 'Gentle exfoliating foaming cleanser formulated with pure organic Melaleuca leaf extracts and soothing aloe vera matrix. Cleans skin pores thoroughly without dehydration.',
    price: 22,
    category: 'Beauty & Personal Care',
    subCategory: 'Skincare',
    images: [
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v3',
    vendorName: 'Apothecary & Co',
    rating: 4.8,
    reviewCount: 145,
    stock: 40,
    tags: ['cleanser', 'skincare', 'facewash', 'organic', 'natural'],
    createdAt: '2026-01-15T11:00:00Z'
  },

  // HOME APPLIANCE
  {
    id: 'p11',
    name: 'Smart Convection Air Fryer 5.5 Liter',
    slug: 'smart-convection-air-fryer',
    idKey: 'p11_home',
    description: 'Prepare delicious low-fat meals with 360 degree rapid heat circulation. Features a smart digital LED panel with preprogrammed culinary custom settings and Bluetooth mobile app connectivity.',
    price: 99,
    originalPrice: 125,
    category: 'Home Appliances',
    subCategory: 'Kitchen Appliances',
    images: [
      'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v4',
    vendorName: 'Home Komforts',
    rating: 4.7,
    reviewCount: 198,
    stock: 15,
    tags: ['fryer', 'kitchen', 'appliance', 'smart', 'cooking'],
    createdAt: '2026-03-04T13:40:00Z'
  },
  {
    id: 'p12',
    name: 'Robotic Vacuum Cleaner with Smart Mapping Navigation',
    slug: 'robotic-vacuum-cleaner-auto-dock',
    idKey: 'p12_home',
    description: 'Keep your floors spotless without any manual effort. Outstanding suction power, intelligent home mapping algorithm, auto recharging dock, and compatible with voice agents.',
    price: 299,
    originalPrice: 350,
    category: 'Home Appliances',
    subCategory: 'Vaccum Cleaners',
    images: [
      'https://images.unsplash.com/photo-1518133683791-0b9de5a055f0?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v4',
    vendorName: 'Home Komforts',
    rating: 4.9,
    reviewCount: 82,
    stock: 6,
    tags: ['vacuum', 'helper', 'robotic', 'appliances', 'cleaner'],
    createdAt: '2026-02-20T10:00:00Z'
  },

  // PC & LAPTOPS
  {
    id: 'p13',
    name: 'Apex Pro 14" Slim Laptop, AMD Ryzen 7, 16GB RAM',
    slug: 'apex-pro-14-slim-laptop-ryzen',
    idKey: 'p13_pc',
    description: 'Outstanding workstation built for developers and creators. High resolution 120Hz display, 512GB PCIe extreme storage speed, lightweight metal body.',
    price: 850,
    originalPrice: 999,
    category: 'PC & Laptops',
    subCategory: 'Laptops',
    images: [
      'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Apex Digital Lab',
    rating: 4.9,
    reviewCount: 112,
    stock: 5,
    tags: ['laptop', 'notebook', 'ryzen', 'workstation', 'gaming'],
    createdAt: '2026-02-15T09:00:00Z'
  },
  {
    id: 'p14',
    name: 'Apex 27" Curved Gaming Monitor 144Hz 4K',
    slug: 'apex-2 curved-gaming-monitor-4k',
    idKey: 'p14_pc',
    description: 'Immersive liquid smooth gaming response with spectacular color accuracy. Features wide view angles, HDR-400 compatibility, and ergonomic rotation columns.',
    price: 349,
    category: 'PC & Laptops',
    subCategory: 'Monitors',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Apex Digital Lab',
    rating: 4.8,
    reviewCount: 46,
    stock: 10,
    tags: ['monitor', 'curved', 'gaming', '4k', 'display'],
    createdAt: '2026-03-01T11:00:00Z'
  },

  // SPORTS & FITNESS
  {
    id: 'p15',
    name: 'Premium High-Density Slip Proof Yoga Mat',
    slug: 'premium-non-slip-yoga-mat-rubber',
    idKey: 'p15_sports',
    description: 'Eco-safe sustainable organic tree rubber gives supreme grip for intense hot yoga or standard pilates routines. Cushioned joint protection layers.',
    price: 39,
    originalPrice: 49,
    category: 'Sports & Fitness',
    subCategory: 'Fitness Equipment',
    images: [
      'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v3',
    vendorName: 'Apothecary & Co',
    rating: 4.7,
    reviewCount: 165,
    stock: 22,
    tags: ['yoga', 'fitness', 'mat', 'paddings', 'stretch'],
    createdAt: '2026-02-25T14:00:00Z'
  },

  // FURNITURE
  {
    id: 'p16',
    name: 'Ergonomic Premium Foam Adjustable Office Chair',
    slug: 'ergonomic-office-adjustable-neckrest-chair',
    idKey: 'p16_furn',
    description: 'Soothe lumbar posture fatigue with adaptive lumbar mesh supports, fully adjustable armrests, and dynamic pneumatic cylinder height range controls.',
    price: 189,
    originalPrice: 225,
    category: 'Furniture',
    subCategory: 'Office',
    images: [
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v4',
    vendorName: 'Home Komforts',
    rating: 4.8,
    reviewCount: 114,
    stock: 8,
    tags: ['chair', 'furniture', 'office', 'ergonomic', 'desk'],
    createdAt: '2026-03-03T08:00:00Z'
  },

  // TOYS
  {
    id: 'p17',
    name: 'Solid Wood Custom Balancing Animals Blocks ToySet',
    slug: 'handcrafted-wooden-balancing-blocks-toy',
    idKey: 'p17_toys',
    description: 'Spark child logic creativity with raw organic alder and walnut animal blocks designed to balance and cascade. Sealed with organic non-toxic mineral oils.',
    price: 28,
    category: 'Toys',
    subCategory: 'Mind Puzzles',
    images: [
      'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v1',
    vendorName: 'Epic Style Co.',
    rating: 4.9,
    reviewCount: 57,
    stock: 12,
    tags: ['toy', 'wooden', 'blocks', 'kids', 'puzzles'],
    createdAt: '2026-01-30T10:00:00Z'
  },

  // BABY CARE
  {
    id: 'p18',
    name: 'Fully Reversible Compact Double-Stroller Active',
    slug: 'reversible-active-double-baby-stroller',
    idKey: 'p18_baby',
    description: 'Ultra modular structural flight metal frame features padded safety harness locks, extreme terrain rubber shock absorbers, and single-pull compact folding triggers.',
    price: 245,
    originalPrice: 295,
    category: 'Baby Care',
    subCategory: 'Toys & Gear',
    images: [
      'https://images.unsplash.com/photo-1594913785162-e6785b490acf?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v4',
    vendorName: 'Home Komforts',
    rating: 4.8,
    reviewCount: 45,
    stock: 4,
    tags: ['stroller', 'baby', 'gear', 'toddler', 'premium'],
    createdAt: '2026-02-14T11:00:00Z'
  },

  // BOOKS
  {
    id: 'p19',
    name: 'The Alchemy of Indian Crafts: Complete Hardcover History',
    slug: 'alchemy-of-indian-crafts-hardcover',
    idKey: 'p19_books',
    description: 'An expansive chronological encyclopedia documenting generational wood carving, pottery firing, and weaving families across central India. Includes high-resolution photographic layouts.',
    price: 36,
    category: 'Books',
    subCategory: 'Insightful Non-Fiction',
    images: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Apex Digital Lab',
    rating: 5.0,
    reviewCount: 91,
    stock: 35,
    tags: ['book', 'printed', 'history', 'crafts', 'culture'],
    createdAt: '2026-02-28T15:00:00Z'
  },

  // EBOOKS
  {
    id: 'p20',
    name: 'Designing For High Conversion: Interactive eBook Guide',
    slug: 'designing-for-high-conversion-pdf-guide',
    idKey: 'p20_ebooks',
    description: 'Learn modern visual rules, information density spacing, CSS typography pairing, and client-side performance models to construct spectacular digital interfaces. Instantly download standard PDF/ePub format files.',
    price: 15,
    originalPrice: 25,
    category: 'eBooks',
    subCategory: 'IT & Tech Guides',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80'
    ],
    vendorId: 'v2',
    vendorName: 'Apex Digital Lab',
    rating: 4.9,
    reviewCount: 130,
    stock: 999,
    tags: ['ebook', 'pdf', 'coding', 'development', 'design'],
    createdAt: '2026-03-01T15:00:00Z'
  }
];

export const AD_CAMPAIGNS: AdCampaign[] = [
  {
    id: 'ad1',
    title: 'The Great Indian Tech Carnival',
    subtitle: 'High power laptop processors, active noise-cancelling wireless acoustics, and flagship gadgets. Extra 10% instant discount applied.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80',
    badge: 'Limited Promo',
    link: 'category/Electronics',
    backgroundColor: 'bg-emerald-950',
    textColor: 'text-emerald-50'
  },
  {
    id: 'ad2',
    title: 'Natural Botanical Skincare & Honey Duos',
    subtitle: 'Nourish absolute skin radiance with 100% organic tea tree extract facewashes and high altitude mountain beeswax salves.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=1000&auto=format&fit=crop&q=80',
    badge: 'Top Organic Selection',
    link: 'category/Beauty & Personal Care',
    backgroundColor: 'bg-amber-950',
    textColor: 'text-amber-50'
  },
  {
    id: 'ad3',
    title: 'Bespoke Saddle bags & Wool Scarves',
    subtitle: 'Indulge in hand-cut full-grain crossbody leather organizers paired with traditional weaver sheep wool scarves.',
    image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1000&auto=format&fit=crop&q=80',
    badge: 'Trending Fashion',
    link: 'category/Fashion',
    backgroundColor: 'bg-slate-900',
    textColor: 'text-slate-50'
  }
];

export const CATEGORIES_WITH_COUNTS = [
  { name: 'Combo Offers', icon: 'Sparkles', count: 2, image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=300&auto=format&fit=crop&q=80' },
  { name: 'Fashion', icon: 'Briefcase', count: 2, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80' },
  { name: 'Electronics', icon: 'Sparkles', count: 2, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' },
  { name: 'Mobile & Accessories', icon: 'Laptop', count: 2, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&auto=format&fit=crop&q=80' },
  { name: 'Beauty & Personal Care', icon: 'Flower', count: 2, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300&auto=format&fit=crop&q=80' },
  { name: 'Home Appliances', icon: 'Hammer', count: 2, image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&auto=format&fit=crop&q=80' },
  { name: 'PC & Laptops', icon: 'Laptop', count: 2, image: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=300&auto=format&fit=crop&q=80' },
  { name: 'Sports & Fitness', icon: 'Briefcase', count: 1, image: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=300&auto=format&fit=crop&q=80' },
  { name: 'Furniture', icon: 'Hammer', count: 1, image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=300&auto=format&fit=crop&q=80' },
  { name: 'Toys', icon: 'Sparkles', count: 1, image: 'https://images.unsplash.com/photo-1515488042361-404e9250afef?w=300&auto=format&fit=crop&q=80' },
  { name: 'Baby Care', icon: 'Flower', count: 1, image: 'https://images.unsplash.com/photo-1594913785162-e6785b490acf?w=300&auto=format&fit=crop&q=80' },
  { name: 'Books', icon: 'Briefcase', count: 1, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80' },
  { name: 'eBooks', icon: 'Laptop', count: 1, image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80' }
];

// Perform automated high-fidelity variant generation for any items
PRODUCTS.forEach(p => {
  // We assign variants to most categories to allow widespread testing
  if (p.category === 'Fashion' || p.category === 'Electronics' || p.category === 'Home Appliances' || p.category === 'Mobile & Accessories' || p.id === 'p1') {
    let sizes: string[] = [];
    let colors: string[] = [];
    
    if (p.category === 'Fashion') {
      sizes = ['S', 'M', 'L', 'XL'];
      colors = ['Black', 'White', 'Navy', 'Olive'];
    } else {
      sizes = ['M_Size', 'L_Size', 'XL_Size'];
      colors = ['Cream', 'Black', 'Pink'];
    }
    
    const productVariants: any[] = [];
    colors.forEach(col => {
      sizes.forEach(sz => {
        // Derive clean, neat variant IDs like TSHIRT-BLACK-M or CHAIR-WHITE-L
        const prodPrefix = p.brand ? p.brand.toUpperCase() : p.name.substring(0, 6).toUpperCase().replace(/[^A-Z]/g, '');
        const colPart = col.toUpperCase();
        const szPart = sz.toUpperCase();
        const variantId = `${prodPrefix}-${colPart}-${szPart}`;
        
        let multiplier = 1.0;
        if (sz === 'S') multiplier = 0.9;
        else if (sz === 'M') multiplier = 1.0;
        else if (sz === 'L') multiplier = 1.1;
        else if (sz === 'XL') multiplier = 1.15;
        else if (sz === 'M_Size') multiplier = 1.0;
        else if (sz === 'L_Size') multiplier = 1.12;
        else if (sz === 'XL_Size') multiplier = 1.25;
        
        const priceValue = Math.round(p.price * multiplier * 100) / 100;
        
        productVariants.push({
          id: variantId,
          size: sz,
          colour: col,
          sku: `SKU-${variantId}`,
          stock: Math.floor(Math.random() * 8) + 3, // Realistic stock (3 to 10 items)
          price: Math.max(1, priceValue)
        });
      });
    });
    p.variants = productVariants;
  }
});
