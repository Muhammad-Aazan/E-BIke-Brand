'use client';

import { useEffect, useState } from 'react';
import {
  MessageSquare, Search, Check, X, Clock, MapPin,
  Calendar, Loader2, Phone, Mail, RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/format';

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  read: 'bg-blue-500/10 text-blue-400 border border-blue-500/30',
  replied: 'bg-lime/10 text-lime border border-lime/30',
  closed: 'bg-surface text-muted border border-line',
};

const TYPE_LABELS: Record<string, string> = {
  contact: '📩 Contact',
  booking: '📅 Booking',
  test_ride: '🏍️ Test Ride',
  service: '🔧 Service',
};

export default function AdminContactPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  // Reply fields
  const [adminNote, setAdminNote] = useState('');
  const [replyTime, setReplyTime] = useState('');
  const [replyLocation, setReplyLocation] = useState('');
  const [replyStatus, setReplyStatus] = useState('replied');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await adminApi<any>('contact', {
        query: { status: statusFilter === 'all' ? undefined : statusFilter },
      });
      if (data?.requests) setRequests(data.requests);
    } catch (err) {
      console.error('Failed to load contact requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const filtered = requests.filter((r) => {
    const s = search.toLowerCase();
    return (
      !search ||
      r.name?.toLowerCase().includes(s) ||
      r.email?.toLowerCase().includes(s) ||
      r.subject?.toLowerCase().includes(s) ||
      r.message?.toLowerCase().includes(s)
    );
  });

  const openRequest = (r: any) => {
    setSelected(r);
    setAdminNote(r.adminNote || '');
    setReplyTime(r.adminReplyTime ? new Date(r.adminReplyTime).toISOString().slice(0, 16) : '');
    setReplyLocation(r.adminReplyLocation || '');
    setReplyStatus(r.status === 'new' ? 'read' : r.status);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await adminApi(`contact/${selected._id}`, {
        method: 'PATCH',
        body: {
          status: replyStatus,
          adminNote: adminNote.trim() || undefined,
          adminReplyTime: replyTime || undefined,
          adminReplyLocation: replyLocation.trim() || undefined,
        },
      });
      setRequests((prev) =>
        prev.map((r) =>
          r._id === selected._id
            ? { ...r, status: replyStatus, adminNote, adminReplyTime: replyTime, adminReplyLocation: replyLocation }
            : r
        )
      );
      setSelected(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    } finally {
      setSaving(false);
    }
  };

  const newCount = requests.filter((r) => r.status === 'new').length;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-fg tracking-tight flex items-center gap-2">
            Booking & Contact Requests
            {newCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[11px] font-semibold border border-amber-500/30">
                {newCount} New
              </span>
            )}
          </h1>
          <p className="text-[13px] text-muted">
            Customer inquiries, test ride bookings, and service requests from the website.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRequests}
          className="px-4 py-2 bg-surface border border-line rounded text-[12px] font-mono text-muted hover:text-fg transition-colors flex items-center gap-1.5 self-start"
        >
          <RefreshCw className="size-3.5" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-night border border-line p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, subject…"
            className="w-full bg-surface border border-line px-3.5 py-2 pl-9 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-dim pointer-events-none" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-line px-3 py-2 rounded text-[13px] text-fg font-mono focus:outline-none focus:border-lime"
        >
          <option value="all">All Statuses</option>
          <option value="new">New / Unread</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-night border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted font-mono text-[13px] flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-lime" />
            <span>Loading requests…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted font-mono text-[13px]">
            No requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface/50 border-b border-line font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Name & Contact</th>
                  <th className="py-3 px-5">Subject</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Admin Reply</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((r) => (
                  <tr key={r._id} className={`hover:bg-surface/30 transition-colors ${r.status === 'new' ? 'bg-amber-500/5' : ''}`}>
                    <td className="py-4 px-5">
                      <span className="font-mono text-[11px] text-muted">{TYPE_LABELS[r.requestType] || r.requestType}</span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-fg">{r.name}</p>
                      <p className="font-mono text-[11px] text-dim">{r.email}</p>
                      {r.phone && <p className="font-mono text-[11px] text-dim">{r.phone}</p>}
                    </td>
                    <td className="py-4 px-5 max-w-[220px]">
                      <p className="font-medium text-fg truncate">{r.subject}</p>
                      <p className="font-mono text-[11px] text-dim truncate">{r.message}</p>
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-muted whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${STATUS_COLORS[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[12px] text-muted">
                      {r.adminReplyTime && (
                        <div className="flex items-center gap-1 text-lime">
                          <Clock className="size-3" />
                          <span className="font-mono text-[11px]">
                            {new Date(r.adminReplyTime).toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                      )}
                      {r.adminReplyLocation && (
                        <div className="flex items-center gap-1 text-muted mt-0.5">
                          <MapPin className="size-3" />
                          <span className="font-mono text-[11px]">{r.adminReplyLocation}</span>
                        </div>
                      )}
                      {!r.adminReplyTime && !r.adminReplyLocation && (
                        <span className="text-dim font-mono text-[10px]">Not set yet</span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => openRequest(r)}
                        className="px-3 py-1.5 bg-surface hover:bg-surfaceHover border border-line rounded text-lime font-mono text-[11px] transition-colors"
                      >
                        Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Detail / Reply Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[680px] max-h-[90vh] bg-night border border-line rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-line flex items-center justify-between bg-surface/40">
              <div>
                <span className="font-mono text-[11px] text-lime uppercase">
                  {TYPE_LABELS[selected.requestType]} — {formatDate(selected.createdAt)}
                </span>
                <h2 className="text-[18px] font-bold text-fg">{selected.subject}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="size-8 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-5">
              {/* Customer info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-surface/50 border border-line p-3 rounded flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted uppercase">Customer</span>
                  <p className="font-medium text-fg">{selected.name}</p>
                </div>
                <div className="bg-surface/50 border border-line p-3 rounded flex items-center gap-2">
                  <Mail className="size-3.5 text-lime shrink-0" />
                  <span className="font-mono text-[12px] text-fg break-all">{selected.email}</span>
                </div>
                {selected.phone && (
                  <div className="bg-surface/50 border border-line p-3 rounded flex items-center gap-2">
                    <Phone className="size-3.5 text-lime shrink-0" />
                    <span className="font-mono text-[12px] text-fg">{selected.phone}</span>
                  </div>
                )}
              </div>

              {/* Message */}
              <div className="bg-surface/30 border border-line p-4 rounded">
                <p className="font-mono text-[10px] text-muted uppercase mb-2">Customer Message</p>
                <p className="font-body text-[14px] text-fg leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>

              {/* Admin Reply Section */}
              <div className="flex flex-col gap-3 border border-lime/20 bg-lime/5 p-4 rounded">
                <p className="font-mono text-[11px] text-lime uppercase font-semibold">Admin Response & Scheduling</p>

                {/* Reply date/time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] text-muted uppercase mb-1.5 flex items-center gap-1">
                      <Calendar className="size-3" /> Schedule Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={replyTime}
                      onChange={(e) => setReplyTime(e.target.value)}
                      className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-fg font-mono text-[12px] focus:outline-none focus:border-lime"
                    />
                    <p className="font-mono text-[10px] text-dim mt-1">When you'll call or meet the customer</p>
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-muted uppercase mb-1.5 flex items-center gap-1">
                      <MapPin className="size-3" /> Location / Meeting Point
                    </label>
                    <input
                      type="text"
                      value={replyLocation}
                      onChange={(e) => setReplyLocation(e.target.value)}
                      placeholder="e.g. Karachi Showroom, Video Call, Phone"
                      className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-fg text-[13px] placeholder:text-dim focus:outline-none focus:border-lime"
                    />
                  </div>
                </div>

                {/* Admin note */}
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Internal Note</label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Internal notes for your team (not visible to customer)"
                    className="w-full bg-ink border border-line px-3.5 py-2 rounded text-fg text-[13px] placeholder:text-dim focus:outline-none focus:border-lime resize-none"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">Update Status</label>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-fg font-mono text-[13px] focus:outline-none focus:border-lime"
                  >
                    <option value="new">new (unread)</option>
                    <option value="read">read</option>
                    <option value="replied">replied (scheduled)</option>
                    <option value="closed">closed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line p-5 bg-surface/30">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-5 py-2 border border-line text-muted rounded text-[12px] hover:text-fg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-lime text-night font-semibold rounded text-[12px] hover:bg-[#e0f48f] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                Save & Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
