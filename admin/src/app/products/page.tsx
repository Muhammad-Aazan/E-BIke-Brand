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

  // Form fields
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

  const setField = (k: keyof typeof form, v: any) =>
    setForm((prev) => ({ ...prev, [k]: v }));

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

  const handleRemoveImage = (indexToRemove: number) => {
    setForm((prev) => {
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
      name: '', sku: '', slug: '', description: '', shortDescription: '',
      productType: 'motorcycle', brand: 'Crown Motors', basePrice: '',
      currency: 'PKR', inventory: '10', category: '', images: '',
      isFeatured: false, isActive: true, specifications: '',
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
      return setCreateError('Valid price is required (in PKR/USD).');

    const priceInSubunits = Math.round(Number(form.basePrice) * 100);
    const imageList = form.images
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean);

    // Parse simple specs like "Motor: 3000W\nRange: 80km"
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

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-fg tracking-tight">
            Product Catalog & Inventory
          </h1>
          <p className="text-[13px] text-muted">
            Manage bikes, accessories, helmets, chargers, covers, and spare parts.
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
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-4 py-2 bg-lime text-night rounded text-[12px] font-semibold hover:bg-[#e0f48f] transition-colors flex items-center gap-1.5"
          >
            <Plus className="size-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-night border border-line p-4 rounded-lg flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, type…"
            className="w-full bg-surface border border-line px-3.5 py-2 pl-9 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-dim pointer-events-none" />
        </div>
        <span className="font-mono text-[11px] text-muted">
          {filteredProducts.length} / {products.length} products
        </span>
      </div>

      {/* Table */}
      <div className="bg-night border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted font-mono text-[13px] flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-lime" />
            <span>Loading catalog…</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-muted font-mono text-[13px]">
            No products found. Add your first product above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface/50 border-b border-line font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-3 px-5">Product</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">SKU</th>
                  <th className="py-3 px-5">Price</th>
                  <th className="py-3 px-5">Stock</th>
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
                          className="size-10 object-cover rounded bg-surface border border-line"
                        />
                      ) : (
                        <div className="size-10 rounded bg-surface border border-line flex items-center justify-center text-dim text-[10px] font-mono">
                          IMG
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-fg">{p.name}</p>
                        <p className="font-mono text-[11px] text-dim">{p.brand || 'Crown Motors'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-muted capitalize">{p.productType}</td>
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
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        p.isActive
                          ? 'bg-lime/10 text-lime border border-lime/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        {p.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => { setSelectedProduct(p); setStockChange(5); setAdjustMsg(null); }}
                        className="px-3 py-1.5 bg-surface hover:bg-surfaceHover border border-line rounded text-lime font-mono text-[11px] transition-colors"
                      >
                        Adjust Stock
                      </button>
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
                onClick={() => { setShowAddModal(false); resetForm(); }}
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

              {/* Row 1: Name + Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Product Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => {
                      setField('name', e.target.value);
                      setField('slug', slugify(e.target.value));
                    }}
                    placeholder="e.g. EVee Sovereign R 2026"
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Product Type *</label>
                  <select
                    value={form.productType}
                    onChange={(e) => setField('productType', e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-fg focus:outline-none focus:border-lime"
                  >
                    <option value="motorcycle">Motorcycle / Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="accessory">Accessory (Helmet, Cover, Charger…)</option>
                    <option value="part">Spare Part</option>
                  </select>
                </div>
              </div>

              {/* Row 2: SKU + Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">SKU * (Unique Code)</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setField('sku', e.target.value.toUpperCase())}
                    placeholder="e.g. EVE-HELMET-BLAZE-BLK"
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded font-mono text-lime placeholder:text-dim focus:outline-none focus:border-lime"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Brand</label>
                  <input
                    value={form.brand}
                    onChange={(e) => setField('brand', e.target.value)}
                    placeholder="Crown Motors"
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                  />
                </div>
              </div>

              {/* Row 3: Price + Currency + Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Price (PKR / USD) *</label>
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) => setField('basePrice', e.target.value)}
                    placeholder="e.g. 185000"
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded font-mono text-lime placeholder:text-dim focus:outline-none focus:border-lime"
                  />
                  <p className="font-mono text-[10px] text-dim mt-1">Enter full amount (e.g. 185000 for PKR 185,000)</p>
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setField('currency', e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-fg focus:outline-none focus:border-lime"
                  >
                    <option value="PKR">PKR — Pakistani Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="AED">AED — UAE Dirham</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Initial Stock</label>
                  <input
                    type="number"
                    value={form.inventory}
                    onChange={(e) => setField('inventory', e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded font-mono text-fg focus:outline-none focus:border-lime"
                  />
                </div>
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setField('category', e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-fg focus:outline-none focus:border-lime"
                  >
                    <option value="">— No Category —</option>
                    {categories.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                  Full Description * (min 10 chars)
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Describe the product — features, materials, use case…"
                  className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg placeholder:text-dim focus:outline-none focus:border-lime resize-none"
                />
              </div>

              {/* Short description */}
              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                  Short Description (optional, shown on card)
                </label>
                <input
                  value={form.shortDescription}
                  onChange={(e) => setField('shortDescription', e.target.value)}
                  placeholder="e.g. Premium carbon-fiber helmet with dual visor"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                />
              </div>

              {/* Product Images (ImageKit Upload + Previews) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-[11px] text-muted uppercase">
                    Product Imagery (ImageKit Powered)
                  </label>
                  <span className="font-mono text-[10px] text-lime">
                    {form.images.split('\n').filter(Boolean).length} Images attached
                  </span>
                </div>

                {/* Upload dropzone / trigger */}
                <div className="border border-dashed border-line bg-ink/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2 relative hover:border-lime/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    disabled={uploadingImages}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center gap-2 text-muted">
                    {uploadingImages ? (
                      <Loader2 className="size-5 text-lime animate-spin" />
                    ) : (
                      <UploadCloud className="size-5 text-lime" />
                    )}
                    <span className="text-[13px] font-medium text-fg">
                      {uploadingImages ? 'Uploading images to ImageKit...' : 'Click or drop product photos here'}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-dim">
                    Supports PNG, JPG, WebP up to 10MB each · Stored securely in ImageKit
                  </p>
                </div>

                {/* Thumbnails preview */}
                {form.images.split('\n').filter(Boolean).length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-1">
                    {form.images.split('\n').filter(Boolean).map((imgUrl, idx) => (
                      <div key={idx} className="relative group size-16 rounded border border-line overflow-hidden bg-surface">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt={`Product ${idx + 1}`} className="size-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/70 text-rose-400 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          title="Remove image"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Manual URL fallback / edit */}
                <details className="mt-1">
                  <summary className="text-[11px] font-mono text-muted cursor-pointer hover:text-fg select-none">
                    + Edit raw Image URLs / Paste links
                  </summary>
                  <textarea
                    rows={2}
                    value={form.images}
                    onChange={(e) => setField('images', e.target.value)}
                    placeholder="https://example.com/img1.jpg"
                    className="w-full bg-ink border border-line px-3 py-1.5 mt-1 rounded font-mono text-[11px] text-dim focus:outline-none focus:border-lime resize-none"
                  />
                </details>
              </div>

              {/* Specs */}
              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                  Specifications (optional — one per line, format: Label: Value)
                </label>
                <textarea
                  rows={4}
                  value={form.specifications}
                  onChange={(e) => setField('specifications', e.target.value)}
                  placeholder={`Motor Power: 3000W\nMax Range: 80km\nTop Speed: 85km/h\nBattery: 60V 30Ah Lithium`}
                  className="w-full bg-ink border border-line px-3.5 py-2 rounded font-mono text-[12px] text-fg placeholder:text-dim focus:outline-none focus:border-lime resize-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">URL Slug (auto-generated)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setField('slug', slugify(e.target.value))}
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded font-mono text-[12px] text-dim focus:outline-none focus:border-lime"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setField('isFeatured', e.target.checked)}
                    className="accent-lime size-4"
                  />
                  <span className="font-mono text-[12px] text-muted">Featured on Homepage</span>
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
                onClick={() => { setShowAddModal(false); resetForm(); }}
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
                  <><Loader2 className="size-3.5 animate-spin" /> Creating…</>
                ) : createSuccess ? (
                  <><Check className="size-3.5" /> Created!</>
                ) : (
                  <><PackagePlus className="size-3.5" /> Create Product</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
