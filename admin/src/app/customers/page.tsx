'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Check,
  Ban,
  Loader2,
  ShieldCheck,
  Mail,
  Phone,
  Eye,
  X,
  MapPin,
  Calendar,
  Clock,
  Shield,
  UserCheck,
  ExternalLink,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/format';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin' | 'support'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Selected Customer Modal
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminApi<any>('admin/customers', {
        query: {
          limit: 100,
          role: roleFilter === 'all' ? undefined : roleFilter,
        },
      });
      if (data?.customers) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [roleFilter]);

  const filteredCustomers = customers.filter((c) => {
    const s = search.toLowerCase();
    return (
      !search ||
      c.name?.toLowerCase().includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      (c.phone && c.phone.includes(s))
    );
  });

  const handleToggleStatus = async (customer: any) => {
    const targetStatus = customer.accountStatus === 'active' ? 'suspended' : 'active';
    setTogglingId(customer._id);
    try {
      await adminApi(`admin/customers/${customer._id}/status`, {
        method: 'PATCH',
        body: { accountStatus: targetStatus, reason: `Status toggled by admin to ${targetStatus}` },
      });

      setCustomers((prev) =>
        prev.map((c) => (c._id === customer._id ? { ...c, accountStatus: targetStatus } : c))
      );

      if (selectedUser && selectedUser._id === customer._id) {
        setSelectedUser((prev: any) => ({ ...prev, accountStatus: targetStatus }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-fg tracking-tight">
            User Directory & Role Directory
          </h1>
          <p className="text-[13px] text-muted">
            Complete profile oversight for Atelier customers, support agents, and administrators.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchCustomers}
          className="px-4 py-2 bg-surface border border-line rounded text-[12px] font-mono text-muted hover:text-fg transition-colors"
        >
          Refresh Directory
        </button>
      </div>

      {/* Role Filters & Search Bar */}
      <div className="bg-night border border-line p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {(['all', 'customer', 'admin', 'support'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded text-[12px] font-mono uppercase transition-colors whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-lime text-night font-bold'
                  : 'bg-surface border border-line text-muted hover:text-fg'
              }`}
            >
              {r === 'all' ? 'All Roles' : `${r}s`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full bg-surface border border-line px-3.5 py-1.5 pl-9 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
            />
            <Search className="absolute left-3 top-2.5 size-4 text-dim pointer-events-none" />
          </div>
          <span className="font-mono text-[11px] text-muted whitespace-nowrap">
            {filteredCustomers.length} registered
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-night border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted font-mono text-[13px] flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-lime" />
            <span>Loading user profiles...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-muted font-mono text-[13px]">
            No user profiles matching this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface/50 border-b border-line font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-3 px-6">User / Member</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">Phone</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Verification</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Joined</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => setSelectedUser(c)}
                    className="hover:bg-surface/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-6 font-medium text-fg flex items-center gap-3">
                      <div className="size-9 rounded-full bg-surface border border-line flex items-center justify-center font-bold text-lime text-[13px] overflow-hidden shrink-0">
                        {c.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.avatarUrl} alt={c.name} className="size-full object-cover" />
                        ) : (
                          <span>{c.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <span className="block font-medium">{c.name}</span>
                        {c.addresses && c.addresses.length > 0 && (
                          <span className="text-[10px] font-mono text-dim">
                            {c.addresses.length} saved {c.addresses.length === 1 ? 'address' : 'addresses'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[12px] text-muted">
                      {c.email}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[12px] text-dim">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          c.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : c.role === 'support'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-surface text-muted border border-line'
                        }`}
                      >
                        {c.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                          c.emailVerified
                            ? 'bg-lime/10 text-lime border border-lime/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {c.emailVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          c.accountStatus === 'active'
                            ? 'text-lime bg-lime/10 border border-lime/30'
                            : 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                        }`}
                      >
                        {c.accountStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px] text-dim">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="py-3.5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(c)}
                          className="px-2.5 py-1 rounded font-mono text-[11px] bg-surface border border-line text-muted hover:text-lime hover:border-lime transition-colors flex items-center gap-1"
                          title="View Full Profile"
                        >
                          <Eye className="size-3" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          disabled={togglingId === c._id || c.role === 'admin'}
                          className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors border ${
                            c.accountStatus === 'active'
                              ? 'bg-surface border-line text-muted hover:text-rose-400 hover:border-rose-400/50'
                              : 'bg-lime/10 border-lime/40 text-lime hover:bg-lime/20'
                          } disabled:opacity-40`}
                        >
                          {togglingId === c._id
                            ? '...'
                            : c.accountStatus === 'active'
                            ? 'Suspend'
                            : 'Activate'}
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Full Customer Profile Modal */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-night border border-line rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-surface border-2 border-line overflow-hidden flex items-center justify-center text-lime font-bold text-[22px] shrink-0">
                  {selectedUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span>{selectedUser.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[20px] text-fg">{selectedUser.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                        selectedUser.accountStatus === 'active'
                          ? 'bg-lime/10 text-lime border border-lime/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {selectedUser.accountStatus}
                    </span>
                  </div>
                  <span className="font-mono text-[12px] text-muted">{selectedUser.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-muted hover:text-fg font-mono text-[14px] p-1"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-surface/50 border border-line p-3 rounded">
                <span className="text-[10px] font-mono text-dim uppercase block">Role</span>
                <span className="font-mono text-[12px] text-lime font-semibold uppercase">
                  {selectedUser.role}
                </span>
              </div>
              <div className="bg-surface/50 border border-line p-3 rounded">
                <span className="text-[10px] font-mono text-dim uppercase block">Phone</span>
                <span className="font-mono text-[12px] text-fg">
                  {selectedUser.phone || 'Not provided'}
                </span>
              </div>
              <div className="bg-surface/50 border border-line p-3 rounded">
                <span className="text-[10px] font-mono text-dim uppercase block">Email Status</span>
                <span className="font-mono text-[12px] text-fg">
                  {selectedUser.emailVerified ? '✓ Verified' : 'Unverified'}
                </span>
              </div>
              <div className="bg-surface/50 border border-line p-3 rounded">
                <span className="text-[10px] font-mono text-dim uppercase block">User ID</span>
                <span className="font-mono text-[10px] text-muted truncate block" title={selectedUser._id}>
                  {selectedUser._id}
                </span>
              </div>
              <div className="bg-surface/50 border border-line p-3 rounded">
                <span className="text-[10px] font-mono text-dim uppercase block">Registration Date</span>
                <span className="font-mono text-[11px] text-fg">
                  {formatDate(selectedUser.createdAt)}
                </span>
              </div>
              <div className="bg-surface/50 border border-line p-3 rounded">
                <span className="text-[10px] font-mono text-dim uppercase block">ImageKit Avatar</span>
                <span className="font-mono text-[11px] text-fg truncate block">
                  {selectedUser.avatarUrl ? 'Configured' : 'Default'}
                </span>
              </div>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="flex flex-col gap-3">
              <h4 className="font-mono text-[11px] uppercase text-muted tracking-wider flex items-center gap-1.5">
                <MapPin className="size-3.5 text-lime" />
                <span>Delivery Addresses ({selectedUser.addresses?.length || 0})</span>
              </h4>

              {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedUser.addresses.map((a: any, idx: number) => (
                    <div key={idx} className="bg-ink border border-line p-3.5 rounded text-[12px] flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-lime uppercase font-semibold">
                          {a.label || 'Address'}
                        </span>
                        {a.isDefault && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-lime/10 text-lime border border-lime/30">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-fg">{a.fullName}</p>
                      <p className="text-muted leading-tight">
                        {a.addressLine1}
                        {a.addressLine2 ? `, ${a.addressLine2}` : ''}
                        <br />
                        {a.city}, {a.country || 'PK'}
                      </p>
                      <p className="font-mono text-[11px] text-dim">{a.phone}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] font-mono text-dim p-4 border border-line bg-surface/30 rounded text-center">
                  No delivery destinations registered by this user yet.
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-line pt-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedUser.email}`}
                  className="px-3.5 py-2 bg-surface border border-line rounded text-[12px] font-mono text-muted hover:text-fg transition-colors flex items-center gap-1.5"
                >
                  <Mail className="size-3.5" />
                  <span>Send Email</span>
                </a>
                {selectedUser.phone && (
                  <a
                    href={`tel:${selectedUser.phone}`}
                    className="px-3.5 py-2 bg-surface border border-line rounded text-[12px] font-mono text-muted hover:text-fg transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="size-3.5" />
                    <span>Call Client</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-line text-muted rounded text-[12px] font-mono hover:text-fg"
                >
                  Close
                </button>
                {selectedUser.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedUser)}
                    disabled={togglingId === selectedUser._id}
                    className={`px-4 py-2 rounded text-[12px] font-semibold transition-colors ${
                      selectedUser.accountStatus === 'active'
                        ? 'bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30'
                        : 'bg-lime text-night hover:bg-[#e0f48f]'
                    }`}
                  >
                    {selectedUser.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
