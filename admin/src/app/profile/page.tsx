'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  KeyRound,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/auth';
import { adminApi } from '@/lib/api';
import { uploadImageToImageKit } from '@/lib/upload';

export default function AdminProfilePage() {
  const { admin, refreshAdmin } = useAdminAuth();

  // Profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  useEffect(() => {
    if (admin) {
      setName(admin.name || '');
      setPhone(admin.phone || '');
      setAvatarUrl(admin.avatarUrl || '');
    }
  }, [admin]);

  // ── ImageKit Avatar Upload ────────────────────────────────────────────────
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const res = await uploadImageToImageKit(file, '/evee-admin-avatars');
      setAvatarUrl(res.url);

      // Save directly to user profile
      await adminApi('users/profile', {
        method: 'PATCH',
        body: { avatarUrl: res.url },
      });
      await refreshAdmin();
      setProfileSuccess('Admin avatar updated successfully via ImageKit!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'ImageKit upload failed');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Update Profile ────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      await adminApi('users/profile', {
        method: 'PATCH',
        body: {
          name: name.trim(),
          phone: phone.trim() || undefined,
          avatarUrl: avatarUrl || undefined,
        },
      });
      await refreshAdmin();
      setProfileSuccess('Administrator profile details updated.');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
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

    setChangingPass(true);
    try {
      await adminApi('users/change-password', {
        method: 'POST',
        body: {
          currentPassword,
          newPassword,
        },
      });
      setPassSuccess('Admin password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 5000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-fg tracking-tight">
          Administrator Profile & Security
        </h1>
        <p className="text-[13px] text-muted">
          Manage your executive credentials, root authentication, and operational settings.
        </p>
      </div>

      {/* Overview Card */}
      <div className="bg-night border border-line rounded-xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Avatar with ImageKit Upload */}
          <div className="relative group size-24 sm:size-28 shrink-0">
            <div className="size-full rounded-2xl border-2 border-line bg-surface overflow-hidden flex items-center justify-center text-lime font-bold text-[32px] shadow-lg">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={admin?.name || 'Admin'}
                  className="size-full object-cover"
                />
              ) : (
                <span>{admin?.name?.charAt(0).toUpperCase() || 'A'}</span>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-mono gap-1 cursor-pointer disabled:cursor-not-allowed"
              title="Upload profile picture to ImageKit"
            >
              {uploadingAvatar ? (
                <Loader2 className="size-5 animate-spin text-lime" />
              ) : (
                <>
                  <Camera className="size-5 text-lime" />
                  <span>Upload</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-lime/10 text-lime border border-lime/30 font-semibold flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-lime animate-pulse" />
                Root Administrator
              </span>
              <span className="text-[11px] font-mono text-dim">EVee Atelier Headquarters</span>
            </div>
            <h2 className="text-[24px] font-bold text-fg leading-tight">
              {admin?.name || 'EVee Admin'}
            </h2>
            <div className="flex items-center gap-3 text-[12px] font-mono text-muted flex-wrap">
              <span>{admin?.email || 'admin@evee.pk'}</span>
              {admin?.phone && <span>· {admin.phone}</span>}
              <span>· Role: {admin?.role?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 border-t md:border-t-0 border-line pt-4 md:pt-0">
          <div className="bg-surface/80 border border-line px-3.5 py-2 rounded-lg text-right">
            <span className="text-[10px] font-mono text-dim uppercase block">Security Clearance</span>
            <span className="text-[12px] font-mono text-lime font-bold">Level 4 · Unrestricted Access</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Password */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Form */}
        <div className="bg-night border border-line rounded-xl p-6 sm:p-8 flex flex-col gap-6">
          <div className="border-b border-line pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[18px] font-bold text-fg">Administrator Details</h3>
              <p className="text-[12px] text-muted">Update your display identity and contact info.</p>
            </div>
            <UserIcon className="size-5 text-lime" />
          </div>

          {profileSuccess && (
            <div className="bg-lime/10 border border-lime/30 text-lime px-4 py-3 rounded-lg text-[13px] flex items-center gap-2 font-mono">
              <Check className="size-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-[13px] flex items-center gap-2 font-mono">
              <AlertCircle className="size-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 text-[13px]">
            <div>
              <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="EVee Admin"
                className="w-full bg-surface border border-line px-3.5 py-2.5 rounded text-fg focus:outline-none focus:border-lime"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                Admin Email (Protected)
              </label>
              <input
                type="email"
                disabled
                value={admin?.email || ''}
                className="w-full bg-surface/40 border border-line/60 px-3.5 py-2.5 rounded text-muted cursor-not-allowed font-mono"
              />
              <span className="text-[10px] font-mono text-dim mt-1 block">
                Primary system email cannot be modified from the dashboard.
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                Executive Phone / Hot line
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 0000000"
                className="w-full bg-surface border border-line px-3.5 py-2.5 rounded text-fg focus:outline-none focus:border-lime font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="h-[42px] px-6 bg-lime text-night font-semibold rounded text-[13px] hover:bg-[#e0f48f] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {savingProfile && <Loader2 className="size-4 animate-spin" />}
                <span>Save Admin Details</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-night border border-line rounded-xl p-6 sm:p-8 flex flex-col gap-6">
          <div className="border-b border-line pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[18px] font-bold text-fg">Update Security Password</h3>
              <p className="text-[12px] text-muted">Rotate your master administrative credentials regularly.</p>
            </div>
            <KeyRound className="size-5 text-lime" />
          </div>

          {passSuccess && (
            <div className="bg-lime/10 border border-lime/30 text-lime px-4 py-3 rounded-lg text-[13px] flex items-center gap-2 font-mono">
              <Check className="size-4 shrink-0" />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-lg text-[13px] flex items-center gap-2 font-mono">
              <AlertCircle className="size-4 shrink-0" />
              <span>{passError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 text-[13px]">
            <div>
              <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface border border-line px-3.5 py-2.5 rounded text-fg focus:outline-none focus:border-lime"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                New Password (Minimum 8 Characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface border border-line px-3.5 py-2.5 rounded text-fg focus:outline-none focus:border-lime"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-muted mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-surface border border-line px-3.5 py-2.5 rounded text-fg focus:outline-none focus:border-lime"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={changingPass}
                className="h-[42px] px-6 bg-surface border border-line text-fg font-semibold rounded text-[13px] hover:border-lime hover:text-lime transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {changingPass && <Loader2 className="size-4 animate-spin text-lime" />}
                <span>Rotate Master Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-night border border-line rounded-xl p-6 sm:p-8 flex flex-col gap-4">
        <h3 className="text-[16px] font-bold text-fg flex items-center gap-2">
          <ShieldCheck className="size-4 text-lime" />
          <span>Active Role Privileges</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface/50 border border-line p-3.5 rounded text-[12px] flex flex-col gap-1">
            <span className="font-mono text-[10px] text-lime uppercase font-semibold">Catalog Control</span>
            <span className="text-muted">Create, edit, and adjust bikes, scooters & accessories</span>
          </div>
          <div className="bg-surface/50 border border-line p-3.5 rounded text-[12px] flex flex-col gap-1">
            <span className="font-mono text-[10px] text-lime uppercase font-semibold">Inventory Manager</span>
            <span className="text-muted">Adjust stock counts, log warehouse shipment events</span>
          </div>
          <div className="bg-surface/50 border border-line p-3.5 rounded text-[12px] flex flex-col gap-1">
            <span className="font-mono text-[10px] text-lime uppercase font-semibold">Order Fulfillment</span>
            <span className="text-muted">Confirm payments, advance dispatch, assign tracking</span>
          </div>
          <div className="bg-surface/50 border border-line p-3.5 rounded text-[12px] flex flex-col gap-1">
            <span className="font-mono text-[10px] text-lime uppercase font-semibold">Concierge Scheduling</span>
            <span className="text-muted">Assign test ride slots, locations, and direct responses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
