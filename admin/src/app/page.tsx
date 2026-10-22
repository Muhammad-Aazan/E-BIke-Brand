'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  Package,
  Bike,
  Users,
  ArrowRight,
  RefreshCw,
  MapPin,
  Clock,
  MessageSquare,
  Calendar,
  Check,
  X,
  Loader2,
  Phone,
  Mail,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/auth';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/format';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, loading: authLoading } = useAdminAuth();

  const [overview, setOverview] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Quick Schedule Modal on Dashboard
  const [schedulingReq, setSchedulingReq] = useState<any | null>(null);
  const [replyTime, setReplyTime] = useState('');
  const [replyLocation, setReplyLocation] = useState('Karachi Atelier Showroom');
  const [adminNote, setAdminNote] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsData, ordersData, contactData] = await Promise.all([
        adminApi<any>('analytics/overview').catch(() => null),
        adminApi<any>('admin/orders', { query: { limit: 5 } }).catch(() => null),
        adminApi<any>('contact').catch(() => null),
      ]);

      if (analyticsData) setOverview(analyticsData);
      if (ordersData?.orders) setRecentOrders(ordersData.orders);
      if (contactData?.requests) {
        setRecentRequests(contactData.requests.slice(0, 5));
        setNewRequestsCount(contactData.newCount || 0);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/login');
      return;
    }

    if (admin) {
      fetchDashboardData();
    }
  }, [admin, authLoading, router]);

  const handleSaveSchedule = async () => {
    if (!schedulingReq) return;
    setSavingSchedule(true);
    try {
      await adminApi(`contact/${schedulingReq._id}`, {
        method: 'PATCH',
        body: {
          status: 'replied',
          adminReplyTime: replyTime || undefined,
          adminReplyLocation: replyLocation.trim() || undefined,
          adminNote: adminNote.trim() || undefined,
        },
      });

      setRecentRequests((prev) =>
        prev.map((r) =>
          r._id === schedulingReq._id
            ? {
                ...r,
                status: 'replied',
                adminReplyTime: replyTime,
                adminReplyLocation: replyLocation,
                adminNote,
              }
            : r
        )
      );
      setSchedulingReq(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save appointment');
    } finally {
      setSavingSchedule(false);
    }
  };

  if (authLoading || (loading && !overview)) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3 font-mono text-lime text-[13px]">
        <div className="size-6 border-2 border-lime border-t-transparent rounded-full animate-spin" />
        <span>Loading Executive Overview...</span>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Gross Fleet Revenue',
      value: overview?.revenue ? formatPrice(overview.revenue.total / 100, 'PKR') : 'PKR 0',
      subtext: `${overview?.revenue?.paidOrdersCount || 0} Paid Transactions`,
      icon: DollarSign,
      color: 'text-lime',
      bg: 'bg-lime/10',
    },
    {
      label: 'Total Vehicle Orders',
      value: overview?.totalOrders?.toString() || '0',
      subtext: 'Pending, Confirmed & Dispatched',
      icon: Package,
      color: 'text-sky-400',
      bg: 'bg-sky-400/10',
    },
    {
      label: 'Catalog Fleet & Equipment',
      value: overview?.totalProducts?.toString() || '6',
      subtext: 'Motorcycles, Helmets & Gear',
      icon: Bike,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Pending Bookings / Inquiries',
      value: newRequestsCount.toString(),
      subtext: `${recentRequests.length} Total Concierge Requests`,
      icon: MessageSquare,
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-[1400px]">
      {/* Top Welcome & Refresh bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-fg tracking-tight">
            Fleet Operations Overview
          </h1>
          <p className="text-[13px] text-muted">
            Live telematics, order dispatch queue, and customer test ride booking requests.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-line rounded-md text-[12px] font-mono text-muted hover:text-fg hover:border-fg transition-colors self-start"
        >
          <RefreshCw className="size-3.5" />
          <span>Sync Real-Time Metrics</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-night border border-line p-5 rounded-lg flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  {m.label}
                </span>
                <div className={`size-8 rounded flex items-center justify-center ${m.bg} ${m.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div>
                <p className="text-[24px] font-mono font-bold text-fg tracking-tight">{m.value}</p>
                <p className="font-mono text-[11px] text-dim mt-0.5">{m.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 1: CUSTOMER BOOKING & TEST RIDE REQUESTS */}
      <div className="bg-night border border-line rounded-lg overflow-hidden flex flex-col">
        <div className="p-6 border-b border-line flex items-center justify-between bg-surface/30">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-lime" />
              <h2 className="text-[17px] font-semibold text-fg">
                Test Ride & Vehicle Booking Requests
              </h2>
              {newRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold border border-rose-500/30">
                  {newRequestsCount} NEW
                </span>
              )}
            </div>
            <p className="text-[12px] text-muted mt-0.5">
              Customers requesting showroom visits, test drives, and vehicle bookings. Coordinate time & location below.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-lime hover:underline font-mono text-[12px]"
          >
            <span>All Requests ({recentRequests.length})</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-8 text-center text-muted font-mono text-[13px]">
            No booking or concierge requests received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface/50 border-b border-line font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Contact Details</th>
                  <th className="py-3 px-6">Vehicle & Subject</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Confirmed Time & Place</th>
                  <th className="py-3 px-6 text-right">Coordinate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentRequests.map((req: any) => (
                  <tr key={req._id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-fg">
                      <p>{req.name}</p>
                      <span className="font-mono text-[10px] text-dim">{formatDate(req.createdAt)}</span>
                    </td>
                    <td className="py-4 px-6 font-mono text-[12px] text-muted">
                      <p className="text-fg">{req.phone || 'No phone'}</p>
                      <p className="text-dim text-[11px]">{req.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-fg font-medium">{req.subject}</p>
                      <p className="font-mono text-[11px] text-dim capitalize">{req.requestType?.replace('_', ' ')}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                          req.status === 'replied'
                            ? 'bg-lime/10 text-lime border border-lime/30'
                            : req.status === 'new'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-surface text-muted border border-line'
                        }`}
                      >
                        {req.status === 'replied' ? 'Scheduled' : req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[12px]">
                      {req.adminReplyTime || req.adminReplyLocation ? (
                        <div className="flex flex-col gap-0.5">
                          {req.adminReplyTime && (
                            <span className="font-mono text-lime flex items-center gap-1 text-[11px]">
                              <Clock className="size-3" />
                              {new Date(req.adminReplyTime).toLocaleString('en-PK', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          )}
                          {req.adminReplyLocation && (
                            <span className="text-muted flex items-center gap-1 text-[11px]">
                              <MapPin className="size-3" /> {req.adminReplyLocation}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-[11px] text-rose-400">Not set yet</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSchedulingReq(req);
                          setReplyTime(
                            req.adminReplyTime
                              ? new Date(req.adminReplyTime).toISOString().slice(0, 16)
                              : ''
                          );
                          setReplyLocation(req.adminReplyLocation || 'Karachi Atelier Showroom');
                          setAdminNote(req.adminNote || '');
                        }}
                        className="px-3 py-1.5 bg-surface hover:bg-surfaceHover border border-line rounded text-lime font-mono text-[11px] transition-colors"
                      >
                        {req.adminReplyTime ? 'Update Slot' : 'Set Time & Place'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: RECENT VEHICLE ORDERS */}
      <div className="bg-night border border-line rounded-lg overflow-hidden flex flex-col">
        <div className="p-6 border-b border-line flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-semibold text-fg">Recent Handover Dispatches & Orders</h2>
            <p className="text-[12px] text-muted">Latest vehicle reservations requiring allocation or tracking.</p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-lime hover:underline font-mono text-[12px]"
          >
            <span>View All Orders</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-12 text-center text-muted font-mono text-[13px]">
            No recent orders registered in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface/50 border-b border-line font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-3 px-6">Order Number</th>
                  <th className="py-3 px-6">Customer</th>
                  <th className="py-3 px-6">Vehicle & Items</th>
                  <th className="py-3 px-6">Delivery City</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Grand Total</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentOrders.map((ord: any) => (
                  <tr key={ord._id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-fg">
                      {ord.orderNumber}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-medium text-fg">{ord.guestName || ord.user?.name || 'Customer'}</p>
                      <p className="font-mono text-[11px] text-dim">{ord.guestEmail || ord.user?.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-fg font-medium">
                        {ord.items?.[0]?.productName || 'Electric Motorcycle'}
                      </p>
                      {ord.items?.length > 1 && (
                        <span className="font-mono text-[10px] text-dim">
                          +{ord.items.length - 1} additional item(s)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-muted">
                      {ord.shippingAddress?.city || 'Karachi'}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                          ord.orderStatus === 'confirmed' || ord.orderStatus === 'delivered'
                            ? 'bg-lime/10 text-lime border border-lime/30'
                            : ord.orderStatus === 'pending_payment'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-surface text-muted border border-line'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-fg">
                      {formatPrice(ord.grandTotal / 100, ord.currency || 'PKR')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/orders?search=${ord.orderNumber}`}
                        className="font-mono text-[11px] text-lime hover:underline"
                      >
                        Inspect & Edit ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK SCHEDULE MODAL */}
      {schedulingReq && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[520px] bg-night border border-line rounded-xl shadow-2xl p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="font-mono text-[11px] text-lime uppercase">
                  Schedule Concierge Appointment
                </span>
                <h3 className="font-bold text-[18px] text-fg">{schedulingReq.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSchedulingReq(null)}
                className="size-7 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="bg-surface/40 border border-line p-3.5 rounded text-[12px] flex flex-col gap-1">
              <p className="font-medium text-fg">{schedulingReq.subject}</p>
              <div className="flex items-center gap-4 text-muted font-mono text-[11px] mt-1">
                <span className="flex items-center gap-1"><Phone className="size-3 text-lime" /> {schedulingReq.phone || 'N/A'}</span>
                <span className="flex items-center gap-1"><Mail className="size-3 text-lime" /> {schedulingReq.email}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-lime" />
                  Appointment Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={replyTime}
                  onChange={(e) => setReplyTime(e.target.value)}
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded font-mono text-[13px] text-fg focus:outline-none focus:border-lime"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-lime" />
                  Showroom / Meeting Location *
                </label>
                <input
                  type="text"
                  value={replyLocation}
                  onChange={(e) => setReplyLocation(e.target.value)}
                  placeholder="e.g. DHA Phase 6 Atelier / Karachi Flagship"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-muted uppercase mb-1.5">
                  Admin Note / Instructions
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Sovereign R prepped with charged battery for trial"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setSchedulingReq(null)}
                className="px-4 py-2 border border-line text-muted rounded text-[12px] hover:text-fg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="px-5 py-2 bg-lime text-night font-semibold rounded text-[12px] hover:bg-[#e0f48f] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {savingSchedule ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                <span>Confirm & Set Appointment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
