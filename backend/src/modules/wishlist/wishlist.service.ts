import mongoose from 'mongoose';
import { Wishlist, Product, IWishlist } from '../../database/models';
import { NotFoundError } from '../../common/errors/AppError';

export async function getWishlist(userId: string): Promise<IWishlist> {
  let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: new mongoose.Types.ObjectId(userId),
      products: [],
    });
  }
  return wishlist;
}

export async function addToWishlist(userId: string, productId: string): Promise<IWishlist> {
  const product = await Product.findById(productId);
  if (!product) throw new NotFoundError('Product');

  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = new Wishlist({
      user: new mongoose.Types.ObjectId(userId),
      products: [],
    });
  }

  const prodObjId = new mongoose.Types.ObjectId(productId);
  if (!wishlist.products.some((p) => p.toString() === productId)) {
    wishlist.products.push(prodObjId as any);
    await wishlist.save();
  }

  return wishlist.populate('products');
}

export async function removeFromWishlist(userId: string, productId: string): Promise<IWishlist> {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: new mongoose.Types.ObjectId(userId),
      products: [],
    });
  }

  wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  await wishlist.save();
  return wishlist.populate('products');
}
