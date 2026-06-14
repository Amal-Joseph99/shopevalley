import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Video,
  Package,
  Tag,
  ChevronDown,
  Eye,
  Loader2,
  Check,
  Copy
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { uploadProductImage, uploadProductVideo } from '../lib/productService';
import { useHashRouter } from './CustomRouter';

// ─── TYPES ───────────────────────────────────────────────────────────
interface ProductRow {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  sub_category: string;
  product_type: string;
  status: 'Active' | 'Inactive' | 'Draft';
  images: string[];
  created_at: string;
  variantCount?: number;
}

interface VariantRow {
  variant_id: string;
  sku: string;
  size: string;
  colour: string;
  price: number;
  mrp: number;
  stock: number;
  images: string[];
}

interface CategoryOption { id: string; name: string; }
interface SubCategoryOption { id: string; name: string; category_id: string; }
interface ProductTypeOption { id: string; name: string; sub_category_id: string; hsn_code: string; }

// ─── HELPERS ─────────────────────────────────────────────────────────
function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateVariantId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'VR-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function buildProductSlug(name: string, sku: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'product';
  return `${base}-${sku.toLowerCase()}`;
}

// ─── IMAGE UPLOAD ITEM ───────────────────────────────────────────────
interface UploadingImage {
  file: File;
  preview: string;
  progress: number;
  url?: string;
  error?: string;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────
export default function ProductManagement() {
  const { route, rawHash } = useHashRouter();

  // View state
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // ═══ LIST VIEW STATE ═══
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // ═══ FORM STATE ═══
  const [formStep, setFormStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Step 1: Basic Info
  const [productSku, setProductSku] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
  const [selectedProductTypeId, setSelectedProductTypeId] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [tags, setTags] = useState('');

  // Step 2: Images & Video
  const [baseImages, setBaseImages] = useState<UploadingImage[]>([]);
  const [videoFile, setVideoFile] = useState<UploadingImage | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Variants
  const [sizeType, setSizeType] = useState<'free' | 'multiple'>('free');
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');
  const [colours, setColours] = useState<string[]>([]);
  const [newColour, setNewColour] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // Step 4: Packaging
  const [packageWeight, setPackageWeight] = useState('');
  const [packageLength, setPackageLength] = useState('');
  const [packageWidth, setPackageWidth] = useState('');
  const [packageHeight, setPackageHeight] = useState('');

  // Dropdown options from DB
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<SubCategoryOption[]>([]);
  const [productTypeOptions, setProductTypeOptions] = useState<ProductTypeOption[]>([]);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // ═══ FETCH PRODUCTS LIST ═══
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, sku, name, brand, category, sub_category, product_type, status, images, created_at')
      .order('created_at', { ascending: false });

    if (data) {
      setProducts(data.map((p: any) => ({
        ...p,
        images: p.images || [],
        status: p.status || 'Draft'
      })));
    }
    setIsLoading(false);
  }, []);

  // ═══ FETCH CATEGORY DROPDOWNS ═══
  const fetchCategoryOptions = useCallback(async () => {
    const [catsRes, subsRes, ptsRes] = await Promise.all([
      supabase.from('categories').select('id, name').eq('status', 'Active').order('name'),
      supabase.from('sub_categories').select('id, name, category_id').eq('status', 'Active').order('name'),
      supabase.from('product_types').select('id, name, sub_category_id, hsn_code').eq('status', 'Active').order('name')
    ]);
    if (catsRes.data) setCategoryOptions(catsRes.data);
    if (subsRes.data) setSubCategoryOptions(subsRes.data);
    if (ptsRes.data) setProductTypeOptions(ptsRes.data);
  }, []);

  useEffect(() => { fetchProducts(); fetchCategoryOptions(); }, [fetchProducts, fetchCategoryOptions]);

