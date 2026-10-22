import { api } from './client';
import type { User } from './types';

export interface UserAddress {
  _id?: string;
  id?: string;
  label?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update current logged-in user profile (name, phone, avatarUrl)
 */
export async function updateProfile(payload: UpdateProfilePayload): Promise<User> {
  const data: any = await api('users/profile', {
    method: 'PATCH',
    body: payload,
  });
  return data?.user || data;
}

/**
 * Change user password
 */
export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  return api<{ message: string }>('users/change-password', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Get user addresses
 */
export async function getAddresses(): Promise<UserAddress[]> {
  const data: any = await api('users/addresses');
  return data?.addresses || data || [];
}

/**
 * Add a new delivery address
 */
export async function addAddress(address: UserAddress): Promise<UserAddress[]> {
  const data: any = await api('users/addresses', {
    method: 'POST',
    body: address,
  });
  return data?.addresses || data;
}

/**
 * Update existing address
 */
export async function updateAddress(addressId: string, address: Partial<UserAddress>): Promise<UserAddress[]> {
  const data: any = await api(`users/addresses/${encodeURIComponent(addressId)}`, {
    method: 'PATCH',
    body: address,
  });
  return data?.addresses || data;
}

/**
 * Delete address
 */
export async function deleteAddress(addressId: string): Promise<UserAddress[]> {
  const data: any = await api(`users/addresses/${encodeURIComponent(addressId)}`, {
    method: 'DELETE',
  });
  return data?.addresses || data;
}
