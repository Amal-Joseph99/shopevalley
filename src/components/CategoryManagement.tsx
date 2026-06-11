import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag, 
  FolderPlus, 
  Layers, 
  Hash, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle, 
  AlertTriangle,
  Info,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
}

export interface SubCategoryItem {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
}

export interface ProductTypeItem {
  id: string;
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  name: string;
  hsnCode: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
}

export default function CategoryManagement() {
  // --- 1. CORE STATE MANAGEMENT WITH PERSISTENCE & SEED FALLBACKS ---
  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const cached = localStorage.getItem('sv_categories_list');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse categories cache", e);
      }
    }
    return [
      { id: 'cat_1', name: 'Electronics', createdAt: '2026-05-10', status: 'Active' },
      { id: 'cat_2', name: 'Fashion', createdAt: '2026-05-11', status: 'Active' },
      { id: 'cat_3', name: 'Beauty & Personal Care', createdAt: '2026-05-12', status: 'Active' },
      { id: 'cat_4', name: 'Home Appliances', createdAt: '2026-05-13', status: 'Active' },
    ];
  });

  const [subCategories, setSubCategories] = useState<SubCategoryItem[]>(() => {
    const cached = localStorage.getItem('sv_subcategories_list');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse subcategories cache", e);
      }
    }
    return [
      { id: 'sub_1', categoryId: 'cat_1', categoryName: 'Electronics', name: 'Mobile Phones', createdAt: '2026-05-10', status: 'Active' },
      { id: 'sub_2', categoryId: 'cat_1', categoryName: 'Electronics', name: 'PC & Laptops', createdAt: '2026-05-11', status: 'Active' },
      { id: 'sub_3', categoryId: 'cat_2', categoryName: 'Fashion', name: 'Mens Wear', createdAt: '2026-05-12', status: 'Active' },
      { id: 'sub_4', categoryId: 'cat_2', categoryName: 'Fashion', name: 'Womens Wear', createdAt: '2026-05-13', status: 'Active' },
      { id: 'sub_5', categoryId: 'cat_3', categoryName: 'Beauty & Personal Care', name: 'Skincare', createdAt: '2026-05-14', status: 'Active' },
    ];
  });

  const [productTypes, setProductTypes] = useState<ProductTypeItem[]>(() => {
    const cached = localStorage.getItem('sv_producttypes_list');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse producttypes cache", e);
      }
    }
    return [
      { id: 'pt_1', categoryId: 'cat_1', categoryName: 'Electronics', subCategoryId: 'sub_1', subCategoryName: 'Mobile Phones', name: 'Smartphones', hsnCode: '85171200', createdAt: '2026-05-10', status: 'Active' },
      { id: 'pt_2', categoryId: 'cat_1', categoryName: 'Electronics', subCategoryId: 'sub_2', subCategoryName: 'PC & Laptops', name: 'Gaming Laptops', hsnCode: '84713010', createdAt: '2026-05-11', status: 'Active' },
      { id: 'pt_3', categoryId: 'cat_2', categoryName: 'Fashion', subCategoryId: 'sub_3', subCategoryName: 'Mens Wear', name: 'Cotton Shirts', hsnCode: '62052000', createdAt: '2026-05-12', status: 'Active' },
      { id: 'pt_4', categoryId: 'cat_2', categoryName: 'Fashion', subCategoryId: 'sub_4', subCategoryName: 'Womens Wear', name: 'Denim Jeans', hsnCode: '62046200', createdAt: '2026-05-13', status: 'Active' },
      { id: 'pt_5', categoryId: 'cat_3', categoryName: 'Beauty & Personal Care', subCategoryId: 'sub_5', subCategoryName: 'Skincare', name: 'Sunscreen SPF50', hsnCode: '33049910', createdAt: '2026-05-14', status: 'Active' },
    ];
  });

  // Save changes to localStorage on any state modification
  useEffect(() => {
    localStorage.setItem('sv_categories_list', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sv_subcategories_list', JSON.stringify(subCategories));
  }, [subCategories]);

  useEffect(() => {
    localStorage.setItem('sv_producttypes_list', JSON.stringify(productTypes));
  }, [productTypes]);

  // --- 2. ACTIVE VIEW NAVIGATION TAB ---
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories' | 'producttypes'>('categories');

  // --- 3. FILTER & SEARCH CRITERIA ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');
  const [selectedSubCatFilter, setSelectedSubCatFilter] = useState('');

  // Auto-reset subcategory filter if the category filter changes
  useEffect(() => {
    setSelectedSubCatFilter('');
  }, [selectedCatFilter]);

  // --- 4. DATA SORTING STATES ---
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // --- 5. PAGINATION STATES ---
  const [catPage, setCatPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [ptPage, setPtPage] = useState(1);
  const itemsPerPage = 5;

  // Reset pages when filters change to avoid empty pages
  useEffect(() => {
    setCatPage(1);
    setSubPage(1);
    setPtPage(1);
  }, [searchTerm, selectedCatFilter, selectedSubCatFilter]);

  // --- 6. FORM MODAL CONTROLS ---
  // Modal toggle state
  const [categoryModal, setCategoryModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; itemId?: string }>({ isOpen: false, mode: 'add' });
  const [subCategoryModal, setSubCategoryModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; itemId?: string }>({ isOpen: false, mode: 'add' });
  const [productTypeModal, setProductTypeModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; itemId?: string }>({ isOpen: false, mode: 'add' });

  // Fields state for modals
  const [catForm, setCatForm] = useState({ name: '', status: 'Active' as 'Active' | 'Inactive' });
  const [subForm, setSubForm] = useState({ categoryId: '', name: '', status: 'Active' as 'Active' | 'Inactive' });
  const [ptForm, setPtForm] = useState({ categoryId: '', subCategoryId: '', name: '', hsnCode: '', status: 'Active' as 'Active' | 'Inactive' });

  // Input Validation Error Messages
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Subcategories options filtered based on selected category in Product Type Form
  const ptFormSubCategories = useMemo(() => {
    if (!ptForm.categoryId) return [];
    return subCategories.filter(sub => sub.categoryId === ptForm.categoryId && sub.status === 'Active');
  }, [ptForm.categoryId, subCategories]);

  // --- 7. DELETE CONFIRMATION DIALOG STATE ---
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'category' | 'subcategory' | 'producttype';
    id: string;
    itemName: string;
  } | null>(null);

  // --- 8. STATS DERIVED STATE ---
  const stats = useMemo(() => {
    const totalCats = categories.length;
    const totalSubs = subCategories.length;
    const totalPTs = productTypes.length;
    // Distinct HSN codes
    const uniqueHSN = new Set(productTypes.map(pt => pt.hsnCode).filter(Boolean)).size;

    return {
      totalCats,
      totalSubs,
      totalPTs,
      uniqueHSN
    };
  }, [categories, subCategories, productTypes]);

  // --- 9. ROW FILTERING, SORTING, AND SEARCH LOGIC ---
  // A. Filtered Categories
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Search criteria
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(cat => cat.name.toLowerCase().includes(q));
    }

    // Sort
    result.sort((a, b) => {
      let valA = a.name.toLowerCase();
      let valB = b.name.toLowerCase();
      if (sortField === 'createdAt') {
        valA = a.createdAt;
        valB = b.createdAt;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [categories, searchTerm, sortField, sortDirection]);

  // B. Filtered Subcategories
  const filteredSubCategories = useMemo(() => {
    let result = [...subCategories];

    // Search criteria (search by category name OR sub category name)
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(sub => 
        sub.name.toLowerCase().includes(q) || 
        sub.categoryName.toLowerCase().includes(q)
      );
    }

    // Sidebar Category filters
    if (selectedCatFilter) {
      result = result.filter(sub => sub.categoryId === selectedCatFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a.name.toLowerCase();
      let valB = b.name.toLowerCase();
      if (sortField === 'category') {
        valA = a.categoryName.toLowerCase();
        valB = b.categoryName.toLowerCase();
      } else if (sortField === 'createdAt') {
        valA = a.createdAt;
        valB = b.createdAt;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [subCategories, searchTerm, selectedCatFilter, sortField, sortDirection]);

  // C. Filtered Product Types
  const filteredProductTypes = useMemo(() => {
    let result = [...productTypes];

    // Search (Category, Sub Category, Product Type, HSN)
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(pt => 
        pt.name.toLowerCase().includes(q) || 
        pt.categoryName.toLowerCase().includes(q) || 
        pt.subCategoryName.toLowerCase().includes(q) || 
        pt.hsnCode.includes(q)
      );
    }

    // Category filter
    if (selectedCatFilter) {
      result = result.filter(pt => pt.categoryId === selectedCatFilter);
    }

    // Subcategory filter
    if (selectedSubCatFilter) {
      result = result.filter(pt => pt.subCategoryId === selectedSubCatFilter);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a.name.toLowerCase();
      let valB = b.name.toLowerCase();
      if (sortField === 'category') {
        valA = a.categoryName.toLowerCase();
        valB = b.categoryName.toLowerCase();
      } else if (sortField === 'subCategory') {
        valA = a.subCategoryName.toLowerCase();
        valB = b.subCategoryName.toLowerCase();
      } else if (sortField === 'hsnCode') {
        valA = a.hsnCode;
        valB = b.hsnCode;
      } else if (sortField === 'createdAt') {
        valA = a.createdAt;
        valB = b.createdAt;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [productTypes, searchTerm, selectedCatFilter, selectedSubCatFilter, sortField, sortDirection]);


  // --- 10. PAGINATION SPLITTING ---
  const paginatedCats = useMemo(() => {
    const startIndex = (catPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, catPage]);

  const paginatedSubs = useMemo(() => {
    const startIndex = (subPage - 1) * itemsPerPage;
    return filteredSubCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubCategories, subPage]);

  const paginatedPTs = useMemo(() => {
    const startIndex = (ptPage - 1) * itemsPerPage;
    return filteredProductTypes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProductTypes, ptPage]);


  // --- 11. MODAL OPEN TRIGGERS ---
  const openAddCategory = () => {
    setCatForm({ name: '', status: 'Active' });
    setValidationErrors({});
    setCategoryModal({ isOpen: true, mode: 'add' });
  };

  const openEditCategory = (cat: CategoryItem) => {
    setCatForm({ name: cat.name, status: cat.status });
    setValidationErrors({});
    setCategoryModal({ isOpen: true, mode: 'edit', itemId: cat.id });
  };

  const openAddSubCategory = () => {
    // pre-fill category if filter is set
    setSubForm({ categoryId: selectedCatFilter || '', name: '', status: 'Active' });
    setValidationErrors({});
    setSubCategoryModal({ isOpen: true, mode: 'add' });
  };

  const openEditSubCategory = (sub: SubCategoryItem) => {
    setSubForm({ categoryId: sub.categoryId, name: sub.name, status: sub.status });
    setValidationErrors({});
    setSubCategoryModal({ isOpen: true, mode: 'edit', itemId: sub.id });
  };

  const openAddProductType = () => {
    setPtForm({ 
      categoryId: selectedCatFilter || '', 
      subCategoryId: selectedSubCatFilter || '', 
      name: '', 
      hsnCode: '', 
      status: 'Active' 
    });
    setValidationErrors({});
    setProductTypeModal({ isOpen: true, mode: 'add' });
  };

  const openEditProductType = (pt: ProductTypeItem) => {
    setPtForm({ 
      categoryId: pt.categoryId, 
      subCategoryId: pt.subCategoryId, 
      name: pt.name, 
      hsnCode: pt.hsnCode, 
      status: pt.status 
    });
    setValidationErrors({});
    setProductTypeModal({ isOpen: true, mode: 'edit', itemId: pt.id });
  };


  // --- 12. SUBMISSIONS & SAVE DISPATCH HANDLERS ---
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!catForm.name.trim()) {
      errors.name = 'Category Name is required';
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (categoryModal.mode === 'add') {
      const isDuplicate = categories.some(c => c.name.toLowerCase() === catForm.name.trim().toLowerCase());
      if (isDuplicate) {
        setValidationErrors({ name: 'A category with this name already exists' });
        return;
      }

      const newId = 'cat_' + Date.now();
      const newCat: CategoryItem = {
        id: newId,
        name: catForm.name.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        status: catForm.status
      };
      setCategories(prev => [...prev, newCat]);
    } else {
      const editId = categoryModal.itemId;
      // edit duplication check
      const isDuplicate = categories.some(c => c.id !== editId && c.name.toLowerCase() === catForm.name.trim().toLowerCase());
      if (isDuplicate) {
        setValidationErrors({ name: 'Another category already has this name' });
        return;
      }

      setCategories(prev => prev.map(c => c.id === editId ? { ...c, name: catForm.name.trim(), status: catForm.status } : c));
      // update category names in subcategories and productTypes
      setSubCategories(prev => prev.map(sub => sub.categoryId === editId ? { ...sub, categoryName: catForm.name.trim() } : sub));
      setProductTypes(prev => prev.map(pt => pt.categoryId === editId ? { ...pt, categoryName: catForm.name.trim() } : pt));
    }

    setCategoryModal({ isOpen: false, mode: 'add' });
  };

  const handleSaveSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!subForm.categoryId) {
      errors.categoryId = 'Category is required';
    }
    if (!subForm.name.trim()) {
      errors.name = 'Sub Category Name is required';
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const parentCat = categories.find(c => c.id === subForm.categoryId);
    const categoryName = parentCat ? parentCat.name : '';

    if (subCategoryModal.mode === 'add') {
      const isDuplicate = subCategories.some(s => 
        s.categoryId === subForm.categoryId && 
        s.name.toLowerCase() === subForm.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        setValidationErrors({ name: 'This subcategory already exists under the selected category' });
        return;
      }

      const newId = 'sub_' + Date.now();
      const newSub: SubCategoryItem = {
        id: newId,
        categoryId: subForm.categoryId,
        categoryName,
        name: subForm.name.trim(),
        createdAt: new Date().toISOString().split('T')[0],
        status: subForm.status
      };
      setSubCategories(prev => [...prev, newSub]);
    } else {
      const editId = subCategoryModal.itemId;
      const isDuplicate = subCategories.some(s => 
        s.id !== editId &&
        s.categoryId === subForm.categoryId && 
        s.name.toLowerCase() === subForm.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        setValidationErrors({ name: 'Another subcategory already has this name under the selected category' });
        return;
      }

      setSubCategories(prev => prev.map(s => s.id === editId ? { 
        ...s, 
        categoryId: subForm.categoryId,
        categoryName,
        name: subForm.name.trim(),
        status: subForm.status
      } : s));

      // update in product types
      setProductTypes(prev => prev.map(pt => pt.subCategoryId === editId ? { 
        ...pt, 
        categoryId: subForm.categoryId,
        categoryName,
        subCategoryName: subForm.name.trim() 
      } : pt));
    }

    setSubCategoryModal({ isOpen: false, mode: 'add' });
  };

  const handleSaveProductType = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    
    if (!ptForm.categoryId) {
      errors.categoryId = 'Category is required';
    }
    if (!ptForm.subCategoryId) {
      errors.subCategoryId = 'Sub Category is required';
    }
    if (!ptForm.name.trim()) {
      errors.name = 'Product Type Name is required';
    }
    
    // HSN Code validations
    const cleanHsn = ptForm.hsnCode.trim();
    if (!cleanHsn) {
      errors.hsnCode = 'HSN Code is required';
    } else if (!/^\d+$/.test(cleanHsn)) {
      errors.hsnCode = 'HSN Code must be numeric only';
    } else if (cleanHsn.length !== 8) {
      errors.hsnCode = 'HSN Code must be exactly 8 digits';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const parentCat = categories.find(c => c.id === ptForm.categoryId);
    const parentSub = subCategories.find(s => s.id === ptForm.subCategoryId);
    const categoryName = parentCat ? parentCat.name : '';
    const subCategoryName = parentSub ? parentSub.name : '';

    if (productTypeModal.mode === 'add') {
      const isDuplicate = productTypes.some(pt => 
        pt.subCategoryId === ptForm.subCategoryId && 
        pt.name.toLowerCase() === ptForm.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        setValidationErrors({ name: 'This product type already exists under this subcategory' });
        return;
      }

      const newId = 'pt_' + Date.now();
      const newPt: ProductTypeItem = {
        id: newId,
        categoryId: ptForm.categoryId,
        categoryName,
        subCategoryId: ptForm.subCategoryId,
        subCategoryName,
        name: ptForm.name.trim(),
        hsnCode: cleanHsn,
        createdAt: new Date().toISOString().split('T')[0],
        status: ptForm.status
      };
      setProductTypes(prev => [...prev, newPt]);
    } else {
      const editId = productTypeModal.itemId;
      const isDuplicate = productTypes.some(pt => 
        pt.id !== editId &&
        pt.subCategoryId === ptForm.subCategoryId && 
        pt.name.toLowerCase() === ptForm.name.trim().toLowerCase()
      );
      if (isDuplicate) {
        setValidationErrors({ name: 'Another product type with this name already exists under this subcategory' });
        return;
      }

      setProductTypes(prev => prev.map(pt => pt.id === editId ? { 
        ...pt, 
        categoryId: ptForm.categoryId,
        categoryName,
        subCategoryId: ptForm.subCategoryId,
        subCategoryName,
        name: ptForm.name.trim(),
        hsnCode: cleanHsn,
        status: ptForm.status
      } : pt));
    }

    setProductTypeModal({ isOpen: false, mode: 'add' });
  };


  // --- 13. CONFIRMED DELETE EXECUTOR ---
  const triggerDeleteRequest = (type: 'category' | 'subcategory' | 'producttype', id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type,
      id,
      itemName: name
    });
  };

  const executeConfirmedDelete = () => {
    if (!deleteConfirmation) return;
    const { type, id } = deleteConfirmation;

    if (type === 'category') {
      // delete category
      setCategories(prev => prev.filter(c => c.id !== id));
      // Cascade-delete / deactivate child subcategories? Or remove reference. Let's keep them and mark inactive/orphaned, or cascade.
      // cascade is generally expected so tables don't crash
      setSubCategories(prev => prev.filter(sub => sub.categoryId !== id));
      setProductTypes(prev => prev.filter(pt => pt.categoryId !== id));
    } else if (type === 'subcategory') {
      setSubCategories(prev => prev.filter(s => s.id !== id));
      setProductTypes(prev => prev.filter(pt => pt.subCategoryId !== id));
    } else if (type === 'producttype') {
      setProductTypes(prev => prev.filter(pt => pt.id !== id));
    }

    setDeleteConfirmation(null);
  };

  // Switch Active Status pill shortcut directly in row
  const toggleItemRowStatus = (type: 'category' | 'subcategory' | 'producttype', id: string, current: 'Active' | 'Inactive') => {
    const nextStatus = current === 'Active' ? 'Inactive' : 'Active';
    if (type === 'category') {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    } else if (type === 'subcategory') {
      setSubCategories(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
    } else if (type === 'producttype') {
      setProductTypes(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    }
  };


  return (
    <div className="space-y-6" id="category_management_root_workspace">
      
      {/* 1. UPPER SAAS PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5" id="categories_dashboard_header">
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 font-sans">Category Management</h1>
          <p className="text-xs text-slate-500 font-medium">Manage Categories, Sub Categories, Product Types and HSN Codes</p>
        </div>
        
        {/* Right Side Header Quick actions */}
        <div className="flex flex-wrap items-center gap-2" id="header_action_triggers">
          <button 
            id="add_category_header_btn"
            onClick={openAddCategory}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm font-bold text-xs py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Category</span>
          </button>
          
          <button 
            id="add_sub_category_header_btn"
            onClick={openAddSubCategory}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm font-bold text-xs py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Sub Category</span>
          </button>
          
          <button 
            id="add_product_type_header_btn"
            onClick={openAddProductType}
            className="bg-[#7c3aed] hover:bg-violet-700 text-white shadow-sm font-bold text-xs py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Product Type</span>
          </button>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="categories_dashboard_metrics">
        
        {/* Total Categories */}
        <div className="bg-white rounded-2xl p-4.5 border border-[#EBEFF5] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase block">Total Categories</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{stats.totalCats}</span>
            <p className="text-[10px] text-[#7c3aed] font-semibold flex items-center gap-1 mt-1">
              Active divisions live
            </p>
          </div>
          <div className="bg-violet-50 text-[#7c3aed] p-3.5 rounded-xl flex items-center justify-center">
            <Tag className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* Total Sub Categories */}
        <div className="bg-white rounded-2xl p-4.5 border border-[#EBEFF5] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase block">Total Sub Categories</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{stats.totalSubs}</span>
            <p className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-1">
              Child divisions mapped
            </p>
          </div>
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* Total Product Types */}
        <div className="bg-white rounded-2xl p-4.5 border border-[#EBEFF5] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase block">Total Product Types</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{stats.totalPTs}</span>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              Fulfillment nodes registered
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-xl flex items-center justify-center">
            <FolderPlus className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* Total HSN Codes */}
        <div className="bg-white rounded-2xl p-4.5 border border-[#EBEFF5] shadow-xs flex items-center justify-between transition-transform hover:-translate-y-0.5">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase block">Total HSN Codes</span>
            <span className="text-2xl font-black text-slate-900 leading-none">{stats.uniqueHSN}</span>
            <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 mt-1">
              Distinct custom codes
            </p>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3.5 rounded-xl flex items-center justify-center">
            <Hash className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

      </div>

      {/* 3. PRO SAAS FILTER & CONTROLS RAIL */}
      <div className="bg-white border border-[#EBEFF5] rounded-3xl p-5 shadow-xs" id="categories_filter_panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* SEARCH BOX: allow searching across matches */}
          <div className="relative flex-grow max-w-lg">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Category, Sub Category, Product Type, HSN..."
              className="w-full text-xs py-2.5 pl-10 pr-4 bg-slate-50 border border-slate-205 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all border-slate-200"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* SAAS DROPDOWN FILTERS */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wide text-slate-400 font-mono hidden sm:inline">Category:</span>
              <div className="relative">
                <select
                  value={selectedCatFilter}
                  onChange={(e) => setSelectedCatFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 rounded-xl pl-3.5 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer min-w-[150px]"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Sub Category Filter (Filtered based on Category Filter) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-450 uppercase tracking-wide text-slate-400 font-mono hidden sm:inline">Sub Category:</span>
              <div className="relative">
                <select
                  value={selectedSubCatFilter}
                  onChange={(e) => setSelectedSubCatFilter(e.target.value)}
                  disabled={!selectedCatFilter}
                  className={`appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 rounded-xl pl-3.5 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer min-w-[170px] ${!selectedCatFilter ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                >
                  <option value="">All Sub Categories</option>
                  {subCategories
                    .filter(sub => !selectedCatFilter || sub.categoryId === selectedCatFilter)
                    .map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Clear All Filters button */}
            {(selectedCatFilter || selectedSubCatFilter || searchTerm) && (
              <button 
                onClick={() => {
                  setSelectedCatFilter('');
                  setSelectedSubCatFilter('');
                  setSearchTerm('');
                }}
                className="text-xs font-extrabold text-[#7c3aed] hover:text-violet-700 hover:underline px-1 py-1"
              >
                Reset Filters
              </button>
            )}

          </div>

        </div>
      </div>

      {/* 4. MODULAR SECTIONS SWITCHER (SEGMENTED TOP BAR) */}
      <div className="bg-slate-100/70 p-1.5 rounded-2xl flex items-center max-w-md" id="table_split_switcher">
        {[
          { id: 'categories', label: 'Categories', count: filteredCategories.length },
          { id: 'subcategories', label: 'Sub Categories', count: filteredSubCategories.length },
          { id: 'producttypes', label: 'Product Types', count: filteredProductTypes.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              // Reset sorting keys defaults
              if (tab.id === 'categories') {
                setSortField('name');
              } else if (tab.id === 'subcategories') {
                setSortField('name');
              } else {
                setSortField('name');
              }
            }}
            className={`flex-grow py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 outline-none cursor-pointer ${
              activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-100' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${activeTab === tab.id ? 'bg-violet-50 text-[#7c3aed]' : 'bg-slate-200/60 text-slate-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 5. TABS CORRESPONDING ACTIVE CONTAINER TABLE */}
      <div className="bg-white border border-[#EBEFF5] rounded-3xl shadow-xs overflow-hidden" id="workspace_tables_wrapper">
        
        {/* ================= CATEGORIES MODULE ================= */}
        {activeTab === 'categories' && (
          <div className="space-y-4" id="categories_table_section">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30">
              <div className="text-left">
                <h3 className="font-sans font-extrabold text-sm text-slate-800 block uppercase">Categories Directory</h3>
                <p className="text-[11px] text-slate-400">Core catalog sectors mapped to global consumer browsing filters</p>
              </div>
              <button 
                onClick={openAddCategory}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors border border-purple-100 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            {filteredCategories.length === 0 ? (
              /* EMPTY STATE */
              <div className="py-20 text-center space-y-4" id="categories_empty_state">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
                  <Tag className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-sans font-bold text-sm text-slate-800">No categories found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">No categories match your search parameters. Try clearing your filters or create a new category.</p>
                </div>
                <button 
                  onClick={openAddCategory}
                  className="bg-[#7c3aed] text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
                >
                  Create Category
                </button>
              </div>
            ) : (
              /* DATA TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
                    <tr className="text-slate-400 uppercase font-mono font-extrabold text-[10px]">
                      <th className="py-3.5 px-6 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('name')}>
                        <span className="flex items-center gap-1.5">
                          Category Name 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'name' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-6 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('createdAt')}>
                        <span className="flex items-center gap-1.5">
                          Created Date 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'createdAt' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {paginatedCats.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900">{cat.name}</td>
                        <td className="py-3.5 px-6 text-slate-400 text-[11px] font-mono">{cat.createdAt}</td>
                        <td className="py-3.5 px-6">
                          <button 
                            type="button"
                            onClick={() => toggleItemRowStatus('category', cat.id, cat.status)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all border shrink-0 inline-flex items-center gap-1 cursor-pointer ${
                              cat.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-slate-50 text-slate-400 border-slate-205 border-slate-200'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{cat.status}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => openEditCategory(cat)}
                              className="text-slate-500 hover:text-[#7c3aed] transition-colors p-1"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => triggerDeleteRequest('category', cat.id, cat.name)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION PANEL */}
            {filteredCategories.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 font-medium">
                <span className="text-[11px] font-mono leading-none">
                  Showing <strong className="text-slate-900">{Math.min(filteredCategories.length, (catPage - 1) * itemsPerPage + 1)}</strong> to{' '}
                  <strong className="text-slate-900">{Math.min(filteredCategories.length, catPage * itemsPerPage)}</strong> of{' '}
                  <strong className="text-slate-900">{filteredCategories.length}</strong> categories
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCatPage(prev => Math.max(1, prev - 1))}
                    disabled={catPage === 1}
                    className="p-1 px-2.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-white flex items-center gap-0.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    onClick={() => setCatPage(prev => Math.min(Math.ceil(filteredCategories.length / itemsPerPage), prev + 1))}
                    disabled={catPage >= Math.ceil(filteredCategories.length / itemsPerPage)}
                    className="p-1 px-2.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-white flex items-center gap-0.5 cursor-pointer"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= SUB CATEGORIES MODULE ================= */}
        {activeTab === 'subcategories' && (
          <div className="space-y-4" id="sub_categories_table_section">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30">
              <div className="text-left">
                <h3 className="font-sans font-extrabold text-sm text-slate-800 block uppercase">Sub Categories Directory</h3>
                <p className="text-[11px] text-slate-400">Granular sub-divisions of primary category listings</p>
              </div>
              <button 
                onClick={openAddSubCategory}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors border border-purple-100 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Add Sub Category
              </button>
            </div>

            {filteredSubCategories.length === 0 ? (
              /* EMPTY STATE */
              <div className="py-20 text-center space-y-4" id="sub_categories_empty_state">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
                  <Layers className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-sans font-bold text-sm text-slate-800">No sub categories found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">No sub categories match your criteria. Try clearing search tags or create from scratch.</p>
                </div>
                <button 
                  onClick={openAddSubCategory}
                  className="bg-[#7c3aed] text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
                >
                  Create Sub Category
                </button>
              </div>
            ) : (
              /* DATA TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
                    <tr className="text-slate-400 uppercase font-mono font-extrabold text-[10px]">
                      <th className="py-3.5 px-6 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('category')}>
                        <span className="flex items-center gap-1.5">
                          Category 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'category' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-6 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('name')}>
                        <span className="flex items-center gap-1.5">
                          Sub Category 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'name' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-6 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('createdAt')}>
                        <span className="flex items-center gap-1.5">
                          Created Date 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'createdAt' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {paginatedSubs.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-3.5 px-6">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                            {sub.categoryName}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-bold text-slate-900">{sub.name}</td>
                        <td className="py-3.5 px-6 text-slate-400 text-[11px] font-mono">{sub.createdAt}</td>
                        <td className="py-3.5 px-6">
                          <button 
                            type="button"
                            onClick={() => toggleItemRowStatus('subcategory', sub.id, sub.status)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all border shrink-0 inline-flex items-center gap-1 cursor-pointer ${
                              sub.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-slate-50 text-slate-400 border-slate-205'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{sub.status}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => openEditSubCategory(sub)}
                              className="text-slate-500 hover:text-[#7c3aed] transition-colors p-1"
                              title="Edit Sub Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => triggerDeleteRequest('subcategory', sub.id, sub.name)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete Sub Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION PANEL */}
            {filteredSubCategories.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 font-medium">
                <span className="text-[11px] font-mono leading-none">
                  Showing <strong className="text-slate-900">{Math.min(filteredSubCategories.length, (subPage - 1) * itemsPerPage + 1)}</strong> to{' '}
                  <strong className="text-slate-900">{Math.min(filteredSubCategories.length, subPage * itemsPerPage)}</strong> of{' '}
                  <strong className="text-slate-900">{filteredSubCategories.length}</strong> sub categories
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSubPage(prev => Math.max(1, prev - 1))}
                    disabled={subPage === 1}
                    className="p-1 px-2.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-white flex items-center gap-0.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    onClick={() => setSubPage(prev => Math.min(Math.ceil(filteredSubCategories.length / itemsPerPage), prev + 1))}
                    disabled={subPage >= Math.ceil(filteredSubCategories.length / itemsPerPage)}
                    className="p-1 px-2.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-white flex items-center gap-0.5 cursor-pointer"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= PRODUCT TYPES MODULE ================= */}
        {activeTab === 'producttypes' && (
          <div className="space-y-4" id="product_types_table_section">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/30">
              <div className="text-left">
                <h3 className="font-sans font-extrabold text-sm text-slate-800 block uppercase">Product Types Directory</h3>
                <p className="text-[11px] text-slate-400">Detailed commercial categories matching taxonomy with valid HSN codes</p>
              </div>
              <button 
                onClick={openAddProductType}
                className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors border border-purple-100 cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product Type
              </button>
            </div>

            {filteredProductTypes.length === 0 ? (
              /* EMPTY STATE */
              <div className="py-20 text-center space-y-4" id="product_types_empty_state">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-dashed border-slate-200">
                  <Hash className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-sans font-bold text-sm text-slate-800">No product types found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">No product types match your criteria. Try adjusting filters or create a new node.</p>
                </div>
                <button 
                  onClick={openAddProductType}
                  className="bg-[#7c3aed] text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
                >
                  Create Product Type
                </button>
              </div>
            ) : (
              /* DATA TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100">
                    <tr className="text-slate-400 uppercase font-mono font-extrabold text-[10px]">
                      <th className="py-3.5 px-5 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('category')}>
                        <span className="flex items-center gap-1.5">
                          Category 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'category' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-5 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('subCategory')}>
                        <span className="flex items-center gap-1.5">
                          Sub Category 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'subCategory' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-5 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('name')}>
                        <span className="flex items-center gap-1.5">
                          Product Type 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'name' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-5 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('hsnCode')}>
                        <span className="flex items-center gap-1.5">
                          HSN Code 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'hsnCode' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-5 select-none cursor-pointer hover:text-slate-700" onClick={() => handleSort('createdAt')}>
                        <span className="flex items-center gap-1.5">
                          Created Date 
                          <ArrowUpDown className={`w-3 h-3 ${sortField === 'createdAt' ? 'text-[#7c3aed]' : 'text-slate-350'}`} />
                        </span>
                      </th>
                      <th className="py-3.5 px-5 font-bold">Status</th>
                      <th className="py-3.5 px-5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {paginatedPTs.map((pt) => (
                      <tr key={pt.id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="py-3.5 px-5">
                          <span className="bg-slate-100 text-slate-750 text-[#7c3aed] px-2 py-0.5 rounded-lg text-[10px] font-bold">
                            {pt.categoryName}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-900 font-bold">{pt.subCategoryName}</td>
                        <td className="py-3.5 px-5 text-slate-900 font-bold">{pt.name}</td>
                        <td className="py-3.5 px-5 text-slate-800 font-mono font-extrabold tracking-tight bg-slate-50/40">
                          {pt.hsnCode}
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 text-[11px] font-mono">{pt.createdAt}</td>
                        <td className="py-3.5 px-5">
                          <button 
                            type="button"
                            onClick={() => toggleItemRowStatus('producttype', pt.id, pt.status)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold transition-all border shrink-0 inline-flex items-center gap-1 cursor-pointer ${
                              pt.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : 'bg-slate-50 text-slate-400 border-slate-205'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${pt.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{pt.status}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => openEditProductType(pt)}
                              className="text-slate-500 hover:text-[#7c3aed] transition-colors p-1"
                              title="Edit Product Type"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => triggerDeleteRequest('producttype', pt.id, pt.name)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete Product Type"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* PAGINATION PANEL */}
            {filteredProductTypes.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 font-medium">
                <span className="text-[11px] font-mono leading-none">
                  Showing <strong className="text-slate-900">{Math.min(filteredProductTypes.length, (ptPage - 1) * itemsPerPage + 1)}</strong> to{' '}
                  <strong className="text-slate-900">{Math.min(filteredProductTypes.length, ptPage * itemsPerPage)}</strong> of{' '}
                  <strong className="text-slate-900">{filteredProductTypes.length}</strong> product types
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPtPage(prev => Math.max(1, prev - 1))}
                    disabled={ptPage === 1}
                    className="p-1 px-2.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-white flex items-center gap-0.5 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button
                    onClick={() => setPtPage(prev => Math.min(Math.ceil(filteredProductTypes.length / itemsPerPage), prev + 1))}
                    disabled={ptPage >= Math.ceil(filteredProductTypes.length / itemsPerPage)}
                    className="p-1 px-2.5 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-white flex items-center gap-0.5 cursor-pointer"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>


      {/* ==================== MODAL Dialog: CONFIRM DELETION ==================== */}
      {deleteConfirmation && deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]" id="confirm_deletion_modal">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-left animate-in zoom-in duration-150 space-y-4">
            
            {/* Header / Alarm icon */}
            <div className="flex items-start gap-3">
              <div className="bg-red-50 text-red-600 p-2.5 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-base font-black text-slate-900">Confirm Deletion</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900 font-extrabold">"{deleteConfirmation.itemName}"</strong>? This will permanently erase the record from catalog divisions.
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                type="button"
                onClick={executeConfirmedDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ==================== FORM DIALOG: ADD/EDIT CATEGORY ==================== */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999]" id="category_form_modal">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100/50 space-y-4 text-left animate-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-sans font-black text-sm text-slate-900 uppercase">
                {categoryModal.mode === 'add' ? 'Add New Category' : 'Edit Category Details'}
              </h3>
              <button 
                onClick={() => setCategoryModal({ isOpen: false, mode: 'add' })}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              
              {/* Category input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Category Name *</label>
                <input 
                  type="text" 
                  value={catForm.name}
                  onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Home Decor, Fashion Accessories..."
                  className={`w-full text-xs border rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 transition-all bg-slate-50/50 ${
                    validationErrors.name 
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/10' 
                      : 'border-slate-200 focus:ring-violet-500 focus:border-violet-500'
                  }`}
                  autoFocus
                />
                {validationErrors.name && (
                  <p className="text-[10px] sm:text-xs text-red-500 font-bold">{validationErrors.name}</p>
                )}
              </div>

              {/* Status toggler */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Publishing Status</label>
                <select 
                  value={catForm.status}
                  onChange={(e) => setCatForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-slate-50/50"
                >
                  <option value="Active">Active (Publish live immediately)</option>
                  <option value="Inactive">Inactive (Draft/Hidden)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button 
                  type="button"
                  onClick={() => setCategoryModal({ isOpen: false, mode: 'add' })}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* ==================== FORM DIALOG: ADD/EDIT SUB CATEGORY ==================== */}
      {subCategoryModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999]" id="subcategory_form_modal">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100/50 space-y-4 text-left animate-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-sans font-black text-sm text-slate-900 uppercase">
                {subCategoryModal.mode === 'add' ? 'Add New Sub Category' : 'Edit Sub Category Details'}
              </h3>
              <button 
                onClick={() => setSubCategoryModal({ isOpen: false, mode: 'add' })}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubCategory} className="space-y-4">
              
              {/* Category Select Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Primary Category *</label>
                <select 
                  value={subForm.categoryId}
                  onChange={(e) => setSubForm(prev => ({ ...prev, categoryId: e.target.value }))}
                  className={`w-full text-xs border rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 transition-all bg-white ${
                    validationErrors.categoryId 
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/10' 
                      : 'border-slate-200 focus:ring-violet-500 focus:border-violet-500'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {validationErrors.categoryId && (
                  <p className="text-[10px] sm:text-xs text-red-500 font-bold">{validationErrors.categoryId}</p>
                )}
              </div>

              {/* Subcategory name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Sub Category Name *</label>
                <input 
                  type="text" 
                  value={subForm.name}
                  onChange={(e) => setSubForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Jeans, Smart Watch, Face Creams..."
                  className={`w-full text-xs border rounded-xl py-2.5 px-3.5 focus:outline-none focus:ring-1 transition-all bg-slate-50/50 ${
                    validationErrors.name 
                      ? 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50/10' 
                      : 'border-slate-200 focus:ring-violet-500 focus:border-violet-500'
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-[10px] sm:text-xs text-red-500 font-bold">{validationErrors.name}</p>
                )}
              </div>

              {/* Status selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Publishing Status</label>
                <select 
                  value={subForm.status}
                  onChange={(e) => setSubForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full text-xs border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-slate-50/50"
                >
                  <option value="Active">Active (Publish live immediately)</option>
                  <option value="Inactive">Inactive (Draft/Hidden)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button 
                  type="button"
                  onClick={() => setSubCategoryModal({ isOpen: false, mode: 'add' })}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* ==================== FORM DIALOG: ADD/EDIT PRODUCT TYPE ==================== */}
      {productTypeModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[999]" id="producttype_form_modal">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100/50 space-y-4 text-left animate-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-sans font-black text-sm text-slate-900 uppercase">
                {productTypeModal.mode === 'add' ? 'Add New Product Type' : 'Edit Product Type'}
              </h3>
              <button 
                onClick={() => setProductTypeModal({ isOpen: false, mode: 'add' })}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductType} className="space-y-3.5">
              
              {/* Category Select dropdown */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Category *</label>
                <select 
                  value={ptForm.categoryId}
                  onChange={(e) => setPtForm(prev => ({ ...prev, categoryId: e.target.value, subCategoryId: '' }))}
                  className={`w-full text-xs border rounded-xl py-2 px-3 focus:outline-none focus:ring-1 transition-all bg-white ${
                    validationErrors.categoryId 
                      ? 'border-red-400 focus:ring-red-500 bg-red-50/10' 
                      : 'border-slate-200 focus:ring-violet-500'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {validationErrors.categoryId && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.categoryId}</p>
                )}
              </div>

              {/* Subcategory Select dropdown (Filtered based on Category selection!) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Sub Category *</label>
                <select 
                  value={ptForm.subCategoryId}
                  onChange={(e) => setPtForm(prev => ({ ...prev, subCategoryId: e.target.value }))}
                  disabled={!ptForm.categoryId}
                  className={`w-full text-xs border rounded-xl py-2 px-3 focus:outline-none focus:ring-1 transition-all bg-white ${
                    validationErrors.subCategoryId 
                      ? 'border-red-400 focus:ring-red-500 bg-red-50/10' 
                      : 'border-slate-200 focus:ring-violet-500'
                  } ${!ptForm.categoryId ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''}`}
                >
                  <option value="">Select Sub Category</option>
                  {ptFormSubCategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                {validationErrors.subCategoryId && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.subCategoryId}</p>
                )}
              </div>

              {/* Product Type Name Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Product Type Name *</label>
                <input 
                  type="text" 
                  value={ptForm.name}
                  onChange={(e) => setPtForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Smartphones, Sneakers..."
                  className={`w-full text-xs border rounded-xl py-2 px-3 focus:outline-none focus:ring-1 transition-all bg-slate-50/50 ${
                    validationErrors.name 
                      ? 'border-red-400 focus:ring-red-500 bg-red-50/10' 
                      : 'border-slate-200 focus:ring-violet-500'
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-[10px] text-red-505 text-red-500 font-bold">{validationErrors.name}</p>
                )}
              </div>

              {/* HSN CODE Input (numeric only, exactly 8 digits) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">HSN Code (8 digits) *</label>
                  <span className="text-[10px] text-slate-400 font-mono">e.g. 12345678</span>
                </div>
                <input 
                  type="text" 
                  maxLength={8}
                  value={ptForm.hsnCode}
                  onChange={(e) => {
                    // restrict keyboard inputs to numbers only
                    const val = e.target.value.replace(/\D/g, '');
                    setPtForm(prev => ({ ...prev, hsnCode: val }));
                  }}
                  placeholder="85171200"
                  className={`w-full text-xs font-mono font-bold border rounded-xl py-2 px-3 focus:outline-none focus:ring-1 transition-all bg-slate-50/50 ${
                    validationErrors.hsnCode 
                      ? 'border-red-400 focus:ring-red-500 bg-red-50/10' 
                      : 'border-slate-200 focus:ring-violet-500'
                  }`}
                />
                {validationErrors.hsnCode && (
                  <p className="text-[10px] text-red-500 font-bold">{validationErrors.hsnCode}</p>
                )}
              </div>

              {/* Status input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide">Publishing Status</label>
                <select 
                  value={ptForm.status}
                  onChange={(e) => setPtForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full text-xs border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-violet-500 bg-slate-50/50 hover:bg-slate-100/50 cursor-pointer"
                >
                  <option value="Active">Active (Publish live immediately)</option>
                  <option value="Inactive">Inactive (Draft/Hidden)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setProductTypeModal({ isOpen: false, mode: 'add' })}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
