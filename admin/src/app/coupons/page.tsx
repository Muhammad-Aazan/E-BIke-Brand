'use client';

import { useEffect, useState } from 'react';
import { Tag, Plus, Check, AlertCircle, Loader2, X, Percent, Calendar } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/format';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrder, setMinOrder] = useState<number>(0);
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await adminApi<any>('coupons');
      if (data?.coupons) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setCreating(true);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minimumOrderValue: Number(minOrder) * 100,
        startsAt: new Date().toISOString(),
      };

      const res = await adminApi<any>('coupons', {
        method: 'POST',
        body: payload,
      });

      const newCoupon = res?.coupon || res;
      setCoupons((prev) => [newCoupon, ...prev]);
      setShowAddModal(false);
      setCode('');
      setDiscountValue(10);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create coupon code');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-fg tracking-tight">
            Coupons & Promotional Incentives
          </h1>
          <p className="text-[13px] text-muted">
            Configure deposit discount codes, seasonal offers, and marketing promotions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-lime text-night font-semibold rounded text-[13px] hover:bg-[#e0f48f] transition-colors self-start"
        >
          <Plus className="size-4" />
          <span>Create New Promo Code</span>
        </button>
      </div>

      <div className="bg-night border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted font-mono text-[13px] flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-lime" />
            <span>Loading coupon directory...</span>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-muted font-mono text-[13px]">
            No promo codes active in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface/50 border-b border-line font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-3 px-6">Promo Code</th>
                  <th className="py-3 px-6">Discount Type</th>
                  <th className="py-3 px-6">Discount Value</th>
                  <th className="py-3 px-6">Times Used</th>
                  <th className="py-3 px-6">Starts At</th>
                  <th className="py-3 px-6">Expires At</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-lime tracking-wider">
                      {c.code}
                    </td>
                    <td className="py-4 px-6 capitalize font-mono text-muted">
                      {c.discountType}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-fg">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% OFF`
                        : formatPrice(c.discountValue / 100, 'PKR')}
                    </td>
                    <td className="py-4 px-6 font-mono text-dim">
                      {c.usageCount || 0} uses
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-muted">
                      {formatDate(c.startsAt)}
                    </td>
                    <td className="py-4 px-6 font-mono text-[11px] text-dim">
                      {c.expiresAt ? formatDate(c.expiresAt) : 'Permanent / Never'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          c.isActive
                            ? 'bg-lime/10 text-lime border border-lime/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCoupon}
            className="w-full max-w-[480px] bg-night border border-line rounded-xl shadow-2xl p-6 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="font-mono text-[11px] text-lime uppercase">Campaign Creation</span>
                <h3 className="font-bold text-[18px] text-fg">Create Promo Coupon</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="size-7 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            {modalError && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 p-3 rounded text-[13px] text-rose-300">
                <AlertCircle className="size-4 text-rose-400 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                  Coupon Code (e.g. CROWN2026)
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EVE100K"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded font-mono text-[14px] text-lime focus:outline-none focus:border-lime uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-[13px] text-fg focus:outline-none focus:border-lime"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded font-mono text-[13px] text-fg focus:outline-none focus:border-lime"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-line text-muted rounded text-[12px] hover:text-fg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-5 py-2 bg-lime text-night font-semibold rounded text-[12px] hover:bg-[#e0f48f] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {creating && <Loader2 className="size-3.5 animate-spin" />}
                <span>Create & Publish Code</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
