'use client';

import { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  X,
  Loader2,
  PackagePlus,
  RefreshCw,
  Edit2,
  AlertTriangle,
  Check,
  UploadCloud,
  Trash2,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { uploadImageToImageKit } from '@/lib/upload';
import { formatPrice } from '@/lib/format';

const PRODUCT_TYPES = ['motorcycle', 'scooter', 'accessory', 'part'] as const;

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Stock adjustment modal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [stockChange, setStockChange] = useState<number>(5);
  const [adjustmentReason, setAdjustmentReason] = useState('Factory shipment received');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustMsg, setAdjustMsg] = useState<string | null>(null);

  // Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form fields for Add
  const [form, setForm] = useState({
    name: '',
    sku: '',
    slug: '',
    description: '',
    shortDescription: '',
    productType: 'motorcycle' as typeof PRODUCT_TYPES[number],
    brand: 'Crown Motors',
    basePrice: '',
    currency: 'PKR',
    inventory: '10',
    category: '',
    images: '',
    isFeatured: false,
    isActive: true,
    specifications: '',
  });

  // Edit Product Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [editUploadingImages, setEditUploadingImages] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    sku: '',
    slug: '',
    description: '',
    shortDescription: '',
    productType: 'motorcycle' as typeof PRODUCT_TYPES[number],
    brand: 'Crown Motors',
    basePrice: '',
    currency: 'PKR',
    inventory: '10',
    category: '',
    images: '',
    isFeatured: false,
    isActive: true,
    specifications: '',
  });

  // Delete Product Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const setField = (k: keyof typeof form, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const setEditField = (k: keyof typeof editForm, v: any) =>
    setEditForm((prev) => ({ ...prev, [k]: v }));

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadImageToImageKit(files[i], '/evee-products');
        uploadedUrls.push(res.url);
      }
      setForm((prev) => {
        const current = prev.images.trim() ? prev.images.split('\n').filter(Boolean) : [];
        return {
          ...prev,
          images: [...current, ...uploadedUrls].join('\n'),
        };
      });
    } catch (err: any) {
      alert('Image upload failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleEditProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setEditUploadingImages(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadImageToImageKit(files[i], '/evee-products');
        uploadedUrls.push(res.url);
      }
      setEditForm((prev) => {
        const current = prev.images.trim() ? prev.images.split('\n').filter(Boolean) : [];
        return {
          ...prev,
          images: [...current, ...uploadedUrls].join('\n'),
        };
      });
    } catch (err: any) {
      alert('Image upload failed: ' + (err.message || 'Error'));
    } finally {
      setEditUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setForm((prev) => {
      const list = prev.images.split('\n').filter(Boolean);
      list.splice(indexToRemove, 1);
      return { ...prev, images: list.join('\n') };
    });
  };

  const handleRemoveEditImage = (indexToRemove: number) => {
    setEditForm((prev) => {
      const list = prev.images.split('\n').filter(Boolean);
      list.splice(indexToRemove, 1);
      return { ...prev, images: list.join('\n') };
    });
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await adminApi<any>('products', {
        query: { limit: 100, includeInactive: true },
      });
      if (data?.products) setProducts(data.products);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminApi<any>('categories');
      if (data?.categories) setCategories(data.categories);
      else if (Array.isArray(data)) setCategories(data);
    } catch {
      // categories optional
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = products.filter((p) => {
    const s = search.toLowerCase();
    return (
      !search ||
      p.name?.toLowerCase().includes(s) ||
      p.sku?.toLowerCase().includes(s) ||
      p.slug?.toLowerCase().includes(s) ||
      p.productType?.toLowerCase().includes(s)
    );
  });

  // ── Adjust Stock ──────────────────────────────────────────────────────────
  const handleAdjustStock = async () => {
    if (!selectedProduct) return;
    setAdjusting(true);
    setAdjustMsg(null);
    try {
      await adminApi('admin/inventory/adjust', {
        method: 'POST',
        body: {
          productId: selectedProduct._id,
          change: Number(stockChange),
          reason: adjustmentReason,
        },
      });
      setProducts((prev) =>
        prev.map((p) =>
          p._id === selectedProduct._id
            ? { ...p, inventory: p.inventory + Number(stockChange) }
            : p
        )
      );
      setAdjustMsg('✓ Inventory adjusted successfully.');
    } catch (err: any) {
      setAdjustMsg('✗ ' + (err.message || 'Failed to adjust inventory'));
    } finally {
      setAdjusting(false);
    }
  };

  // ── Create Product ────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({
      name: '',
      sku: '',
      slug: '',
      description: '',
      shortDescription: '',
      productType: 'motorcycle',
      brand: 'Crown Motors',
      basePrice: '',
      currency: 'PKR',
      inventory: '10',
      category: '',
      images: '',
      isFeatured: false,
      isActive: true,
      specifications: '',
    });
    setCreateError(null);
    setCreateSuccess(false);
  };

  const handleCreateProduct = async () => {
    setCreateError(null);
    if (!form.name.trim()) return setCreateError('Product name is required.');
    if (!form.sku.trim()) return setCreateError('SKU is required.');
    if (!form.description.trim() || form.description.trim().length < 10)
      return setCreateError('Description must be at least 10 characters.');
    if (!form.basePrice || isNaN(Number(form.basePrice)))
      return setCreateError('Valid price is required (in PKR).');

    const priceInSubunits = Math.round(Number(form.basePrice) * 100);
    const imageList = form.images
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const specLines = form.specifications
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const specifications = specLines.map((line, i) => {
      const [key, ...rest] = line.split(':');
      return {
        key: slugify(key?.trim() || `spec-${i}`),
        label: key?.trim() || `Spec ${i + 1}`,
        value: rest.join(':').trim() || line,
        group: 'General',
      };
    });

    const body: any = {
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      slug: form.slug.trim() || slugify(form.name.trim()),
      description: form.description.trim(),
      shortDescription: form.shortDescription.trim() || undefined,
      productType: form.productType,
      brand: form.brand.trim() || 'Crown Motors',
      basePrice: priceInSubunits,
      currency: form.currency,
      inventory: parseInt(form.inventory) || 0,
      images: imageList,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      specifications,
    };

    if (form.category) body.category = form.category;

    setCreating(true);
    try {
      const result = await adminApi<any>('products', {
        method: 'POST',
        body,
      });
      if (result?.product) {
        setProducts((prev) => [result.product, ...prev]);
      }
      setCreateSuccess(true);
      setTimeout(() => {
        setShowAddModal(false);
        resetForm();
      }, 1200);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create product');
    } finally {
      setCreating(false);
    }
  };

  // ── Open Edit Product Modal ───────────────────────────────────────────────
  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setUpdateError(null);
    setUpdateSuccess(false);

    let specsStr = '';
    if (Array.isArray(p.specifications)) {
      specsStr = p.specifications
        .map((s: any) => `${s.label || s.key}: ${s.value}${s.unit ? ' ' + s.unit : ''}`)
        .join('\n');
    } else if (p.specifications && typeof p.specifications === 'object') {
      specsStr = Object.entries(p.specifications)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
    }

    const imgStr = Array.isArray(p.images) ? p.images.join('\n') : '';

    setEditForm({
      name: p.name || '',
      sku: p.sku || '',
      slug: p.slug || '',
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      productType: p.productType || 'motorcycle',
      brand: p.brand || 'Crown Motors',
      basePrice: p.basePrice !== undefined ? String(p.basePrice / 100) : '',
      currency: p.currency || 'PKR',
      inventory: p.inventory !== undefined ? String(p.inventory) : '0',
      category: typeof p.category === 'object' ? p.category?._id : (p.category || ''),
      images: imgStr,
      isFeatured: !!p.isFeatured,
      isActive: p.isActive !== false,
      specifications: specsStr,
    });

    setShowEditModal(true);
  };

  // ── Save Edited Product ───────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    setUpdateError(null);

    if (!editForm.name.trim()) return setUpdateError('Product name is required.');
    if (!editForm.sku.trim()) return setUpdateError('SKU is required.');
    if (!editForm.description.trim() || editForm.description.trim().length < 10)
      return setUpdateError('Description must be at least 10 characters.');
    if (!editForm.basePrice || isNaN(Number(editForm.basePrice)))
      return setUpdateError('Valid price is required (in PKR).');

    const priceInSubunits = Math.round(Number(editForm.basePrice) * 100);
    const imageList = editForm.images
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    const specLines = editForm.specifications
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const specifications = specLines.map((line, i) => {
      const [key, ...rest] = line.split(':');
      return {
        key: slugify(key?.trim() || `spec-${i}`),
        label: key?.trim() || `Spec ${i + 1}`,
        value: rest.join(':').trim() || line,
        group: 'General',
      };
    });

    const body: any = {
      name: editForm.name.trim(),
      sku: editForm.sku.trim().toUpperCase(),
      slug: editForm.slug.trim() || slugify(editForm.name.trim()),
      description: editForm.description.trim(),
      shortDescription: editForm.shortDescription.trim() || undefined,
      productType: editForm.productType,
      brand: editForm.brand.trim() || 'Crown Motors',
      basePrice: priceInSubunits,
      currency: editForm.currency,
      inventory: parseInt(editForm.inventory) || 0,
      images: imageList,
      isFeatured: editForm.isFeatured,
      isActive: editForm.isActive,
      specifications,
    };

    if (editForm.category) body.category = editForm.category;

    setUpdating(true);
    try {
      const result = await adminApi<any>(`products/${editingProduct._id}`, {
        method: 'PATCH',
        body,
      });

      const updated = result?.product || { ...editingProduct, ...body };
      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? updated : p))
      );
      setUpdateSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setEditingProduct(null);
      }, 1000);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update product');
    } finally {
      setUpdating(false);
    }
  };

  // ── Open Delete Modal ─────────────────────────────────────────────────────
  const handleOpenDelete = (p: any) => {
    setDeletingProduct(p);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  // ── Confirm Delete Product ────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await adminApi(`products/${deletingProduct._id}`, {
        method: 'DELETE',
      });

      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));
      setShowDeleteModal(false);
      setDeletingProduct(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete product from database');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-fg tracking-tight">
            Product Catalog & Fleet Management
          </h1>
          <p className="text-[13px] text-muted">
            Add, edit, update specs, adjust stock, and delete electric motorcycles, scooters, accessories, and spare parts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            className="px-4 py-2 bg-surface border border-line rounded text-[12px] font-mono text-muted hover:text-fg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-lime text-night rounded text-[12px] font-semibold hover:bg-[#e0f48f] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="size-4" /> Add New Vehicle / Product
          </button>
        </div>
      </div>

      {/* Search Bar & Total Counter */}
      <div className="bg-night border border-line p-4 rounded-lg flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by vehicle name, SKU, type…"
            className="w-full bg-surface border border-line px-3.5 py-2 pl-9 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-dim pointer-events-none" />
        </div>
        <span className="font-mono text-[11px] text-muted">
          {filteredProducts.length} / {products.length} catalog items
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-night border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted font-mono text-[13px] flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-lime" />
            <span>Loading catalog from database…</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted font-mono text-[13px]">
            No products found in catalog. Click &ldquo;Add New Vehicle / Product&rdquo; above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface/50 border-b border-line font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-3 px-5">Product / Vehicle</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">SKU</th>
                  <th className="py-3 px-5">Price</th>
                  <th className="py-3 px-5">Available Stock</th>
                  <th className="py-3 px-5">Reserved</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-5 flex items-center gap-3">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="size-11 object-cover rounded bg-surface border border-line shrink-0"
                        />
                      ) : (
                        <div className="size-11 rounded bg-surface border border-line flex items-center justify-center text-dim text-[10px] font-mono shrink-0">
                          IMG
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-fg">{p.name}</p>
                          {p.isFeatured && (
                            <span className="text-[9px] font-mono uppercase bg-lime/10 text-lime px-1.5 py-0.5 rounded border border-lime/30">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-dim">{p.brand || 'Crown Motors'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-muted capitalize">
                      {p.productType}
                    </td>
                    <td className="py-4 px-5 font-mono text-[12px] text-muted">{p.sku}</td>
                    <td className="py-4 px-5 font-mono font-bold text-fg">
                      {formatPrice(p.basePrice / 100, p.currency || 'PKR')}
                    </td>
                    <td className="py-4 px-5 font-mono">
                      <span className={`font-bold ${p.inventory <= 5 ? 'text-rose-400' : 'text-lime'}`}>
                        {p.inventory} units
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-dim">{p.reservedInventory || 0}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          p.isActive
                            ? 'bg-lime/10 text-lime border border-lime/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Adjust Stock */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p);
                            setStockChange(5);
                            setAdjustMsg(null);
                          }}
                          className="px-2.5 py-1.5 bg-surface hover:bg-surfaceHover border border-line rounded text-lime font-mono text-[11px] transition-colors"
                          title="Adjust Inventory Stock"
                        >
                          Stock
                        </button>

                        {/* Edit Product */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1.5 bg-surface hover:bg-surfaceHover border border-line rounded text-fg hover:text-lime transition-colors flex items-center gap-1.5 text-[11px] font-mono"
                          title="Edit vehicle details, price, images, specs"
                        >
                          <Edit2 className="size-3" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Product */}
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(p)}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 text-[11px] font-mono"
                          title="Delete product permanently from catalog"
                        >
                          <Trash2 className="size-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Adjust Stock Modal ─────────────────────────────────────── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[460px] bg-night border border-line rounded-xl shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="font-mono text-[11px] text-lime uppercase">Inventory Adjustment</span>
                <h3 className="font-bold text-[18px] text-fg">{selectedProduct.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="size-7 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="bg-surface/50 border border-line p-3 rounded text-[13px] font-mono text-muted flex justify-between">
              <span>Current Stock:</span>
              <span className="text-lime font-bold">{selectedProduct.inventory} units</span>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                  Change Amount (+ to add, − to remove)
                </label>
                <input
                  type="number"
                  value={stockChange}
                  onChange={(e) => setStockChange(Number(e.target.value))}
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded font-mono text-[14px] text-lime focus:outline-none focus:border-lime"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                  Reason
                </label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="e.g. Factory shipment, Showroom allocation"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                />
              </div>
            </div>

            {adjustMsg && (
              <p className={`text-[12px] font-mono ${adjustMsg.startsWith('✓') ? 'text-lime' : 'text-rose-400'}`}>
                {adjustMsg}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 border border-line text-muted rounded text-[12px] hover:text-fg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdjustStock}
                disabled={adjusting}
                className="px-5 py-2 bg-lime text-night font-semibold rounded text-[12px] hover:bg-[#e0f48f] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {adjusting && <Loader2 className="size-3.5 animate-spin" />}
                <span>Confirm Adjustment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Product Modal ─────────────────────────────────────── */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[760px] max-h-[92vh] bg-night border border-line rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-line flex items-center justify-between bg-surface/40 flex-shrink-0">
              <div>
                <span className="font-mono text-[11px] text-lime uppercase">Admin — Edit Catalog Item</span>
                <h2 className="text-[20px] font-bold text-fg">Edit {editingProduct.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="size-8 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5 text-[13px]">
              {updateSuccess && (
                <div className="flex items-center gap-2 bg-lime/10 border border-lime/30 p-3 rounded text-lime font-mono text-[12px]">
                  <Check className="size-4" /> Product updated successfully! Changes reflected immediately.
                </div>
              )}
              {updateError && (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 p-3 rounded text-rose-300 text-[12px]">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" /> {updateError}
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditField('name', e.target.value)}
                    placeholder="e.g. EVee Pro 125"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Product Type
                  </label>
                  <select
                    value={editForm.productType}
                    onChange={(e) => setEditField('productType', e.target.value as any)}
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg capitalize focus:outline-none focus:border-lime"
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">SKU *</label>
                  <input
                    type="text"
                    value={editForm.sku}
                    onChange={(e) => setEditField('sku', e.target.value)}
                    placeholder="EVE-M125-PRO"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono uppercase focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">Slug</label>
                  <input
                    type="text"
                    value={editForm.slug}
                    onChange={(e) => setEditField('slug', e.target.value)}
                    placeholder="evee-pro-125"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditField('category', e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg focus:outline-none focus:border-lime"
                  >
                    <option value="">Default (Auto-matched)</option>
                    {categories.map((c: any) => (
                      <option key={c._id || c.slug} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-line pt-4">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Price ({editForm.currency}) *
                  </label>
                  <input
                    type="number"
                    value={editForm.basePrice}
                    onChange={(e) => setEditField('basePrice', e.target.value)}
                    placeholder="285000"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono font-bold text-lime focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">Currency</label>
                  <input
                    type="text"
                    value={editForm.currency}
                    onChange={(e) => setEditField('currency', e.target.value.toUpperCase())}
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono uppercase focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    value={editForm.inventory}
                    onChange={(e) => setEditField('inventory', e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono focus:outline-none focus:border-lime"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="border-t border-line pt-4 flex flex-col gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Short Tagline / Summary
                  </label>
                  <input
                    type="text"
                    value={editForm.shortDescription}
                    onChange={(e) => setEditField('shortDescription', e.target.value)}
                    placeholder="e.g. Flagship electric street motorcycle with 120km range"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Full Description *
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditField('description', e.target.value)}
                    placeholder="Detailed technical overview and features…"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg focus:outline-none focus:border-lime"
                  />
                </div>
              </div>

              {/* Media & Images */}
              <div className="border-t border-line pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] text-muted uppercase">
                    Vehicle Images (ImageKit CDN / URLs)
                  </label>
                  <label className="cursor-pointer px-3 py-1 bg-surface hover:bg-surfaceHover border border-line rounded text-[11px] font-mono text-lime flex items-center gap-1.5 transition-colors">
                    {editUploadingImages ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="size-3.5" />
                    )}
                    <span>{editUploadingImages ? 'Uploading…' : 'Upload Images'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleEditProductImageUpload}
                      disabled={editUploadingImages}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Previews */}
                {editForm.images.trim() && (
                  <div className="flex flex-wrap gap-2.5 p-3 bg-surface/30 border border-line rounded">
                    {editForm.images
                      .split('\n')
                      .filter(Boolean)
                      .map((url, idx) => (
                        <div key={idx} className="relative group size-16 rounded overflow-hidden border border-line bg-surface">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Preview ${idx + 1}`} className="size-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveEditImage(idx)}
                            className="absolute top-1 right-1 size-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                <textarea
                  rows={2}
                  value={editForm.images}
                  onChange={(e) => setEditField('images', e.target.value)}
                  placeholder="Paste direct image URLs (one per line) or use the upload button above"
                  className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono text-[12px] focus:outline-none focus:border-lime"
                />
              </div>

              {/* Specifications */}
              <div className="border-t border-line pt-4">
                <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                  Specifications (One per line: &ldquo;Label: Value&rdquo;)
                </label>
                <textarea
                  rows={3}
                  value={editForm.specifications}
                  onChange={(e) => setEditField('specifications', e.target.value)}
                  placeholder="Battery Capacity: 72V 45Ah&#10;Claimed Range: 120 km&#10;Motor Power: 3000 W&#10;Top Speed: 85 km/h"
                  className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono text-[12px] focus:outline-none focus:border-lime"
                />
              </div>

              {/* Flags */}
              <div className="border-t border-line pt-4 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isFeatured}
                    onChange={(e) => setEditField('isFeatured', e.target.checked)}
                    className="accent-lime size-4"
                  />
                  <span className="font-mono text-[12px] text-fg">Featured on Storefront Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditField('isActive', e.target.checked)}
                    className="accent-lime size-4"
                  />
                  <span className="font-mono text-[12px] text-fg">Active (Visible in Customer Catalog)</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-line p-5 bg-surface/30 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                }}
                className="px-5 py-2 border border-line text-muted rounded text-[12px] hover:text-fg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={updating || updateSuccess}
                className="px-6 py-2 bg-lime text-night font-semibold rounded text-[12px] hover:bg-[#e0f48f] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Saving Changes…
                  </>
                ) : updateSuccess ? (
                  <>
                    <Check className="size-3.5" /> Updated!
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────── */}
      {showDeleteModal && deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] bg-night border border-rose-500/40 rounded-xl shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="size-6" />
              </div>
              <div className="flex-1">
                <span className="font-mono text-[11px] text-rose-400 uppercase tracking-wider font-semibold">
                  Confirm Deletion
                </span>
                <h3 className="text-[18px] font-bold text-fg mt-0.5">
                  Delete &ldquo;{deletingProduct.name}&rdquo;?
                </h3>
                <p className="text-[13px] text-muted mt-1 leading-relaxed">
                  This action will permanently delete this product from MongoDB. It will be removed immediately from both the admin dashboard and customer storefront.
                </p>
              </div>
            </div>

            {/* Vehicle preview mini-card */}
            <div className="bg-surface/50 border border-line p-3.5 rounded flex items-center gap-3">
              {deletingProduct.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={deletingProduct.images[0]}
                  alt={deletingProduct.name}
                  className="size-12 object-cover rounded bg-surface border border-line shrink-0"
                />
              ) : (
                <div className="size-12 rounded bg-surface border border-line flex items-center justify-center text-dim text-[10px] font-mono shrink-0">
                  IMG
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-fg truncate text-[14px]">{deletingProduct.name}</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-muted mt-0.5">
                  <span>SKU: {deletingProduct.sku}</span>
                  <span>•</span>
                  <span className="text-lime font-bold">
                    {formatPrice(deletingProduct.basePrice / 100, deletingProduct.currency || 'PKR')}
                  </span>
                </div>
              </div>
            </div>

            {deleteError && (
              <p className="text-[12px] font-mono text-rose-400 bg-rose-500/10 p-2.5 rounded border border-rose-500/20">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingProduct(null);
                }}
                disabled={deleting}
                className="px-4 py-2 border border-line text-muted rounded text-[12px] hover:text-fg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded text-[12px] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {deleting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Deleting from Database…
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" /> Permanently Delete Vehicle
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add New Product Modal ──────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[720px] max-h-[90vh] bg-night border border-line rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-line flex items-center justify-between bg-surface/40 flex-shrink-0">
              <div>
                <span className="font-mono text-[11px] text-lime uppercase">Admin — New Listing</span>
                <h2 className="text-[20px] font-bold text-fg">Add Product / Vehicle / Equipment</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="size-8 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5 text-[13px]">
              {createSuccess && (
                <div className="flex items-center gap-2 bg-lime/10 border border-lime/30 p-3 rounded text-lime font-mono text-[12px]">
                  <Check className="size-4" /> Product created successfully!
                </div>
              )}
              {createError && (
                <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 p-3 rounded text-rose-300 text-[12px]">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5" /> {createError}
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setField('name', e.target.value);
                      if (!form.slug) setField('slug', slugify(e.target.value));
                    }}
                    placeholder="e.g. EVee Pro 125"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Product Type
                  </label>
                  <select
                    value={form.productType}
                    onChange={(e) => setField('productType', e.target.value as any)}
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg capitalize focus:outline-none focus:border-lime"
                  >
                    {PRODUCT_TYPES.map((t) => (
                      <option key={t} value={t} className="capitalize">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">SKU *</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => setField('sku', e.target.value)}
                    placeholder="EVE-M125-PRO"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono uppercase focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setField('slug', e.target.value)}
                    placeholder="evee-pro-125"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg focus:outline-none focus:border-lime"
                  >
                    <option value="">Default (Auto-match)</option>
                    {categories.map((c: any) => (
                      <option key={c._id || c.slug} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-line pt-4">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Price ({form.currency}) *
                  </label>
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) => setField('basePrice', e.target.value)}
                    placeholder="285000"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono font-bold text-lime focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">Currency</label>
                  <input
                    type="text"
                    value={form.currency}
                    onChange={(e) => setField('currency', e.target.value.toUpperCase())}
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono uppercase focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    value={form.inventory}
                    onChange={(e) => setField('inventory', e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono focus:outline-none focus:border-lime"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="border-t border-line pt-4 flex flex-col gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Short Tagline / Summary
                  </label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => setField('shortDescription', e.target.value)}
                    placeholder="e.g. Flagship electric street motorcycle with 120km range"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                    Full Description *
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Detailed technical overview and features…"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg focus:outline-none focus:border-lime"
                  />
                </div>
              </div>

              {/* Media & Images */}
              <div className="border-t border-line pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] text-muted uppercase">
                    Product Images (ImageKit CDN / URLs)
                  </label>
                  <label className="cursor-pointer px-3 py-1 bg-surface hover:bg-surfaceHover border border-line rounded text-[11px] font-mono text-lime flex items-center gap-1.5 transition-colors">
                    {uploadingImages ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="size-3.5" />
                    )}
                    <span>{uploadingImages ? 'Uploading…' : 'Upload Images'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={uploadingImages}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Previews */}
                {form.images.trim() && (
                  <div className="flex flex-wrap gap-2.5 p-3 bg-surface/30 border border-line rounded">
                    {form.images
                      .split('\n')
                      .filter(Boolean)
                      .map((url, idx) => (
                        <div key={idx} className="relative group size-16 rounded overflow-hidden border border-line bg-surface">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Preview ${idx + 1}`} className="size-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 size-5 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                <textarea
                  rows={2}
                  value={form.images}
                  onChange={(e) => setField('images', e.target.value)}
                  placeholder="Paste direct image URLs (one per line) or use the upload button above"
                  className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono text-[12px] focus:outline-none focus:border-lime"
                />
              </div>

              {/* Specifications */}
              <div className="border-t border-line pt-4">
                <label className="block font-mono text-[11px] text-muted uppercase mb-1">
                  Specifications (One per line: &ldquo;Label: Value&rdquo;)
                </label>
                <textarea
                  rows={3}
                  value={form.specifications}
                  onChange={(e) => setField('specifications', e.target.value)}
                  placeholder="Battery Capacity: 72V 45Ah&#10;Claimed Range: 120 km&#10;Motor Power: 3000 W&#10;Top Speed: 85 km/h"
                  className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg font-mono text-[12px] focus:outline-none focus:border-lime"
                />
              </div>

              {/* Flags */}
              <div className="border-t border-line pt-4 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setField('isFeatured', e.target.checked)}
                    className="accent-lime size-4"
                  />
                  <span className="font-mono text-[12px] text-muted">Featured product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField('isActive', e.target.checked)}
                    className="accent-lime size-4"
                  />
                  <span className="font-mono text-[12px] text-muted">Active (visible to customers)</span>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-line p-5 bg-surface/30 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-5 py-2 border border-line text-muted rounded text-[12px] hover:text-fg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateProduct}
                disabled={creating || createSuccess}
                className="px-6 py-2 bg-lime text-night font-semibold rounded text-[12px] hover:bg-[#e0f48f] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Creating…
                  </>
                ) : createSuccess ? (
                  <>
                    <Check className="size-3.5" /> Created!
                  </>
                ) : (
                  <>
                    <PackagePlus className="size-3.5" /> Create Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
