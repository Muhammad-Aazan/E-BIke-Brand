'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Package,
  Calendar,
  LogOut,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  KeyRound,
  Edit3,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Section } from '@/components/ui/Section';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { getUserOrders, OrderDetail } from '@/lib/api/orders';
import { getMyBookings } from '@/lib/api/contact';
import { updateProfile, changePassword, getAddresses, addAddress, deleteAddress, UserAddress } from '@/lib/api/user';
import { uploadImageToImageKit } from '@/lib/api/upload';
import { formatPrice } from '@/lib/format';
import { brand } from '@/config/brand';

type Tab = 'profile' | 'addresses' | 'orders' | 'bookings';

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  // Address modal / form state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState<UserAddress>({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'PK',
    isDefault: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');

      // Load Orders
      getUserOrders()
        .then((res) => {
          setOrders(res || []);
          setLoadingOrders(false);
        })
        .catch((err) => {
          console.error('Failed to load orders:', err);
          setLoadingOrders(false);
        });

      // Load Bookings
      getMyBookings()
        .then((res) => {
          if (res?.requests) setBookings(res.requests);
        })
        .catch(() => {});

      // Load Addresses
      getAddresses()
        .then((res) => {
          setAddresses(res || []);
        })
        .catch(() => {});
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // ── ImageKit Avatar Upload ────────────────────────────────────────────────
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const uploadResult = await uploadImageToImageKit(file, '/evee-avatars');
      setAvatarUrl(uploadResult.url);

      // Auto-save avatar to profile immediately
      await updateProfile({ avatarUrl: uploadResult.url });
      await refreshUser();
      setProfileSuccess('Profile picture updated successfully!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to upload photo to ImageKit');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Save Profile Details ──────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      await refreshUser();
      setProfileSuccess('Personal details saved successfully.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ── Change Password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setPassSuccess('Password updated successfully. Please use it for future logins.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 5000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  // ── Add Address ───────────────────────────────────────────────────────────
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);

    if (!newAddress.fullName.trim()) return setAddressError('Recipient name is required.');
    if (!newAddress.phone.trim()) return setAddressError('Phone number is required.');
    if (!newAddress.addressLine1.trim()) return setAddressError('Street address is required.');
    if (!newAddress.city.trim()) return setAddressError('City is required.');

    setIsSavingAddress(true);
    try {
      const updated = await addAddress(newAddress);
      setAddresses(updated);
      setShowAddressModal(false);
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'PK',
        isDefault: false,
      });
    } catch (err: any) {
      setAddressError(err.message || 'Failed to add address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // ── Delete Address ────────────────────────────────────────────────────────
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      const updated = await deleteAddress(id);
      setAddresses(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-mono text-lime gap-3">
        <Loader2 className="size-5 animate-spin" />
        <span>Authenticating Crown session...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <Section bg="bg-ink" inner="flex flex-col gap-10 px-[22px] py-12 lg:gap-12 lg:px-16 lg:py-16 max-w-[1240px] mx-auto">
      {/* Top Profile Header Card */}
      <div className="border border-line bg-surface/40 p-6 sm:p-8 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar with ImageKit Upload Button */}
          <div className="relative group size-24 sm:size-28 shrink-0">
            <div className="size-full rounded-full border-2 border-line bg-ink overflow-hidden flex items-center justify-center text-lime font-display text-[32px] shadow-lg">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="size-full object-cover"
                />
              ) : (
                <span>{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Overlay camera button */}
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-mono gap-1 cursor-pointer disabled:cursor-not-allowed"
              title="Upload new profile picture"
            >
              {isUploadingAvatar ? (
                <Loader2 className="size-5 animate-spin text-lime" />
              ) : (
                <>
                  <Camera className="size-5 text-lime" />
                  <span>Change</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Eyebrow>{brand.upper} ATELIER MEMBER</Eyebrow>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-lime/10 text-lime border border-lime/30">
                Verified
              </span>
            </div>
            <h1 className="font-display text-[26px] sm:text-[34px] text-fg leading-tight">
              {user.name}
            </h1>
            <div className="flex items-center gap-4 text-[12px] font-mono text-muted flex-wrap">
              <span>{user.email}</span>
              {user.phone && <span>· {user.phone}</span>}
              <span>· Joined Atelier</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-[42px] items-center gap-2 border border-line bg-surface px-5 font-mono text-[11px] text-muted hover:text-rose-400 hover:border-rose-400/50 transition-colors uppercase tracking-wider rounded"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-line gap-2 sm:gap-6 overflow-x-auto scrollbar-none text-[13px] font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap uppercase tracking-wider ${
            activeTab === 'profile'
              ? 'border-lime text-lime font-semibold'
              : 'border-transparent text-muted hover:text-fg'
          }`}
        >
          <UserIcon className="size-4" />
          <span>Profile & Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap uppercase tracking-wider ${
            activeTab === 'addresses'
              ? 'border-lime text-lime font-semibold'
              : 'border-transparent text-muted hover:text-fg'
          }`}
        >
          <MapPin className="size-4" />
          <span>Delivery Addresses ({addresses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap uppercase tracking-wider ${
            activeTab === 'orders'
              ? 'border-lime text-lime font-semibold'
              : 'border-transparent text-muted hover:text-fg'
          }`}
        >
          <Package className="size-4" />
          <span>Reservations & Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap uppercase tracking-wider ${
            activeTab === 'bookings'
              ? 'border-lime text-lime font-semibold'
              : 'border-transparent text-muted hover:text-fg'
          }`}
        >
          <Calendar className="size-4" />
          <span>Concierge Bookings ({bookings.length})</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: Profile & Security */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="border border-line bg-surface/40 p-6 sm:p-8 rounded-lg flex flex-col gap-6">
            <div className="border-b border-line pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-[20px] text-fg">Personal Details</h2>
                <p className="text-[12px] text-muted">Update your atelier account information.</p>
              </div>
              <Edit3 className="size-4 text-lime" />
            </div>

            {profileSuccess && (
              <div className="bg-lime/10 border border-lime/30 text-lime px-4 py-3 rounded text-[13px] flex items-center gap-2 font-mono">
                <Check className="size-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded text-[13px] flex items-center gap-2 font-mono">
                <AlertCircle className="size-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-[13px] text-fg focus:outline-none focus:border-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                  Email Address (Permanent)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-ink/50 border border-line/60 px-3.5 py-2.5 rounded text-[13px] text-muted cursor-not-allowed font-mono"
                />
                <span className="text-[10px] font-mono text-dim mt-1 block">
                  Email address is linked to your Crown ID and cannot be changed directly.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-[13px] text-fg focus:outline-none focus:border-lime font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="h-[44px] px-6 bg-lime text-night font-body text-[13px] font-semibold rounded hover:bg-[#e0f48f] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingProfile && <Loader2 className="size-4 animate-spin" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="border border-line bg-surface/40 p-6 sm:p-8 rounded-lg flex flex-col gap-6">
            <div className="border-b border-line pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-[20px] text-fg">Security & Password</h2>
                <p className="text-[12px] text-muted">Ensure your account uses a secure 8+ character password.</p>
              </div>
              <KeyRound className="size-4 text-lime" />
            </div>

            {passSuccess && (
              <div className="bg-lime/10 border border-lime/30 text-lime px-4 py-3 rounded text-[13px] flex items-center gap-2 font-mono">
                <Check className="size-4 shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded text-[13px] flex items-center gap-2 font-mono">
                <AlertCircle className="size-4 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-[13px] text-fg focus:outline-none focus:border-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-[13px] text-fg focus:outline-none focus:border-lime"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-ink border border-line px-3.5 py-2.5 rounded text-[13px] text-fg focus:outline-none focus:border-lime"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="h-[44px] px-6 bg-surface border border-line text-fg font-body text-[13px] font-semibold rounded hover:border-lime hover:text-lime transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isChangingPass && <Loader2 className="size-4 animate-spin text-lime" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: Delivery Addresses */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'addresses' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[22px] text-fg">Saved Delivery Destinations</h2>
              <p className="text-[13px] text-muted">Addresses used for dispatching bike reservations, accessories, and parts.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddressModal(true)}
              className="px-4 py-2 bg-lime text-night font-body text-[12px] font-semibold rounded hover:bg-[#e0f48f] transition-colors flex items-center gap-1.5"
            >
              <Plus className="size-4" />
              <span>Add New Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="p-12 text-center border border-line bg-surface/40 rounded flex flex-col items-center justify-center gap-3">
              <MapPin className="size-10 text-dim" />
              <p className="font-display text-[18px] text-fg">No Saved Addresses</p>
              <p className="text-[13px] text-muted max-w-sm">
                Add your primary residence or workplace for rapid checkout and white-glove motorcycle delivery.
              </p>
              <button
                type="button"
                onClick={() => setShowAddressModal(true)}
                className="mt-2 px-5 py-2 border border-line bg-surface text-lime rounded font-mono text-[12px] hover:border-lime transition-colors"
              >
                + Add First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {addresses.map((addr) => (
                <div
                  key={addr._id || addr.id}
                  className="border border-line bg-surface/50 p-6 rounded flex flex-col justify-between gap-4 relative group hover:border-lime/40 transition-colors"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-lime uppercase font-semibold">
                        {addr.label || 'Home'}
                      </span>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-lime/10 text-lime border border-lime/30">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-fg text-[15px]">{addr.fullName}</p>
                    <p className="text-[13px] text-muted leading-relaxed">
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                      <br />
                      {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode || ''}
                      <br />
                      {addr.country || 'PK'}
                    </p>
                    <p className="font-mono text-[12px] text-dim">{addr.phone}</p>
                  </div>

                  <div className="border-t border-line pt-3 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-dim">Verified Delivery Slot</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress((addr._id || addr.id)!)}
                      className="text-muted hover:text-rose-400 p-1.5 rounded transition-colors"
                      title="Delete this address"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal for adding address */}
          {showAddressModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-night border border-line rounded-lg w-full max-w-lg p-6 sm:p-8 flex flex-col gap-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <h3 className="font-display text-[20px] text-fg">Add Delivery Address</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="text-muted hover:text-fg text-[14px] font-mono"
                  >
                    ✕
                  </button>
                </div>

                {addressError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3.5 py-2.5 rounded text-[12px] font-mono">
                    {addressError}
                  </div>
                )}

                <form onSubmit={handleAddAddress} className="flex flex-col gap-3.5 text-[13px]">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                        Recipient Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        placeholder="Aazan Muhammad"
                        className="w-full bg-ink border border-line px-3 py-2 rounded text-fg focus:outline-none focus:border-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="+92 300 1234567"
                        className="w-full bg-ink border border-line px-3 py-2 rounded text-fg focus:outline-none focus:border-lime font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                      Street Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                      placeholder="House / Apartment #, Street"
                      className="w-full bg-ink border border-line px-3 py-2 rounded text-fg focus:outline-none focus:border-lime"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={newAddress.addressLine2 || ''}
                      onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                      placeholder="Sector, Landmark, Floor"
                      className="w-full bg-ink border border-line px-3 py-2 rounded text-fg focus:outline-none focus:border-lime"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Lahore"
                        className="w-full bg-ink border border-line px-3 py-2 rounded text-fg focus:outline-none focus:border-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={newAddress.state || ''}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="Punjab"
                        className="w-full bg-ink border border-line px-3 py-2 rounded text-fg focus:outline-none focus:border-lime"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-muted mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={newAddress.postalCode || ''}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        placeholder="54000"
                        className="w-full bg-ink border border-line px-3 py-2 rounded text-fg focus:outline-none focus:border-lime font-mono"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 mt-2 cursor-pointer text-muted hover:text-fg font-mono text-[12px]">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="accent-lime size-4"
                    />
                    <span>Set as primary default address</span>
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="px-4 py-2 border border-line text-muted rounded text-[12px] font-mono hover:text-fg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAddress}
                      className="px-5 py-2 bg-lime text-night rounded text-[12px] font-semibold hover:bg-[#e0f48f] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSavingAddress && <Loader2 className="size-3.5 animate-spin" />}
                      <span>Save Address</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: Reservations & Orders */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[22px] text-fg">Your Vehicle Reservations & Orders</h2>
              <p className="text-[13px] text-muted">Track production status, delivery timeline, and handover details.</p>
            </div>
            <span className="font-mono text-[11px] text-muted">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
            </span>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center font-mono text-muted text-[13px] border border-line bg-surface/50 rounded flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin text-lime" />
              <span>Fetching order history...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center border border-line bg-surface/40 rounded flex flex-col items-center justify-center gap-4">
              <Package className="size-10 text-dim" />
              <p className="font-display text-[20px] text-fg">No Active Reservations</p>
              <p className="max-w-[400px] text-[13px] text-muted">
                You haven’t reserved any electric motorcycles or accessories yet. Explore our fleet to configure your build slot.
              </p>
              <Link
                href="/products"
                className="mt-2 inline-flex h-[44px] items-center justify-center gap-2 bg-lime text-night px-6 font-body text-[13px] font-semibold hover:bg-[#e0f48f] transition-colors rounded"
              >
                <span>Explore Fleet</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {orders.map((ord) => (
                <div key={ord._id} className="border border-line bg-surface/70 p-6 sm:p-8 rounded-lg flex flex-col gap-6">
                  {/* Header row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4 gap-3">
                    <div>
                      <span className="font-mono text-[10px] text-muted uppercase">Order Reference</span>
                      <p className="font-mono text-[18px] font-bold text-fg">{ord.orderNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 font-mono text-[11px] bg-lime/10 text-lime border border-lime/30 rounded-full font-semibold">
                        STATUS: {ord.orderStatus.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 font-mono text-[11px] bg-surface text-muted border border-line rounded-full">
                        PAYMENT: {ord.paymentStatus.toUpperCase()} ({ord.paymentProvider?.toUpperCase() || 'ONLINE'})
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-line/60">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="py-3.5 flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-3.5">
                          {item.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.productName} className="size-14 object-cover rounded bg-surface border border-line" />
                          )}
                          <div>
                            <p className="font-medium text-fg text-[14px]">{item.productName}</p>
                            <p className="font-mono text-[11px] text-dim">
                              SKU: {item.sku} {item.variantName ? `· ${item.variantName}` : ''} · Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-fg font-semibold text-[14px]">
                          {formatPrice(item.totalPrice / 100, ord.currency || 'PKR')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery destination preview & total */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-line pt-4 gap-4 text-[12px] text-muted">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-lime shrink-0" />
                      <span>
                        Destination: {ord.shippingAddress?.addressLine1}, {ord.shippingAddress?.city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[16px] text-fg">
                      <span className="text-muted text-[12px]">Total Paid:</span>
                      <span className="text-lime font-bold">
                        {formatPrice(ord.grandTotal / 100, ord.currency || 'PKR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: Concierge Bookings */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === 'bookings' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-[22px] text-fg">Test Rides & Concierge Sessions</h2>
              <p className="text-[13px] text-muted">Scheduled appointments and inquiries with Crown Motors experts.</p>
            </div>
            <Link
              href="/contact"
              className="px-4 py-2 bg-lime text-night font-body text-[12px] font-semibold rounded hover:bg-[#e0f48f] transition-colors"
            >
              + Request New Test Ride
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 text-center border border-line bg-surface/40 rounded flex flex-col items-center justify-center gap-3">
              <Calendar className="size-10 text-dim" />
              <p className="font-display text-[18px] text-fg">No Active Bookings</p>
              <p className="text-[13px] text-muted max-w-sm">
                Experience the quiet power of EVee electric motorcycles with a private test ride session.
              </p>
              <Link
                href="/contact"
                className="mt-2 px-5 py-2 border border-line bg-surface text-lime rounded font-mono text-[12px] hover:border-lime transition-colors"
              >
                Schedule Test Ride
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {bookings.map((b) => (
                <div key={b._id} className="border border-line bg-surface/60 p-6 rounded-lg flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-muted uppercase">
                      {b.requestType?.replace('_', ' ')}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      b.status === 'replied'
                        ? 'bg-lime/10 text-lime border border-lime/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {b.status === 'replied' ? 'Slot Confirmed' : b.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-medium text-fg text-[16px]">{b.subject}</h3>
                    <p className="text-[12px] text-muted mt-1 leading-relaxed">{b.message}</p>
                  </div>

                  {/* Confirmed Slot Details from Admin */}
                  {b.adminReplyTime || b.adminReplyLocation ? (
                    <div className="bg-lime/5 border border-lime/20 p-4 rounded flex flex-col gap-2 mt-1">
                      <p className="font-mono text-[10px] text-lime uppercase font-semibold">
                        Confirmed Appointment Slot
                      </p>
                      {b.adminReplyTime && (
                        <div className="flex items-center gap-2 text-[12px] text-fg">
                          <Clock className="size-4 text-lime shrink-0" />
                          <span>{new Date(b.adminReplyTime).toLocaleString('en-PK', { dateStyle: 'full', timeStyle: 'short' })}</span>
                        </div>
                      )}
                      {b.adminReplyLocation && (
                        <div className="flex items-center gap-2 text-[12px] text-fg">
                          <MapPin className="size-4 text-lime shrink-0" />
                          <span>{b.adminReplyLocation}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-dim text-[11px] font-mono mt-1 p-3 bg-ink/40 rounded border border-line/40">
                      <Clock className="size-3.5 shrink-0" />
                      <span>Our concierge team is reviewing schedule availability and will assign your time & location slot shortly.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