  // Filtered sub-categories and product types based on selection
  const filteredSubCategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    return subCategoryOptions.filter(s => s.category_id === selectedCategoryId);
  }, [selectedCategoryId, subCategoryOptions]);

  const filteredProductTypes = useMemo(() => {
    if (!selectedSubCategoryId) return [];
    return productTypeOptions.filter(p => p.sub_category_id === selectedSubCategoryId);
  }, [selectedSubCategoryId, productTypeOptions]);

  // Auto-fill HSN code when product type selected
  useEffect(() => {
    if (selectedProductTypeId) {
      const pt = productTypeOptions.find(p => p.id === selectedProductTypeId);
      if (pt) setHsnCode(pt.hsn_code || '');
    }
  }, [selectedProductTypeId, productTypeOptions]);

  // ═══ VARIANT GENERATION ═══
  const regenerateVariants = useCallback((sType: 'free' | 'multiple', sizeList: string[], colourList: string[]) => {
    const newVariants: VariantRow[] = [];

    if (sType === 'free') {
      newVariants.push({
        variant_id: generateVariantId(),
        sku: generateSKU(),
        size: 'Free Size',
        colour: '',
        price: 0,
        mrp: 0,
        stock: 0,
        images: []
      });
    } else {
      const effectiveSizes = sizeList.length > 0 ? sizeList : ['Free Size'];
      const effectiveColours = colourList.length > 0 ? colourList : [''];

      for (const size of effectiveSizes) {
        for (const colour of effectiveColours) {
          newVariants.push({
            variant_id: generateVariantId(),
            sku: generateSKU(),
            size,
            colour,
            price: 0,
            mrp: 0,
            stock: 0,
            images: []
          });
        }
      }
    }

    setVariants(prev => newVariants.map((variant, index) => {
      const existing = prev.find(item => item.size === variant.size && item.colour === variant.colour) || prev[index];
      return existing ? { ...variant, ...existing, size: variant.size, colour: variant.colour } : variant;
    }));
  }, []);

  // Regenerate variants when sizes/colours change
  useEffect(() => {
    regenerateVariants(sizeType, sizes, colours);
  }, [sizeType, sizes, colours, regenerateVariants]);

  // ═══ IMAGE HANDLING ═══
  const validateSquareImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img.width === img.height);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 10 - baseImages.length;
    const selected = Array.from(files as FileList).slice(0, remaining);

    for (const file of selected) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) continue;

      const isSquare = await validateSquareImage(file);
      if (!isSquare) {
        const errorItem: UploadingImage = {
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          error: 'Image must be square (1:1 ratio)'
        };
        setBaseImages(prev => [...prev, errorItem]);
        continue;
      }

      const item: UploadingImage = {
        file,
        preview: URL.createObjectURL(file),
        progress: 0
      };
      setBaseImages(prev => [...prev, item]);

      // Simulate upload progress + actual upload
      uploadImageWithProgress(file, baseImages.length + selected.indexOf(file));
    }

    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const uploadImageWithProgress = async (file: File, index: number) => {
    // Simulate progress stages
    const progressStages = [10, 30, 50, 70, 90];
    for (const stage of progressStages) {
      await new Promise(r => setTimeout(r, 200));
      setBaseImages(prev => prev.map((img, i) =>
        img.file === file ? { ...img, progress: stage } : img
      ));
    }

    const url = await uploadProductImage(file);

    setBaseImages(prev => prev.map((img) =>
      img.file === file ? { ...img, progress: 100, url } : img
    ));
  };

  const removeImage = (index: number) => {
    setBaseImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) return;

    const item: UploadingImage = { file, preview: '', progress: 0 };
    setVideoFile(item);

    const progressStages = [10, 25, 40, 55, 70, 85];
    for (const stage of progressStages) {
      await new Promise(r => setTimeout(r, 300));
      setVideoFile(prev => prev ? { ...prev, progress: stage } : null);
    }

    const url = await uploadProductVideo(file);
    setVideoFile(prev => prev ? { ...prev, progress: 100, url } : null);

    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // ═══ FORM ACTIONS ═══
  const updateProductFormRoute = (productId: string | null, step: number) => {
    const params = new URLSearchParams();
    params.set('view', 'form');
    params.set('step', String(step));
    if (productId) params.set('productId', productId);
    window.location.hash = `#/admin/products?${params.toString()}`;
  };

  const openAddForm = (pushRoute = true) => {
    resetForm();
    setProductSku(generateSKU());
    setView('form');
    setFormStep(1);
    setEditingProductId(null);
    if (pushRoute) updateProductFormRoute(null, 1);
  };

  const openEditForm = async (product: ProductRow, step = 1, pushRoute = true) => {
    resetForm();
    setEditingProductId(product.id);
    setProductSku(product.sku);
    setProductName(product.name);
    setBrand(product.brand || '');
    setView('form');
    setFormStep(step);
    if (pushRoute) updateProductFormRoute(product.id, step);

    // Fetch full product data
    const { data } = await supabase.from('products').select('*').eq('id', product.id).single();
    if (data) {
      setSelectedCategoryId(data.category_id || '');
      setSelectedSubCategoryId(data.sub_category_id || '');
      setSelectedProductTypeId(data.product_type_id || '');
      setHsnCode(data.hsn_code || '');
      setShortDescription(data.short_description || '');
      setFullDescription(data.description || '');
      setTags((data.tags || []).join(', '));
      setPackageWeight(data.package_weight?.toString() || '');
      setPackageLength(data.package_length?.toString() || '');
      setPackageWidth(data.package_width?.toString() || '');
      setPackageHeight(data.package_height?.toString() || '');

      // Load existing images
      if (data.images && data.images.length > 0) {
        setBaseImages(data.images.map((url: string) => ({
          file: new File([], ''),
          preview: url,
          progress: 100,
          url
        })));
      }
      if (data.video_url) {
        setVideoFile({ file: new File([], ''), preview: '', progress: 100, url: data.video_url });
      }
    }

    // Fetch variants
    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at');

    if (variantsData && variantsData.length > 0) {
      const loadedVariants: VariantRow[] = variantsData.map((v: any) => ({
        variant_id: v.variant_id,
        sku: v.sku,
        size: v.size,
        colour: v.colour || '',
        price: v.price || 0,
        mrp: v.mrp || 0,
        stock: v.stock || 0,
        images: v.images || []
      }));
      setVariants(loadedVariants);

      // Determine size type
      if (loadedVariants.length === 1 && loadedVariants[0].size === 'Free Size') {
        setSizeType('free');
      } else {
        setSizeType('multiple');
        const uniqueSizes = [...new Set(loadedVariants.map(v => v.size))];
        const uniqueColours = [...new Set(loadedVariants.map(v => v.colour).filter(Boolean))];
        setSizes(uniqueSizes);
        setColours(uniqueColours);
      }
    }
  };

  const openEditFormById = async (productId: string, step: number) => {
    const { data } = await supabase
      .from('products')
      .select('id, sku, name, brand, category, sub_category, product_type, status, images, created_at')
      .eq('id', productId)
      .single();

    if (data) {
      await openEditForm({
        ...data,
        images: data.images || [],
        status: data.status || 'Draft'
      } as ProductRow, step, false);
    }
  };

  useEffect(() => {
    if (route.path !== 'admin/products') return;

    const params = new URLSearchParams(rawHash.split('?')[1] || '');
    const routeView = params.get('view');
    const productId = params.get('productId');
    const step = Math.min(4, Math.max(1, Number(params.get('step') || 1)));

    if (routeView === 'form') {
      if (productId && productId !== editingProductId) {
        openEditFormById(productId, step);
      } else {
        if (view !== 'form') openAddForm(false);
        setFormStep(step);
      }
    } else if (view === 'form') {
      setView('list');
      resetForm();
    }
  }, [route.path, rawHash]);

  const resetForm = () => {
    setProductSku('');
    setProductName('');
    setBrand('');
    setSelectedCategoryId('');
    setSelectedSubCategoryId('');
    setSelectedProductTypeId('');
    setHsnCode('');
    setShortDescription('');
    setFullDescription('');
    setTags('');
    setBaseImages([]);
    setVideoFile(null);
    setSizeType('free');
    setSizes([]);
    setColours([]);
    setVariants([]);
    setPackageWeight('');
    setPackageLength('');
    setPackageWidth('');
    setPackageHeight('');
    setSaveError('');
    setSaveSuccess('');
    setEditingProductId(null);
  };

  const getUploadedImages = () => baseImages.filter(img => img.url && !img.error).map(img => img.url!);

  const buildProductPayload = (status: 'Draft' | 'Active', skuOverride = productSku) => {
    const categoryName = categoryOptions.find(c => c.id === selectedCategoryId)?.name || '';
    const subCategoryName = subCategoryOptions.find(s => s.id === selectedSubCategoryId)?.name || '';
    const productTypeName = productTypeOptions.find(p => p.id === selectedProductTypeId)?.name || '';
    const pricedVariants = variants.filter(v => v.price > 0);
    const baseVariant = pricedVariants[0] || variants[0];

    return {
      id_key: skuOverride,
      sku: skuOverride,
      name: productName.trim(),
      slug: buildProductSlug(productName.trim(), skuOverride),
      price: baseVariant?.price || 0,
      original_price: baseVariant?.mrp || null,
      stock: variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0),
      brand: brand.trim(),
      category_id: selectedCategoryId || null,
      category: categoryName,
      sub_category_id: selectedSubCategoryId || null,
      sub_category: subCategoryName,
      product_type_id: selectedProductTypeId || null,
      product_type: productTypeName,
      hsn_code: hsnCode,
      short_description: shortDescription.trim(),
      description: fullDescription.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      images: getUploadedImages(),
      video_url: videoFile?.url || null,
      package_weight: packageWeight ? parseFloat(packageWeight) : null,
      package_length: packageLength ? parseFloat(packageLength) : null,
      package_width: packageWidth ? parseFloat(packageWidth) : null,
      package_height: packageHeight ? parseFloat(packageHeight) : null,
      status,
      updated_at: new Date().toISOString()
    };
  };

  const saveProductDraft = async (nextStep: number) => {
    setSaveError('');
    setSaveSuccess('');

    if (!productName.trim()) { setSaveError('Product Name is required before saving a draft'); setFormStep(1); return; }
    if (!brand.trim()) { setSaveError('Brand is required before saving a draft'); setFormStep(1); return; }
    if (!selectedCategoryId) { setSaveError('Category is required before saving a draft'); setFormStep(1); return; }
    if (!selectedSubCategoryId) { setSaveError('Sub Category is required before saving a draft'); setFormStep(1); return; }
    if (!selectedProductTypeId) { setSaveError('Product Type is required before saving a draft'); setFormStep(1); return; }

    setIsDraftSaving(true);
    const skuForSave = productSku || generateSKU();
    if (!productSku) setProductSku(skuForSave);

    try {
      let productId = editingProductId;
      const draftPayload = buildProductPayload('Draft', skuForSave);

      if (productId) {
        const { error } = await supabase.from('products').update(draftPayload).eq('id', productId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert({ ...draftPayload, created_at: new Date().toISOString() })
          .select('id')
          .single();
        if (error) throw new Error(error.message);
        productId = data.id;
        setEditingProductId(productId);
      }

      await supabase.from('product_variants').delete().eq('product_id', productId!);
      if (variants.length > 0) {
        const variantRows = variants.map(v => ({
          product_id: productId!,
          variant_id: v.variant_id,
          sku: v.sku,
          size: v.size,
          colour: v.colour || null,
          price: v.price || 0,
          mrp: v.mrp || 0,
          stock: v.stock || 0,
          images: v.images,
          status: 'Active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        const { error: vError } = await supabase.from('product_variants').insert(variantRows);
        if (vError) throw new Error(vError.message);
      }

      setFormStep(nextStep);
      setSaveSuccess('Draft saved. You can safely continue later.');
      updateProductFormRoute(productId!, nextStep);
      await fetchProducts();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save draft');
    } finally {
      setIsDraftSaving(false);
    }
  };

  // ═══ SAVE PRODUCT ═══
  const handleSaveProduct = async () => {
    setSaveError('');
    setSaveSuccess('');

    // Validation
    if (!productName.trim()) { setSaveError('Product Name is required'); setFormStep(1); return; }
    if (!brand.trim()) { setSaveError('Brand is required'); setFormStep(1); return; }
    if (!selectedCategoryId) { setSaveError('Category is required'); setFormStep(1); return; }
    if (!selectedSubCategoryId) { setSaveError('Sub Category is required'); setFormStep(1); return; }
    if (!selectedProductTypeId) { setSaveError('Product Type is required'); setFormStep(1); return; }

    const uploadedImages = getUploadedImages();
    if (uploadedImages.length < 3) { setSaveError('Minimum 3 images are required'); setFormStep(2); return; }

    const hasValidVariant = variants.some(v => v.price > 0 && v.stock > 0);
    if (!hasValidVariant) { setSaveError('At least one variant must have price and stock > 0'); setFormStep(3); return; }

    setIsSaving(true);

    const productPayload = buildProductPayload('Active');

    try {
      let productId = editingProductId;

      if (editingProductId) {
        const { error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', editingProductId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert({ ...productPayload, created_at: new Date().toISOString() })
          .select('id')
          .single();
        if (error) throw new Error(error.message);
        productId = data.id;
      }

      // Delete existing variants and re-insert
      await supabase.from('product_variants').delete().eq('product_id', productId!);

      const variantRows = variants.map(v => ({
        product_id: productId!,
        variant_id: v.variant_id,
        sku: v.sku,
        size: v.size,
        colour: v.colour || null,
        price: v.price,
        mrp: v.mrp,
        stock: v.stock,
        images: v.images,
        status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      if (variantRows.length > 0) {
        const { error: vError } = await supabase.from('product_variants').insert(variantRows);
        if (vError) throw new Error(vError.message);
      }

      setSaveSuccess(editingProductId ? 'Product updated successfully!' : 'Product created successfully!');
      await fetchProducts();
      setTimeout(() => {
        setView('list');
        resetForm();
        window.location.hash = '#/admin/products';
      }, 1500);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  // ═══ DELETE PRODUCT ═══
  const handleDeleteProduct = async () => {
    if (!deleteConfirm) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteConfirm.id);
    if (error) {
      alert('Delete failed: ' + error.message);
    } else {
      setProducts(prev => prev.filter(p => p.id !== deleteConfirm.id));
    }
    setDeleteConfirm(null);
  };

  // ═══ TOGGLE STATUS ═══
  const toggleProductStatus = async (id: string, current: string) => {
    const next = current === 'Active' ? 'Inactive' : 'Active';
    const { error } = await supabase.from('products').update({ status: next, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: next as any } : p));
    }
  };

  // ═══ FILTERED & PAGINATED DATA ═══
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) {
      result = result.filter(p => p.status === statusFilter);
    }
    return result;
  }, [products, searchTerm, statusFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  // ─── PRODUCT LIST VIEW ─────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="space-y-6" id="product_management_root">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="text-left space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Product Management</h1>
            <p className="text-xs text-slate-500 font-medium">Manage your complete product catalog with variants, pricing, and media</p>
          </div>
          <button
            onClick={openAddForm}
            className="bg-[#7c3aed] hover:bg-violet-700 text-white shadow-sm font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, SKU, brand..."
              className="w-full text-xs py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl pl-3.5 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 mt-3">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-sm text-slate-700">No products found</h4>
              <p className="text-xs text-slate-400">Create your first product to get started</p>
              <button onClick={openAddForm} className="bg-[#7c3aed] text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer">
                Create Product
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-slate-400 uppercase font-mono font-extrabold text-[10px]">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">SKU</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Created</th>
                      <th className="py-3.5 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedProducts.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {p.images[0] ? (
                              <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-slate-400" /></div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 max-w-[200px] truncate">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.brand || 'No brand'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 text-[11px]">{p.sku}</td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{p.category || '—'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleProductStatus(p.id, p.status)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border inline-flex items-center gap-1 cursor-pointer ${
                              p.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              p.status === 'Inactive' ? 'bg-slate-50 text-slate-400 border-slate-200' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'Active' ? 'bg-emerald-500' : p.status === 'Inactive' ? 'bg-slate-400' : 'bg-amber-500'}`} />
                            {p.status}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                          {new Date(p.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditForm(p)} className="text-slate-500 hover:text-[#7c3aed] p-1" title="Edit">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteConfirm({ id: p.id, name: p.name })} className="text-slate-400 hover:text-rose-600 p-1" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    Page {page} of {totalPages} ({filteredProducts.length} products)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 px-2.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-40 flex items-center gap-0.5 cursor-pointer">
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1 px-2.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 disabled:opacity-40 flex items-center gap-0.5 cursor-pointer">
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="bg-red-50 text-red-600 p-2.5 rounded-full"><AlertTriangle className="w-5 h-5" /></div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Delete Product</h3>
                  <p className="text-xs text-slate-500">Delete <strong>"{deleteConfirm.name}"</strong> and all its variants permanently?</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Cancel</button>
                <button onClick={handleDeleteProduct} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── PRODUCT FORM VIEW ─────────────────────────────────────────────
  return (
    <div className="space-y-6" id="product_form_root">

      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="text-left">
          <h1 className="text-xl font-extrabold text-slate-900">
            {editingProductId ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-xs text-slate-500">Fill in all sections below. SKU is auto-generated.</p>
        </div>
        <button onClick={() => { setView('list'); resetForm(); window.location.hash = '#/admin/products'; }} className="text-slate-500 hover:text-slate-800 p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {[
          { num: 1, label: 'Basic Info' },
          { num: 2, label: 'Images & Video' },
          { num: 3, label: 'Variants & Pricing' },
          { num: 4, label: 'Packaging' }
        ].map(step => (
          <button
            key={step.num}
            onClick={() => {
              if (step.num > formStep) {
                saveProductDraft(step.num);
              } else {
                setFormStep(step.num);
                updateProductFormRoute(editingProductId, step.num);
              }
            }}
            className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
              formStep === step.num
                ? 'bg-[#7c3aed] text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {step.num}. {step.label}
          </button>
        ))}
      </div>

      {/* Error / Success Messages */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs font-bold text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {saveError}
        </div>
      )}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs font-bold text-emerald-700 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" /> {saveSuccess}
        </div>
      )}

      {/* ═══ STEP 1: BASIC INFO ═══ */}
      {formStep === 1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 text-left">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase border-b border-slate-100 pb-3">Basic Information</h3>

          {/* SKU - Auto Generated */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Product SKU (Auto-Generated)</label>
            <div className="flex items-center gap-2">
              <input type="text" value={productSku} readOnly className="flex-grow text-xs border border-slate-200 rounded-xl py-2.5 px-3.5 bg-slate-100 text-slate-700 font-mono font-bold cursor-not-allowed" />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(productSku)}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500"
                title="Copy SKU"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Product Name *</label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="e.g. Premium Cotton T-Shirt"
              className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Brand *</label>
            <input
              type="text"
              value={brand}
              onChange={e => setBrand(e.target.value)}
              placeholder="e.g. Nike, Samsung, Local Artisan"
              className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Category Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Category *</label>
              <select
                value={selectedCategoryId}
                onChange={e => { setSelectedCategoryId(e.target.value); setSelectedSubCategoryId(''); setSelectedProductTypeId(''); }}
                className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="">Select Category</option>
                {categoryOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Sub Category *</label>
              <select
                value={selectedSubCategoryId}
                onChange={e => { setSelectedSubCategoryId(e.target.value); setSelectedProductTypeId(''); }}
                disabled={!selectedCategoryId}
                className={`w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 ${!selectedCategoryId ? 'opacity-50' : ''}`}
              >
                <option value="">Select Sub Category</option>
                {filteredSubCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Product Type *</label>
              <select
                value={selectedProductTypeId}
                onChange={e => setSelectedProductTypeId(e.target.value)}
                disabled={!selectedSubCategoryId}
                className={`w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 ${!selectedSubCategoryId ? 'opacity-50' : ''}`}
              >
                <option value="">Select Product Type</option>
                {filteredProductTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          {/* HSN Code */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">HSN Code (Auto-filled from Product Type)</label>
            <input type="text" value={hsnCode} readOnly className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3.5 bg-slate-50 font-mono font-bold text-slate-600 cursor-not-allowed" />
          </div>

          {/* Descriptions */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Short Description</label>
            <textarea
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              rows={2}
              placeholder="Brief 1-2 line summary..."
              className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Full Description</label>
            <textarea
              value={fullDescription}
              onChange={e => setFullDescription(e.target.value)}
              rows={4}
              placeholder="Detailed product description..."
              className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. casual, summer, cotton, premium"
              className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button onClick={() => saveProductDraft(2)} disabled={isDraftSaving} className="bg-[#7c3aed] text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2">
              {isDraftSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Next: Images &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 2: IMAGES & VIDEO ═══ */}
      {formStep === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 text-left">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase border-b border-slate-100 pb-3">Images & Video</h3>

          {/* Requirements notice */}
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-xs text-violet-700 font-medium">
            <strong>Requirements:</strong> Minimum 3 images, maximum 10. All images must be <strong>square (1:1 ratio)</strong> — e.g. 1000x1000px or 500x500px. Max 5MB per file.
          </div>

          {/* Image Upload Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Product Images ({baseImages.filter(i => !i.error).length}/10) — Min 3 required
              </label>
              {baseImages.length < 10 && (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" /> Upload Images
                </button>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Upload drop zone when empty */}
            {baseImages.length === 0 && (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center cursor-pointer hover:border-violet-300 hover:bg-violet-50/30 transition-all"
              >
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">Click to upload product images</p>
                <p className="text-[10px] text-slate-400 mt-1">Square images only (1:1) • JPG, PNG, WEBP • Max 5MB</p>
              </div>
            )}

            {/* Image Grid */}
            {baseImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {baseImages.map((img, idx) => (
                  <div key={idx} className={`relative group rounded-xl overflow-hidden border ${img.error ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}>
                    <img src={img.preview} alt="" className="w-full aspect-square object-cover" />

                    {/* Progress overlay */}
                    {img.progress < 100 && !img.error && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-3 border-white/30 border-t-white animate-spin"></div>
                        <span className="text-white font-bold text-sm mt-2">{img.progress}%</span>
                      </div>
                    )}

                    {/* Success badge */}
                    {img.progress === 100 && !img.error && (
                      <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white rounded-full p-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    {/* Error overlay */}
                    {img.error && (
                      <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center p-2">
                        <p className="text-white text-[10px] font-bold text-center">{img.error}</p>
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* First image badge */}
                    {idx === 0 && !img.error && (
                      <div className="absolute bottom-1.5 left-1.5 bg-violet-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        MAIN
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Upload */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Product Video (Optional) — Square format</label>
              {!videoFile && (
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Video className="w-3 h-3" /> Upload Video
                </button>
              )}
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm"
              onChange={handleVideoSelect}
              className="hidden"
            />

            {videoFile && (
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                <Video className="w-8 h-8 text-violet-500 shrink-0" />
                <div className="flex-grow">
                  <p className="text-xs font-bold text-slate-700">{videoFile.file.name || 'Video uploaded'}</p>
                  {videoFile.progress < 100 ? (
                    <div className="mt-1.5">
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${videoFile.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">{videoFile.progress}%</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold">Uploaded successfully</span>
                  )}
                </div>
                <button onClick={() => setVideoFile(null)} className="text-slate-400 hover:text-red-500 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button onClick={() => { setFormStep(1); updateProductFormRoute(editingProductId, 1); }} className="border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer hover:bg-slate-50">
              &larr; Back
            </button>
            <button onClick={() => saveProductDraft(3)} disabled={isDraftSaving} className="bg-[#7c3aed] text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2">
              {isDraftSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Next: Variants &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3: VARIANTS & PRICING ═══ */}
      {formStep === 3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 text-left">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase border-b border-slate-100 pb-3">Variants & Pricing</h3>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 font-medium">
            Price and Stock are managed <strong>per variant</strong>. Every product gets at least one variant (Free Size if no size options).
          </div>

          {/* Size Type Toggle */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Size Type</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSizeType('free'); setSizes([]); setColours([]); }}
                className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  sizeType === 'free' ? 'bg-[#7c3aed] text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Free Size (Single Variant)
              </button>
              <button
                onClick={() => setSizeType('multiple')}
                className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  sizeType === 'multiple' ? 'bg-[#7c3aed] text-white border-violet-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                Multiple Sizes / Colors
              </button>
            </div>
          </div>

          {/* Size & Color Inputs (only for multiple) */}
          {sizeType === 'multiple' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sizes */}
              <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Sizes</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={e => setNewSize(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newSize.trim()) {
                        e.preventDefault();
                        if (!sizes.includes(newSize.trim())) setSizes(prev => [...prev, newSize.trim()]);
                        setNewSize('');
                      }
                    }}
                    placeholder="Type size & press Enter"
                    className="flex-grow text-xs border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
                  />
                  <button
                    onClick={() => { if (newSize.trim() && !sizes.includes(newSize.trim())) { setSizes(prev => [...prev, newSize.trim()]); setNewSize(''); } }}
                    className="bg-violet-100 text-violet-700 font-bold text-xs py-2 px-3 rounded-lg cursor-pointer hover:bg-violet-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sizes.map(s => (
                    <span key={s} className="bg-white border border-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      {s}
                      <button onClick={() => setSizes(prev => prev.filter(x => x !== s))} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Colors (Optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newColour}
                    onChange={e => setNewColour(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newColour.trim()) {
                        e.preventDefault();
                        if (!colours.includes(newColour.trim())) setColours(prev => [...prev, newColour.trim()]);
                        setNewColour('');
                      }
                    }}
                    placeholder="Type colour & press Enter"
                    className="flex-grow text-xs border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-white"
                  />
                  <button
                    onClick={() => { if (newColour.trim() && !colours.includes(newColour.trim())) { setColours(prev => [...prev, newColour.trim()]); setNewColour(''); } }}
                    className="bg-violet-100 text-violet-700 font-bold text-xs py-2 px-3 rounded-lg cursor-pointer hover:bg-violet-200"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {colours.map(c => (
                    <span key={c} className="bg-white border border-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      {c}
                      <button onClick={() => setColours(prev => prev.filter(x => x !== c))} className="text-slate-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Variant Table */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase">Variant Combinations ({variants.length})</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr className="text-slate-400 uppercase font-mono font-extrabold text-[10px]">
                      <th className="py-3 px-3">Variant ID</th>
                      <th className="py-3 px-3">SKU</th>
                      <th className="py-3 px-3">Size</th>
                      <th className="py-3 px-3">Colour</th>
                      <th className="py-3 px-3">Selling Price *</th>
                      <th className="py-3 px-3">MRP</th>
                      <th className="py-3 px-3">Stock *</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((v, idx) => (
                      <tr key={v.variant_id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[10px] text-violet-600">{v.variant_id}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[10px] text-slate-600">{v.sku}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-700">{v.size}</td>
                        <td className="py-2.5 px-3 text-slate-600">{v.colour || '—'}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={v.price || ''}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setVariants(prev => prev.map((vr, i) => i === idx ? { ...vr, price: val } : vr));
                            }}
                            placeholder="0.00"
                            className="w-20 text-xs border border-slate-200 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={v.mrp || ''}
                            onChange={e => {
                              const val = parseFloat(e.target.value) || 0;
                              setVariants(prev => prev.map((vr, i) => i === idx ? { ...vr, mrp: val } : vr));
                            }}
                            placeholder="0.00"
                            className="w-20 text-xs border border-slate-200 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            value={v.stock || ''}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0;
                              setVariants(prev => prev.map((vr, i) => i === idx ? { ...vr, stock: val } : vr));
                            }}
                            placeholder="0"
                            className="w-16 text-xs border border-slate-200 rounded-lg py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button onClick={() => { setFormStep(2); updateProductFormRoute(editingProductId, 2); }} className="border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer hover:bg-slate-50">
              &larr; Back
            </button>
            <button onClick={() => saveProductDraft(4)} disabled={isDraftSaving} className="bg-[#7c3aed] text-white font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2">
              {isDraftSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Next: Packaging &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 4: PACKAGING & SAVE ═══ */}
      {formStep === 4 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 text-left">
          <h3 className="font-extrabold text-sm text-slate-800 uppercase border-b border-slate-100 pb-3">Packaging Details (Optional)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Weight (grams)</label>
              <input
                type="number"
                value={packageWeight}
                onChange={e => setPackageWeight(e.target.value)}
                placeholder="e.g. 250"
                className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Length (cm)</label>
              <input
                type="number"
                value={packageLength}
                onChange={e => setPackageLength(e.target.value)}
                placeholder="e.g. 20"
                className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Width (cm)</label>
              <input
                type="number"
                value={packageWidth}
                onChange={e => setPackageWidth(e.target.value)}
                placeholder="e.g. 15"
                className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Height (cm)</label>
              <input
                type="number"
                value={packageHeight}
                onChange={e => setPackageHeight(e.target.value)}
                placeholder="e.g. 5"
                className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Summary before save */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase">Product Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div><span className="text-slate-400">SKU:</span> <span className="font-mono font-bold text-slate-800">{productSku}</span></div>
              <div><span className="text-slate-400">Name:</span> <span className="font-bold text-slate-800">{productName || '—'}</span></div>
              <div><span className="text-slate-400">Images:</span> <span className="font-bold text-slate-800">{baseImages.filter(i => i.url && !i.error).length}</span></div>
              <div><span className="text-slate-400">Variants:</span> <span className="font-bold text-slate-800">{variants.length}</span></div>
            </div>
          </div>

          <div className="flex justify-between pt-3 border-t border-slate-100">
            <button onClick={() => { setFormStep(3); updateProductFormRoute(editingProductId, 3); }} className="border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-6 rounded-xl cursor-pointer hover:bg-slate-50">
              &larr; Back
            </button>
            <button
              onClick={handleSaveProduct}
              disabled={isSaving}
              className="bg-[#7c3aed] text-white font-bold text-xs py-2.5 px-8 rounded-xl cursor-pointer hover:bg-violet-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? 'Saving...' : editingProductId ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
