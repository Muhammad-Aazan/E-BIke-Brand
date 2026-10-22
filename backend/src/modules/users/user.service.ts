import { User, Order, IUser, IAddress } from '../../database/models';
import { NotFoundError } from '../../common/errors/AppError';
import { paginationMeta, PaginationMeta } from '../../common/utils/response';

export async function getProfile(userId: string): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function updateProfile(
  userId: string,
  data: { name?: string; phone?: string; avatarUrl?: string }
): Promise<IUser> {
  const user = await User.findByIdAndUpdate(userId, data, { new: true, runValidators: true });
  if (!user) throw new NotFoundError('User');
  return user;
}

export async function changePassword(
  userId: string,
  currentPass: string,
  newPass: string
): Promise<void> {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw new NotFoundError('User');

  const bcrypt = await import('bcryptjs');
  const valid = await bcrypt.compare(currentPass, user.passwordHash);
  if (!valid) {
    const { ValidationError } = await import('../../common/errors/AppError');
    throw new ValidationError('Current password is incorrect');
  }

  const { config } = await import('../../config');
  user.passwordHash = await bcrypt.hash(newPass, config.bcrypt.saltRounds);
  await user.save();
}

export async function getAddresses(userId: string): Promise<IAddress[]> {
  const user = await User.findById(userId).select('addresses');
  if (!user) throw new NotFoundError('User');
  return user.addresses;
}

export async function addAddress(userId: string, address: Partial<IAddress>): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');

  if (address.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  user.addresses.push(address as IAddress);
  return user.save();
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: Partial<IAddress>
): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');

  const addrIdx = user.addresses.findIndex((a) => a._id?.toString() === addressId);
  if (addrIdx < 0) throw new NotFoundError('Address');

  if (data.isDefault) {
    user.addresses.forEach((a) => {
      a.isDefault = false;
    });
  }

  Object.assign(user.addresses[addrIdx], data);
  return user.save();
}

export async function deleteAddress(userId: string, addressId: string): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');
  user.addresses = user.addresses.filter((a) => a._id?.toString() !== addressId) as any;
  return user.save();
}

export async function getOrderHistory(
  userId: string,
  page: number,
  limit: number
): Promise<{ orders: unknown[]; meta: PaginationMeta }> {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-statusHistory -metadata'),
    Order.countDocuments({ user: userId }),
  ]);
  return { orders, meta: paginationMeta(page, limit, total) };
}

export async function getOrderDetail(userId: string, orderNumber: string): Promise<unknown> {
  const order = await Order.findOne({ orderNumber, user: userId });
  if (!order) throw new NotFoundError('Order');
  return order;
}
