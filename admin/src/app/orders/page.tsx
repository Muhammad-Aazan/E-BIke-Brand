'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Package,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  User,
  CreditCard,
  ShieldCheck,
  Truck,
  CheckCircle2,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/format';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected order modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Shipment tracking input
  const [carrier, setCarrier] = useState('TCS Express Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [savingShipment, setSavingShipment] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApi<any>('admin/orders', { query: { limit: 100 } });
      if (data?.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        o.orderNumber.toLowerCase().includes(searchLower) ||
        (o.guestName && o.guestName.toLowerCase().includes(searchLower)) ||
        (o.guestEmail && o.guestEmail.toLowerCase().includes(searchLower)) ||
        (o.shippingAddress?.city && o.shippingAddress.city.toLowerCase().includes(searchLower));
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    setUpdatingStatus(true);
    try {
      await adminApi(`admin/orders/${selectedOrder.orderNumber}/status`, {
        method: 'PATCH',
        body: {
          status: newStatus,
          note: statusNote.trim() || `Status updated to ${newStatus} by admin`,
        },
      });

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === selectedOrder._id ? { ...o, orderStatus: newStatus } : o))
      );
      setSelectedOrder((prev: any) => ({ ...prev, orderStatus: newStatus }));
      setStatusNote('');
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddShipment = async () => {
    if (!selectedOrder || !trackingNumber.trim()) return;
    setSavingShipment(true);
    try {
      await adminApi(`admin/orders/${selectedOrder.orderNumber}/shipment`, {
        method: 'POST',
        body: {
          carrier: carrier,
          trackingNumber: trackingNumber.trim(),
        },
      });

      setSelectedOrder((prev: any) => ({
        ...prev,
        trackingNumber: trackingNumber.trim(),
        shippingCarrier: carrier,
        orderStatus: 'shipped',
      }));
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id
            ? { ...o, trackingNumber: trackingNumber.trim(), shippingCarrier: carrier, orderStatus: 'shipped' }
            : o
        )
      );
      setTrackingNumber('');
      alert('Shipment dispatch & tracking details updated!');
    } catch (err: any) {
      alert(err.message || 'Failed to save shipment details');
    } finally {
      setSavingShipment(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-fg tracking-tight">
            Orders & Vehicle Handover Management
          </h1>
          <p className="text-[13px] text-muted">
            Inspect vehicle reservations, customer delivery addresses, recipient CNIC, and dispatch status.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchOrders}
          className="px-4 py-2 bg-surface border border-line rounded text-[12px] font-mono text-muted hover:text-fg transition-colors self-start"
        >
          Refresh Orders
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-night border border-line p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, email, city..."
            className="w-full bg-surface border border-line px-3.5 py-2 pl-9 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
          />
          <Search className="absolute left-3 top-2.5 size-4 text-dim pointer-events-none" />
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted uppercase">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-line px-3 py-2 rounded text-[13px] text-fg focus:outline-none focus:border-lime font-mono"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing Build</option>
            <option value="ready_to_ship">Ready to Ship</option>
            <option value="shipped">Shipped / In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-night border border-line rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted font-mono text-[13px] flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin text-lime" />
            <span>Loading vehicle order registry...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-muted font-mono text-[13px]">
            No orders match the selected search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-surface/50 border-b border-line font-mono text-[11px] uppercase text-muted">
                <tr>
                  <th className="py-3 px-5">Order #</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Customer & Phone</th>
                  <th className="py-3 px-5">Vehicle Reserved</th>
                  <th className="py-3 px-5">Delivery City</th>
                  <th className="py-3 px-5">Payment</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Total</th>
                  <th className="py-3 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-surface/30 transition-colors">
                    <td className="py-4 px-5 font-mono font-medium text-fg whitespace-nowrap">
                      {ord.orderNumber}
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-muted whitespace-nowrap">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-fg">
                        {ord.guestName || ord.shippingAddress?.fullName || ord.user?.name || 'Client'}
                      </p>
                      <p className="font-mono text-[11px] text-dim">
                        {ord.guestEmail || ord.user?.email || ''}
                      </p>
                      <p className="font-mono text-[11px] text-dim">{ord.shippingAddress?.phone || 'No phone'}</p>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-medium text-fg">{ord.items?.[0]?.productName || 'Motorcycle'}</p>
                      <p className="font-mono text-[10px] text-dim">Qty: {ord.items?.[0]?.quantity || 1}</p>
                    </td>
                    <td className="py-4 px-5 font-mono text-muted">
                      {ord.shippingAddress?.city || 'PK'}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-lime">
                        {ord.paymentStatus.toUpperCase()} ({ord.paymentProvider.toUpperCase()})
                      </span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
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
                    <td className="py-4 px-5 font-mono font-bold text-fg whitespace-nowrap">
                      {formatPrice(ord.grandTotal / 100, ord.currency || 'PKR')}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrder(ord);
                          setNewStatus(ord.orderStatus);
                        }}
                        className="px-3 py-1.5 bg-surface hover:bg-surfaceHover border border-line rounded text-lime font-mono text-[11px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details & Status Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[800px] max-h-[90vh] bg-night border border-line rounded-xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-line flex items-center justify-between bg-surface/50">
              <div>
                <span className="font-mono text-[11px] text-lime uppercase">Order Inspector</span>
                <h2 className="text-[20px] font-bold text-fg font-mono">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="size-8 rounded-full bg-surface border border-line flex items-center justify-center text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-6 text-[13px]">
              {/* Customer Info Banner */}
              <div className="bg-lime/5 border border-lime/20 p-4 rounded-lg flex flex-col gap-1">
                <span className="font-mono text-[11px] text-lime uppercase flex items-center gap-1.5 font-semibold mb-1">
                  <User className="size-3.5" />
                  Purchasing Customer
                </span>
                <p className="font-bold text-fg text-[15px]">
                  {selectedOrder.guestName || selectedOrder.shippingAddress?.fullName || selectedOrder.user?.name || 'Guest Customer'}
                </p>
                <p className="font-mono text-[12px] text-muted">
                  {selectedOrder.guestEmail || selectedOrder.user?.email || 'No email recorded'}
                </p>
                <p className="font-mono text-[12px] text-muted">
                  Phone: {selectedOrder.metadata?.vehicleHandover?.guestPhone || selectedOrder.shippingAddress?.phone || 'N/A'}
                </p>
              </div>

              {/* Delivery & Handover Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface/50 border border-line p-4 rounded-lg flex flex-col gap-2">
                  <span className="font-mono text-[11px] text-lime uppercase flex items-center gap-1.5 font-semibold">
                    <MapPin className="size-3.5" />
                    Delivery Destination Address
                  </span>
                  <p className="font-medium text-fg">{selectedOrder.shippingAddress?.fullName}</p>
                  <p className="text-muted">{selectedOrder.shippingAddress?.addressLine1}</p>
                  {selectedOrder.shippingAddress?.addressLine2 && (
                    <p className="text-muted">{selectedOrder.shippingAddress.addressLine2}</p>
                  )}
                  <p className="text-muted">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                    {selectedOrder.shippingAddress?.postalCode}
                  </p>
                  <p className="font-mono text-[11px] text-dim">{selectedOrder.shippingAddress?.country || 'PK'}</p>
                  <p className="font-mono text-[11px] text-lime mt-1">
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </p>
                </div>

                <div className="bg-surface/50 border border-line p-4 rounded-lg flex flex-col gap-2">
                  <span className="font-mono text-[11px] text-lime uppercase flex items-center gap-1.5 font-semibold">
                    <Calendar className="size-3.5" />
                    Handover Preferences & ID
                  </span>
                  <div className="flex justify-between border-b border-line/60 pb-1">
                    <span className="text-muted">Recipient CNIC/ID:</span>
                    <span className="font-mono text-fg">
                      {selectedOrder.metadata?.vehicleHandover?.nationalIdOrCnic || 'On Delivery Verification'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-line/60 pb-1">
                    <span className="text-muted">Preferred Date:</span>
                    <span className="font-mono text-fg">
                      {selectedOrder.metadata?.vehicleHandover?.preferredDate || 'Standard Dispatch'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-line/60 pb-1">
                    <span className="text-muted">Time Window:</span>
                    <span className="font-mono text-fg uppercase">
                      {selectedOrder.metadata?.vehicleHandover?.preferredTimeSlot || 'Morning'}
                    </span>
                  </div>
                  {selectedOrder.customerNotes && (
                    <p className="text-[12px] italic text-dim mt-1">
                      Notes: {selectedOrder.customerNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Items in this order */}
              <div className="border border-line rounded-lg overflow-hidden">
                <div className="bg-surface/60 px-4 py-2 border-b border-line font-mono text-[11px] text-muted uppercase">
                  Vehicles & Accessories in this build
                </div>
                <div className="divide-y divide-line">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-[13px]">
                      <div>
                        <p className="font-medium text-fg">{item.productName}</p>
                        <p className="font-mono text-[11px] text-dim">
                          SKU: {item.sku} · Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-lime font-bold">
                        {formatPrice(item.totalPrice / 100, selectedOrder.currency || 'PKR')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update Form */}
              <div className="bg-surface/40 border border-line p-4 rounded-lg flex flex-col gap-3">
                <span className="font-mono text-[11px] text-fg uppercase font-semibold">
                  Update Order Lifecycle Status
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="bg-ink border border-line px-3 py-2 rounded text-[13px] text-fg focus:outline-none focus:border-lime font-mono"
                  >
                    <option value="pending_payment">pending_payment</option>
                    <option value="confirmed">confirmed</option>
                    <option value="processing">processing (Build Allocation)</option>
                    <option value="ready_to_ship">ready_to_ship</option>
                    <option value="shipped">shipped (In Transit)</option>
                    <option value="delivered">delivered (Handover Complete)</option>
                    <option value="cancelled">cancelled</option>
                  </select>

                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Audit note (e.g. Allocation confirmed, driver dispatched)"
                    className="bg-ink border border-line px-3 py-2 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || newStatus === selectedOrder.orderStatus}
                  className="self-end px-5 py-2 bg-lime text-night font-semibold rounded text-[12px] hover:bg-[#e0f48f] disabled:opacity-40 transition-colors flex items-center gap-2"
                >
                  {updatingStatus && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Save Status Change</span>
                </button>
              </div>

              {/* Shipment Details Form */}
              <div className="bg-surface/40 border border-line p-4 rounded-lg flex flex-col gap-3">
                <span className="font-mono text-[11px] text-fg uppercase font-semibold flex items-center gap-1.5">
                  <Truck className="size-3.5 text-lime" />
                  Assign Dispatch Carrier & Tracking #
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="Logistics Carrier Name"
                    className="bg-ink border border-line px-3 py-2 rounded text-[13px] text-fg focus:outline-none focus:border-lime"
                  />
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Tracking Number / Dispatch Waybill"
                    className="bg-ink border border-line px-3 py-2 rounded text-[13px] text-fg placeholder:text-dim focus:outline-none focus:border-lime font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddShipment}
                  disabled={savingShipment || !trackingNumber.trim()}
                  className="self-end px-5 py-2 bg-surface border border-line hover:border-lime rounded text-[12px] text-lime font-mono transition-colors flex items-center gap-2 disabled:opacity-40"
                >
                  {savingShipment && <Loader2 className="size-3.5 animate-spin" />}
                  <span>Assign Tracking & Mark Shipped</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
